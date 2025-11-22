import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientByPatientId,
} from '../api/patients';
import { useToast } from '../components/ui/Toast';
import Skeleton from '../components/ui/Skeleton';
import { format } from 'date-fns';

const Patients = () => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientIdFilter, setPatientIdFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      showToast('Erreur lors du chargement des patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (term) => {
    if (!term.trim()) {
      loadPatients();
      return;
    }
    try {
      setLoading(true);
      const data = await searchPatients(term);
      setPatients(data);
    } catch (error) {
      showToast('Erreur lors de la recherche', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePatientIdSearch = useCallback(async (value) => {
    if (!value.trim()) {
      loadPatients();
      return;
    }
    try {
      setLoading(true);
      const patient = await getPatientByPatientId(value.trim());
      setPatients(patient ? [patient] : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setPatients([]);
      } else {
        showToast('Erreur lors de la recherche par identifiant patient', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handlePatientIdSearch(patientIdFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [patientIdFilter, handlePatientIdSearch]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'La date de naissance est requise';
    if (!formData.gender) newErrors.gender = 'Le genre est requis';
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editingPatient) {
        await updatePatient(editingPatient.id, formData);
        showToast('Patient modifié avec succès', 'success');
      } else {
        await createPatient(formData);
        showToast('Patient ajouté avec succès', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      loadPatients();
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deletePatient(deleteConfirm.id);
      showToast('Patient supprimé avec succès', 'success');
      setDeleteConfirm(null);
      loadPatients();
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
    });
    setEditingPatient(null);
    setErrors({});
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patients</h1>
          <p className="text-gray-600">Gestion des patients</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouveau patient
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Filtrer par Patient ID (ex: P1001)..."
              value={patientIdFilter}
              onChange={(e) => setPatientIdFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
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
        ) : patients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Aucun patient trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Patient ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nom</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Téléphone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date de naissance</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, index) => (
                  <motion.tr
                    key={patient.id || patient.patientId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row-hover border-b border-gray-100"
                  >
                    <td className="py-3 px-4 text-sm font-mono text-gray-700">{patient.patientId || '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{patient.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.phone}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{patient.email || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(patient)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingPatient ? 'Modifier le patient' : 'Nouveau patient'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom complet"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date de naissance"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              error={errors.dateOfBirth}
              required
            />
            <Select
              label="Genre"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              error={errors.gender}
              required
            >
              <option value="">Sélectionner</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
              <option value="A">Autre</option>
            </Select>
          </div>
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
          <Input
            label="Adresse"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement...' : editingPatient ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmer la suppression"
        size="sm"
      >
        <p className="text-gray-700 mb-6">
          Êtes-vous sûr de vouloir supprimer le patient <strong>{deleteConfirm?.name}</strong> ?
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

export default Patients;
