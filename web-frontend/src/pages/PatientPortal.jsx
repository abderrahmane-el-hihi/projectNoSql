import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock3, CalendarDays, UserCircle, Stethoscope } from 'lucide-react';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import { appointmentsAPI, patientsAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  PLANIFIE: 'text-blue-600 bg-blue-50',
  TERMINE: 'text-emerald-600 bg-emerald-50',
  ANNULE: 'text-rose-600 bg-rose-50',
};

const PatientPortal = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const isPatientUser = user?.role === 'PATIENT' && user?.patientId;

  useEffect(() => {
    const loadPatients = async () => {
      if (isPatientUser) {
        setSelectedPatient(user.patientId);
        setInitialLoad(false);
        return;
      }
      try {
        const { data } = await patientsAPI.getAll();
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatient(data[0].patientId || data[0].id);
        }
      } catch (error) {
        showToast('Impossible de charger les patients', 'error');
      } finally {
        setInitialLoad(false);
      }
    };

    loadPatients();
  }, [isPatientUser, user?.patientId, showToast]);

  const fetchHistory = useCallback(
    async (patientId) => {
      if (!patientId) return;
      try {
        setLoading(true);
        const { data } = await appointmentsAPI.getPatientHistory(patientId);
        setHistory(data);
      } catch (error) {
        showToast('Erreur lors du chargement de l’historique', 'error');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchHistory(selectedPatient);
  }, [selectedPatient, fetchHistory]);

  const selectedPatientLabel = useMemo(() => {
    if (isPatientUser) {
      return user.patientId;
    }
    const patient = patients.find((p) => (p.patientId || p.id) === selectedPatient);
    return patient ? `${patient.name} (${patient.patientId || patient.id})` : '';
  }, [isPatientUser, patients, selectedPatient, user?.patientId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Portail patient</h1>
          <p className="text-[var(--text-muted)]">Historique complet des rendez-vous</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          {!isPatientUser && (
            <div className="flex-1">
              <Select
                label="Sélectionner un patient"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.patientId || patient.id}>
                    {patient.name} ({patient.patientId || patient.id})
                  </option>
                ))}
              </Select>
            </div>
          )}
          {isPatientUser && (
            <div>
              <p className="text-sm text-[var(--text-muted)]">Patient connecté</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">{selectedPatientLabel}</p>
            </div>
          )}
        </div>
      </Card>

      {initialLoad || loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((row) => (
            <Skeleton key={row} />
          ))}
        </div>
      ) : history.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-[var(--text-muted)]">Aucun rendez-vous trouvé pour ce patient.</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((appointment) => (
            <Card key={appointment.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary-50 text-primary-600">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {appointment.date} • {appointment.time}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                      <Stethoscope className="w-4 h-4" />
                      Médecin: {appointment.doctorId}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                      <UserCircle className="w-4 h-4" />
                      Patient ID: {appointment.patientId}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <span
                    className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full ${
                      statusStyles[appointment.status] || 'text-[var(--text-muted)] bg-gray-100'
                    }`}
                  >
                    <Clock3 className="w-4 h-4" />
                    {appointment.status}
                  </span>
                  {appointment.remarks && (
                    <p className="text-sm text-[var(--text-muted)] max-w-xs">{appointment.remarks}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPortal;
