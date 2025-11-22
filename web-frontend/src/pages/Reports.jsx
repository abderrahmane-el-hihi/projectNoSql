import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Stethoscope, BarChart3, FileText, FileDown } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getAppointmentsByDate, getAppointmentsPerDoctor, getAppointmentsPerSpecialty, getFrequentPatients } from '../api/reports';
import { reportsAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { format } from 'date-fns';

const Reports = () => {
  const { showToast } = useToast();
  
  // Section 1: Appointments by Date
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [appointmentsByDate, setAppointmentsByDate] = useState([]);
  const [loadingByDate, setLoadingByDate] = useState(false);

  // Section 2: Appointments per Doctor
  const [doctorDateRange, setDoctorDateRange] = useState({
    from: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [appointmentsPerDoctor, setAppointmentsPerDoctor] = useState([]);
  const [loadingPerDoctor, setLoadingPerDoctor] = useState(false);

  // Section 3: Appointments per Specialty
  const [specialtyDateRange, setSpecialtyDateRange] = useState({
    from: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [appointmentsPerSpecialty, setAppointmentsPerSpecialty] = useState([]);
  const [loadingPerSpecialty, setLoadingPerSpecialty] = useState(false);

  // Section 4: Frequent Patients
  const [frequentPatientsFilter, setFrequentPatientsFilter] = useState({
    from: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    minCount: 2,
  });
  const [frequentPatients, setFrequentPatients] = useState([]);
  const [loadingFrequent, setLoadingFrequent] = useState(false);
  const [exporting, setExporting] = useState({ pdf: false, docx: false });

  const loadAppointmentsByDate = async () => {
    try {
      setLoadingByDate(true);
      const data = await getAppointmentsByDate(dateFilter);
      setAppointmentsByDate(data);
    } catch (error) {
      showToast('Erreur lors du chargement des rendez-vous', 'error');
    } finally {
      setLoadingByDate(false);
    }
  };

  const loadAppointmentsPerDoctor = async () => {
    try {
      setLoadingPerDoctor(true);
      const data = await getAppointmentsPerDoctor(doctorDateRange.from, doctorDateRange.to);
      setAppointmentsPerDoctor(data);
    } catch (error) {
      showToast('Erreur lors du chargement des statistiques', 'error');
    } finally {
      setLoadingPerDoctor(false);
    }
  };

  const loadAppointmentsPerSpecialty = async () => {
    try {
      setLoadingPerSpecialty(true);
      const data = await getAppointmentsPerSpecialty(specialtyDateRange.from, specialtyDateRange.to);
      setAppointmentsPerSpecialty(data);
    } catch (error) {
      showToast('Erreur lors du chargement des statistiques', 'error');
    } finally {
      setLoadingPerSpecialty(false);
    }
  };

  const loadFrequentPatients = async () => {
    try {
      setLoadingFrequent(true);
      const data = await getFrequentPatients(frequentPatientsFilter.from, frequentPatientsFilter.minCount);
      setFrequentPatients(data);
    } catch (error) {
      showToast('Erreur lors du chargement des patients fréquents', 'error');
    } finally {
      setLoadingFrequent(false);
    }
  };

  const buildExportParams = () => ({
    date: dateFilter,
    doctorFrom: doctorDateRange.from,
    doctorTo: doctorDateRange.to,
    specialtyFrom: specialtyDateRange.from,
    specialtyTo: specialtyDateRange.to,
    frequentFrom: frequentPatientsFilter.from,
    frequentMin: frequentPatientsFilter.minCount,
  });

  const exportReport = async (format) => {
    setExporting((prev) => ({ ...prev, [format]: true }));
    try {
      const params = buildExportParams();
      const request = format === 'pdf' ? reportsAPI.exportPdf(params) : reportsAPI.exportDocx(params);
      const response = await request;
      const blobType = format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: blobType }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-${Date.now()}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast(`Rapport ${format.toUpperCase()} téléchargé`, 'success');
    } catch (error) {
      showToast("Erreur lors de l'export du rapport", 'error');
    } finally {
      setExporting((prev) => ({ ...prev, [format]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PLANIFIE: 'primary',
      TERMINE: 'success',
      ANNULE: 'danger',
    };
    return variants[status] || 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports</h1>
          <p className="text-gray-600">Statistiques et analyses</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => exportReport('pdf')}
            disabled={exporting.pdf}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {exporting.pdf ? 'Export...' : 'Exporter PDF'}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportReport('docx')}
            disabled={exporting.docx}
            className="flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            {exporting.docx ? 'Export...' : 'Exporter DOCX'}
          </Button>
        </div>
      </div>

      {/* Section 1: Appointments by Date */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Rendez-vous d'un jour donné
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Consultez tous les rendez-vous pour une date spécifique
        </p>
        <div className="flex gap-3 mb-4">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={loadAppointmentsByDate} disabled={loadingByDate}>
            {loadingByDate ? 'Chargement...' : 'Charger'}
          </Button>
        </div>
        {loadingByDate ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" />
            ))}
          </div>
        ) : appointmentsByDate.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun rendez-vous pour cette date</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Patient</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Médecin</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Heure</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsByDate.map((apt, index) => (
                  <motion.tr
                    key={apt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row-hover border-b border-gray-100"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">{apt.patientName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{apt.doctorName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{apt.time || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadge(apt.status)}>
                        {apt.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Section 2: Appointments per Doctor */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Rendez-vous par médecin
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Nombre de rendez-vous par médecin sur une période
        </p>
        <div className="flex gap-3 mb-4">
          <Input
            type="date"
            label="De"
            value={doctorDateRange.from}
            onChange={(e) => setDoctorDateRange({ ...doctorDateRange, from: e.target.value })}
            className="max-w-xs"
          />
          <Input
            type="date"
            label="À"
            value={doctorDateRange.to}
            onChange={(e) => setDoctorDateRange({ ...doctorDateRange, to: e.target.value })}
            className="max-w-xs"
          />
          <Button onClick={loadAppointmentsPerDoctor} disabled={loadingPerDoctor} className="self-end">
            {loadingPerDoctor ? 'Chargement...' : 'Charger'}
          </Button>
        </div>
        {loadingPerDoctor ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" />
            ))}
          </div>
        ) : appointmentsPerDoctor.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Médecin</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre de rendez-vous</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsPerDoctor.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row-hover border-b border-gray-100"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">{item.doctorName || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <Badge variant="primary">{item.count || 0}</Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Section 3: Appointments per Specialty */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Rendez-vous par spécialité
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Nombre de rendez-vous par spécialité sur une période
        </p>
        <div className="flex gap-3 mb-4">
          <Input
            type="date"
            label="De"
            value={specialtyDateRange.from}
            onChange={(e) => setSpecialtyDateRange({ ...specialtyDateRange, from: e.target.value })}
            className="max-w-xs"
          />
          <Input
            type="date"
            label="À"
            value={specialtyDateRange.to}
            onChange={(e) => setSpecialtyDateRange({ ...specialtyDateRange, to: e.target.value })}
            className="max-w-xs"
          />
          <Button onClick={loadAppointmentsPerSpecialty} disabled={loadingPerSpecialty} className="self-end">
            {loadingPerSpecialty ? 'Chargement...' : 'Charger'}
          </Button>
        </div>
        {loadingPerSpecialty ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" />
            ))}
          </div>
        ) : appointmentsPerSpecialty.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Spécialité</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre de rendez-vous</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsPerSpecialty.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row-hover border-b border-gray-100"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">{item.specialty || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{item.count || 0}</Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Section 4: Frequent Patients */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Patients fréquents
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Patients ayant eu le plus de rendez-vous sur une période
        </p>
        <div className="flex gap-3 mb-4">
          <Input
            type="date"
            label="Depuis"
            value={frequentPatientsFilter.from}
            onChange={(e) => setFrequentPatientsFilter({ ...frequentPatientsFilter, from: e.target.value })}
            className="max-w-xs"
          />
          <Input
            type="number"
            label="Nombre minimum"
            value={frequentPatientsFilter.minCount}
            onChange={(e) => setFrequentPatientsFilter({ ...frequentPatientsFilter, minCount: parseInt(e.target.value) || 2 })}
            min="1"
            className="max-w-xs"
          />
          <Button onClick={loadFrequentPatients} disabled={loadingFrequent} className="self-end">
            {loadingFrequent ? 'Chargement...' : 'Charger'}
          </Button>
        </div>
        {loadingFrequent ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" />
            ))}
          </div>
        ) : frequentPatients.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun patient fréquent trouvé</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Patient</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre de rendez-vous</th>
                </tr>
              </thead>
              <tbody>
                {frequentPatients.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row-hover border-b border-gray-100"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">{item.patientName || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <Badge variant="success">{item.count || 0}</Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;
