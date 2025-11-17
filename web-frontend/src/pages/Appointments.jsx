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

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      // Find the selected doctor to get their doctorId (not MongoDB id)
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
      if (!selectedDoctor || !selectedDoctor.doctorId) {
        setAvailableSlots([]);
        return;
      }
      const slots = await getAvailableSlots(selectedDoctor.doctorId, formData.date);
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

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'N/A';
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.name || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rendez-vous</h1>
          <p className="text-gray-600">Gestion des rendez-vous</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouveau rendez-vous
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Form */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
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
                <option key={patient.id} value={patient.id}>{patient.name}</option>
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
                <option key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.specialization}</option>
              ))}
            </Select>

            {/* Show doctor working days info */}
            {formData.doctorId && (() => {
              const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
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
                const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
                
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Heure <span className="text-red-500">*</span>
                {formData.doctorId && formData.date && availableSlots.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({availableSlots.length} créneau{availableSlots.length > 1 ? 'x' : ''} disponible{availableSlots.length > 1 ? 's' : ''})
                  </span>
                )}
              </label>
              {!formData.doctorId ? (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
                  Veuillez d'abord sélectionner un médecin
                </div>
              ) : !formData.date ? (
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
                  Veuillez d'abord sélectionner une date
                </div>
              ) : loadingSlots ? (
                <div className="p-4 border border-gray-300 rounded-lg">
                  <Skeleton variant="text" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-800 text-sm">
                  Aucun créneau disponible pour cette date. Le médecin ne travaille peut-être pas ce jour ou tous les créneaux sont déjà réservés.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, time: slot })}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        formData.time === slot
                          ? 'bg-blue-600 text-white'
                          : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
            <div className="space-y-3">
              <Select
                label="Médecin"
                value={filters.doctorId}
                onChange={(e) => setFilters({ ...filters, doctorId: e.target.value })}
              >
                <option value="">Tous les médecins</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendez-vous à venir</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="text" />
                ))}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-400" />
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
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{getPatientName(apt.patientId)}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{getDoctorName(apt.doctorId)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
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
                          <p className="mt-2 text-sm text-gray-600 italic">"{apt.motif}"</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={getStatusBadge(apt.status)}>
                          {apt.status}
                        </Badge>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(apt)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {apt.status === 'PLANIFIE' && (
                            <button
                              onClick={() => setCancelConfirm(apt)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
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
        <p className="text-gray-700 mb-6">
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
