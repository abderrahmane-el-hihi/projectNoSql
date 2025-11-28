import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Stethoscope, Plus, Edit, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';
import { getAppointments, createAppointment, updateAppointment, cancelAppointment, getAvailableSlots } from '../api/appointments';
import { getPatients } from '../api/patients';
import { getDoctors } from '../api/doctors';
import { useToast } from '../components/ui/Toast';
import Skeleton from '../components/ui/Skeleton';
import { format } from 'date-fns';

const Appointments = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    motif: '',
  });
  const [filters, setFilters] = useState({
    doctorId: '',
    date: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.doctorId && formData.date) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, time: '' }));
    }
  }, [formData.doctorId, formData.date]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appts, pats, docs] = await Promise.all([
        getAppointments(),
        getPatients(),
        getDoctors(),
      ]);
      setAppointments(appts);
      setPatients(pats);
      setDoctors(docs);
    } catch (error) {
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const findPatientByIdentifier = (identifier) => {
    if (!identifier) return undefined;
    return patients.find((p) => p.id === identifier || p.patientId === identifier);
  };

  const findDoctorByIdentifier = (identifier) => {
    if (!identifier) return undefined;
    return doctors.find((d) => d.id === identifier || d.doctorId === identifier);
  };

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const selectedDoctor = findDoctorByIdentifier(formData.doctorId);
      if (!selectedDoctor) {
        setAvailableSlots([]);
        return;
      }
      const doctorKey = selectedDoctor.doctorId || selectedDoctor.id;
      const slots = await getAvailableSlots(doctorKey, formData.date);
      setAvailableSlots(slots);
    } catch (error) {
      showToast('Erreur lors du chargement des créneaux disponibles', 'error');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.date + 'T' + apt.time);
      return aptDate >= new Date();
    });

    if (filters.doctorId) {
      filtered = filtered.filter(apt => apt.doctorId === filters.doctorId);
    }
    if (filters.date) {
      filtered = filtered.filter(apt => apt.date === filters.date);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateA - dateB;
    });
  }, [appointments, filters]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientId) newErrors.patientId = 'Le patient est requis';
    if (!formData.doctorId) newErrors.doctorId = 'Le médecin est requis';
    if (!formData.date) newErrors.date = 'La date est requise';
    if (!formData.time) newErrors.time = 'L\'heure est requise';
    if (!formData.motif?.trim()) newErrors.motif = 'Le motif est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, formData);
        showToast('Rendez-vous modifié avec succès', 'success');
      } else {
        await createAppointment(formData);
        showToast('Rendez-vous créé avec succès', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId || '',
      doctorId: appointment.doctorId || '',
      date: appointment.date || '',
      time: appointment.time || '',
      motif: appointment.motif || '',
    });
    setIsModalOpen(true);
  };

  const handleCancel = async () => {
    try {
      await cancelAppointment(cancelConfirm.id);
      showToast('Rendez-vous annulé avec succès', 'success');
      setCancelConfirm(null);
      loadData();
    } catch (error) {
      showToast('Erreur lors de l\'annulation', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      motif: '',
    });
    setEditingAppointment(null);
    setErrors({});
    setAvailableSlots([]);
  };

  const getStatusBadge = (status) => {
    const variants = {
      PLANIFIE: 'primary',
      TERMINE: 'success',
      ANNULE: 'danger',
    };
    return variants[status] || 'default';
  };

  const getPatientName = (patientId) => findPatientByIdentifier(patientId)?.name || 'N/A';

  const getDoctorName = (doctorId) => findDoctorByIdentifier(doctorId)?.name || 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Rendez-vous</h1>
          <p className="text-[var(--text-muted)]">Gestion des rendez-vous</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouveau rendez-vous
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Form */}
        <Card>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-300" />
            Créer un rendez-vous
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Patient"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value, time: '' })}
              error={errors.patientId}
              required
            >
              <option value="">Sélectionner un patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.patientId || patient.id}>{patient.name}</option>
              ))}
            </Select>

            <Select
              label="Médecin"
              value={formData.doctorId}
              onChange={(e) => {
                setFormData({ ...formData, doctorId: e.target.value, date: '', time: '' });
                setAvailableSlots([]);
              }}
              error={errors.doctorId}
              required
            >
              <option value="">Sélectionner un médecin</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.doctorId || doctor.id}>{doctor.name} - {doctor.specialization}</option>
              ))}
            </Select>

            {/* Show doctor working days info */}
            {formData.doctorId && (() => {
              const selectedDoctor = findDoctorByIdentifier(formData.doctorId);
              if (selectedDoctor?.workingDays && selectedDoctor.workingDays.length > 0) {
                // workingDays are already in French from the API transformation
                const workingDaysFr = selectedDoctor.workingDays.join(', ');
                return (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <strong>Jours de travail:</strong> {workingDaysFr}
                  </div>
                );
              }
              return null;
            })()}

            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => {
                const selectedDate = e.target.value;
                const selectedDoctor = findDoctorByIdentifier(formData.doctorId);
                
                // Validate if date is a working day
                if (selectedDoctor?.workingDays && selectedDoctor.workingDays.length > 0) {
                  const dateObj = new Date(selectedDate + 'T00:00:00');
                  const dayIndex = dateObj.getDay();
                  // Map to French day names (since workingDays are stored in French in frontend)
                  const dayNamesFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                  const dayOfWeekFr = dayNamesFr[dayIndex];
                  
                  // Check if the day is in the doctor's working days (which are in French)
                  if (!selectedDoctor.workingDays.includes(dayOfWeekFr)) {
                    setErrors(prev => ({
                      ...prev,
                      date: `Le médecin ne travaille pas le ${dayOfWeekFr}`
                    }));
                    return;
                  }
                }
                
                setFormData({ ...formData, date: selectedDate, time: '' });
                setErrors(prev => ({ ...prev, date: '' }));
              }}
              error={errors.date}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
              disabled={!formData.doctorId}
            />

            <div>
              <label className="block text-sm font-semibold text-[var(--text-muted)] mb-1.5">
                Heure <span className="text-red-500">*</span>
                {formData.doctorId && formData.date && availableSlots.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
                    ({availableSlots.length} créneau{availableSlots.length > 1 ? 'x' : ''} disponible{availableSlots.length > 1 ? 's' : ''})
                  </span>
                )}
              </label>
              {!formData.doctorId ? (
                <div className="p-4 border border-[var(--border-muted)] rounded-xl bg-[var(--surface-strong)] text-[var(--text-muted)] text-sm">
                  Veuillez d'abord sélectionner un médecin
                </div>
              ) : !formData.date ? (
                <div className="p-4 border border-[var(--border-muted)] rounded-xl bg-[var(--surface-strong)] text-[var(--text-muted)] text-sm">
                  Veuillez d'abord sélectionner une date
                </div>
              ) : loadingSlots ? (
                <div className="p-4 border border-[var(--border-muted)] rounded-xl bg-[var(--surface-strong)]">
                  <Skeleton variant="text" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 border border-yellow-300 rounded-xl bg-yellow-50 text-yellow-800 text-sm dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:text-yellow-50">
                  Aucun créneau disponible pour cette date. Le médecin ne travaille peut-être pas ce jour ou tous les créneaux sont déjà réservés.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, time: slot })}
                      className={`p-2 rounded-lg text-sm font-medium transition-all border ${
                        formData.time === slot
                          ? 'bg-purple-600 text-white shadow-[0_12px_28px_rgba(126,34,206,0.28)] border-transparent'
                          : 'bg-[var(--surface-strong)] text-[var(--text-primary)] border-[var(--border-muted)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>

            <Textarea
              label="Motif"
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              error={errors.motif}
              rows={3}
              required
            />

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Enregistrement...' : editingAppointment ? 'Modifier' : 'Créer le rendez-vous'}
            </Button>
          </form>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Filtres</h3>
            <div className="space-y-3">
              <Select
                label="Médecin"
                value={filters.doctorId}
                onChange={(e) => setFilters({ ...filters, doctorId: e.target.value })}
              >
                <option value="">Tous les médecins</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.doctorId || doctor.id}>{doctor.name}</option>
                ))}
              </Select>
              <Input
                label="Date"
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>
          </Card>

          {/* Appointments Table */}
          <Card>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Rendez-vous à venir</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="text" />
                ))}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-[var(--text-subtle)]" />
                <p>Aucun rendez-vous trouvé</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border border-[var(--border-muted)] rounded-xl hover:border-[var(--border-strong)] hover:shadow-[0_10px_28px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] transition-all bg-[var(--surface-strong)]/70"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-[var(--text-subtle)]" />
                          <span className="font-medium text-[var(--text-primary)]">{getPatientName(apt.patientId)}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Stethoscope className="w-4 h-4 text-[var(--text-subtle)]" />
                          <span className="text-sm text-[var(--text-muted)]">{getDoctorName(apt.doctorId)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {apt.date ? format(new Date(apt.date), 'dd/MM/yyyy') : 'N/A'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {apt.time || 'N/A'}
                          </div>
                        </div>
                        {apt.motif && (
                          <p className="mt-2 text-sm text-[var(--text-muted)] italic">"{apt.motif}"</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={getStatusBadge(apt.status)}>
                          {apt.status}
                        </Badge>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(apt)}
                            className="p-1.5 text-primary-600 dark:text-primary-300 hover:bg-[var(--primary-soft)] rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {apt.status === 'PLANIFIE' && (
                            <button
                              onClick={() => setCancelConfirm(apt)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/15 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Patient"
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            error={errors.patientId}
            required
          >
            <option value="">Sélectionner un patient</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>{patient.name}</option>
            ))}
          </Select>

          <Select
            label="Médecin"
            value={formData.doctorId}
            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
            error={errors.doctorId}
            required
          >
            <option value="">Sélectionner un médecin</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
            ))}
          </Select>

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={errors.date}
            required
          />

          <Input
            label="Heure"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            error={errors.time}
            required
          />

          <Textarea
            label="Motif"
            value={formData.motif}
            onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
            error={errors.motif}
            rows={3}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation */}
      <Modal
        isOpen={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        title="Annuler le rendez-vous"
        size="sm"
      >
        <p className="text-[var(--text-muted)] mb-6">
          Êtes-vous sûr de vouloir annuler ce rendez-vous ?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setCancelConfirm(null)}>
            Non
          </Button>
          <Button variant="danger" onClick={handleCancel}>
            Oui, annuler
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
