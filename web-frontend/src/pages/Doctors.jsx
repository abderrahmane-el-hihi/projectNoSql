import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Stethoscope } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../api/doctors';
import { useToast } from '../components/ui/Toast';
import Skeleton from '../components/ui/Skeleton';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const Doctors = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    workingDays: [],
    workingHours: {
      morning: { start: '09:00', end: '12:00' },
      afternoon: { start: '14:00', end: '17:00' },
    },
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const specialties = useMemo(() => {
    const unique = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];
    return unique.sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let filtered = doctors;
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (specialtyFilter) {
      filtered = filtered.filter(d => d.specialization === specialtyFilter);
    }
    return filtered;
  }, [doctors, searchTerm, specialtyFilter]);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await getDoctors();
      setDoctors(data);
    } catch (error) {
      showToast('Erreur lors du chargement des médecins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.specialization.trim()) newErrors.specialization = 'La spécialité est requise';
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (formData.workingDays.length === 0) {
      newErrors.workingDays = 'Au moins un jour de travail est requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      // Ensure workingHours has the correct structure
      const doctorData = {
        ...formData,
        workingDays: formData.workingDays,
        workingHours: formData.workingHours || {
          morning: { start: '09:00', end: '12:00' },
          afternoon: { start: '14:00', end: '17:00' },
        },
      };
      
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, doctorData);
        showToast('Médecin modifié avec succès', 'success');
      } else {
        await createDoctor(doctorData);
        showToast('Médecin ajouté avec succès', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      loadDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Erreur lors de l\'enregistrement';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    // Ensure workingHours has the correct structure
    const workingHours = doctor.workingHours || {
      morning: { start: '09:00', end: '12:00' },
      afternoon: { start: '14:00', end: '17:00' },
    };
    // Ensure nested structure exists
    const safeWorkingHours = {
      morning: {
        start: workingHours.morning?.start || '09:00',
        end: workingHours.morning?.end || '12:00',
      },
      afternoon: {
        start: workingHours.afternoon?.start || '14:00',
        end: workingHours.afternoon?.end || '17:00',
      },
    };
    
    setFormData({
      name: doctor.name || '',
      specialization: doctor.specialization || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      workingDays: doctor.workingDays || [],
      workingHours: safeWorkingHours,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteDoctor(deleteConfirm.id);
      showToast('Médecin supprimé avec succès', 'success');
      setDeleteConfirm(null);
      loadDoctors();
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const toggleWorkingDay = (day) => {
    setFormData({
      ...formData,
      workingDays: formData.workingDays.includes(day)
        ? formData.workingDays.filter(d => d !== day)
        : [...formData.workingDays, day],
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      email: '',
      phone: '',
      workingDays: [],
      workingHours: {
        morning: { start: '09:00', end: '12:00' },
        afternoon: { start: '14:00', end: '17:00' },
      },
    });
    setEditingDoctor(null);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Médecins</h1>
          <p className="text-[var(--text-muted)]">Gestion des médecins</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouveau médecin
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl bg-[var(--surface-strong)] text-[var(--text-primary)] border-[var(--border-muted)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--border-strong)] shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
            />
          </div>
          <Select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          >
            <option value="">Toutes les spécialités</option>
            {specialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="text" />
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <Stethoscope className="w-12 h-12 mx-auto mb-3 text-[var(--text-subtle)]" />
            <p>Aucun médecin trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-muted)]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-muted)]">Nom</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-muted)]">Spécialité</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-muted)]">Téléphone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-muted)]">Jours de travail</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor, index) => (
                  <motion.tr
                    key={doctor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row-hover border-b border-[var(--border-muted)]"
                  >
                    <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{doctor.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="primary">{doctor.specialization}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-muted)]">{doctor.phone}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(doctor.workingDays || []).map(day => (
                          <Badge key={day} variant="default" className="text-xs">
                            {day.substring(0, 3)}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="p-2 text-primary-600 dark:text-primary-300 hover:bg-[var(--primary-soft)] rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(doctor)}
                          className="p-2 text-danger-600 hover:bg-red-50 dark:hover:bg-danger-500/15 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingDoctor ? 'Modifier le médecin' : 'Nouveau médecin'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom complet"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="Spécialité"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            error={errors.specialization}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />
          </div>

          {/* Working Days */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Jours de travail <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWorkingDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    formData.workingDays.includes(day)
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.workingDays && (
              <p className="mt-1 text-sm text-red-600">{errors.workingDays}</p>
            )}
          </div>

          {/* Working Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Matin</label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={formData.workingHours?.morning?.start || '09:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    workingHours: {
                      ...(formData.workingHours || {}),
                      morning: { 
                        ...(formData.workingHours?.morning || {}), 
                        start: e.target.value 
                      },
                      afternoon: formData.workingHours?.afternoon || { start: '14:00', end: '17:00' }
                    }
                  })}
                />
                <Input
                  type="time"
                  value={formData.workingHours?.morning?.end || '12:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    workingHours: {
                      ...(formData.workingHours || {}),
                      morning: { 
                        ...(formData.workingHours?.morning || {}), 
                        end: e.target.value 
                      },
                      afternoon: formData.workingHours?.afternoon || { start: '14:00', end: '17:00' }
                    }
                  })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Après-midi</label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={formData.workingHours?.afternoon?.start || '14:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    workingHours: {
                      ...(formData.workingHours || {}),
                      morning: formData.workingHours?.morning || { start: '09:00', end: '12:00' },
                      afternoon: { 
                        ...(formData.workingHours?.afternoon || {}), 
                        start: e.target.value 
                      }
                    }
                  })}
                />
                <Input
                  type="time"
                  value={formData.workingHours?.afternoon?.end || '17:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    workingHours: {
                      ...(formData.workingHours || {}),
                      morning: formData.workingHours?.morning || { start: '09:00', end: '12:00' },
                      afternoon: { 
                        ...(formData.workingHours?.afternoon || {}), 
                        end: e.target.value 
                      }
                    }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement...' : editingDoctor ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmer la suppression"
        size="sm"
      >
        <p className="text-[var(--text-muted)] mb-6">
          Êtes-vous sûr de vouloir supprimer le médecin <strong>{deleteConfirm?.name}</strong> ?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Doctors;
