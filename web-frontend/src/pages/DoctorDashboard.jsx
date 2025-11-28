import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { doctorsAPI, appointmentsAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';

const DoctorDashboard = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await doctorsAPI.getAll();
        setDoctors(data);
        if (data.length > 0) {
          setSelectedDoctor(data[0].doctorId || data[0].id);
        }
      } catch (error) {
        showToast('Impossible de charger les médecins', 'error');
      } finally {
        setInitialLoad(false);
      }
    };

    fetchDoctors();
  }, [showToast]);

  const fetchDashboard = useCallback(
    async (doctorId) => {
      if (!doctorId) return;
      try {
        setLoading(true);
        const { data } = await appointmentsAPI.getDoctorDashboard(doctorId);
        setDashboard(data);
      } catch (error) {
        showToast('Erreur lors du chargement du tableau de bord', 'error');
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchDashboard(selectedDoctor);
  }, [selectedDoctor, fetchDashboard]);

  const statCards = [
    {
      title: 'Rendez-vous du jour',
      value: dashboard?.stats?.todayCount ?? 0,
      icon: CalendarDays,
      color: 'text-blue-600',
    },
    {
      title: 'À venir',
      value: dashboard?.stats?.upcoming ?? 0,
      icon: TrendingUp,
      color: 'text-indigo-600',
    },
    {
      title: 'Terminés',
      value: dashboard?.stats?.completed ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
    {
      title: 'Annulés',
      value: dashboard?.stats?.cancelled ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Tableau de bord médecin</h1>
          <p className="text-[var(--text-muted)]">Vision centralisée des rendez-vous quotidiens</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <Select
              label="Sélectionner un médecin"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.doctorId || doctor.id}>
                  {doctor.name} ({doctor.doctorId || doctor.id})
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={() => fetchDashboard(selectedDoctor)} disabled={!selectedDoctor || loading}>
            Actualiser
          </Button>
        </div>
      </Card>

      {initialLoad || loading ? (
        <div className="space-y-4">
          {[1, 2].map((row) => (
            <div className="grid gap-4 md:grid-cols-2" key={`row-${row}`}>
              {[1, 2].map((col) => (
                <Skeleton key={`${row}-${col}`} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--text-muted)]">{card.title}</p>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{card.value}</p>
                </Card>
              );
            })}
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Rendez-vous de la journée</h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {dashboard?.todayAppointments?.length || 0} rendez-vous programmés aujourd&apos;hui
                </p>
              </div>
            </div>
            {dashboard?.todayAppointments?.length ? (
              <div className="divide-y divide-gray-100">
                {dashboard.todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[var(--text-primary)] font-medium">{appointment.patientId}</p>
                      <p className="text-sm text-[var(--text-muted)]">{appointment.remarks || 'Consultation'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary-600">{appointment.time}</p>
                      <p className="text-sm text-[var(--text-muted)]">{appointment.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--text-muted)]">Aucun rendez-vous prévu aujourd&apos;hui</div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;
