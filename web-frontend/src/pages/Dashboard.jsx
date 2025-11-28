import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Stethoscope, Calendar, CalendarCheck, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { getPatients } from '../api/patients';
import { getDoctors } from '../api/doctors';
import { getAppointments, getAppointmentsByDate } from '../api/appointments';
import { useToast } from '../components/ui/Toast';

const StatCard = ({ icon: Icon, label, value, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card hover className="h-full">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500/15 to-accent-500/15 text-primary-600 dark:text-primary-200">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-3xl font-semibold text-[var(--text-primary)]">{value}</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">{label}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [patients, doctors, allAppointments] = await Promise.all([
        getPatients(),
        getDoctors(),
        getAppointments(),
      ]);

      const today = format(new Date(), 'yyyy-MM-dd');
      const todayAppts = await getAppointmentsByDate(today);

      const now = new Date();
      const upcoming = allAppointments
        .filter((apt) => {
          const aptDate = new Date(`${apt.date}T${apt.time}`);
          return aptDate > now && apt.status === 'PLANIFIE';
        })
        .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
        .slice(0, 5);

      setStats({
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        todayAppointments: todayAppts.length,
        upcomingAppointments: upcoming.length,
      });
      setUpcomingAppointments(upcoming);
    } catch (error) {
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
        <Card>
          <Skeleton variant="title" className="mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const occupancyRate = Math.min(
    100,
    Math.round((stats.todayAppointments / Math.max(1, stats.totalDoctors * 16)) * 100),
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-primary-500 via-indigo-500 to-accent-500 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 text-white p-8 shadow-[0_30px_90px_rgba(79,70,229,0.28)]"
      >
        <div className="absolute -left-10 -top-10 w-56 h-56 bg-white/15 rounded-full blur-3xl opacity-80" />
        <div className="absolute -right-20 top-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl opacity-60" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <p className="uppercase text-xs tracking-[0.55em] text-white/70 mb-3">Vue globale</p>
            <h1 className="text-3xl font-semibold leading-tight">
              Gestion quotidienne de l&apos;activité hospitalière
            </h1>
            <p className="text-white/80 mt-4 max-w-xl">
              Suivez les rendez-vous, maîtrisez l&apos;occupation des médecins et anticipez les pics grâce
              à nos indicateurs intelligents.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-white/15 rounded-2xl px-4 py-3 backdrop-blur">
                <p className="text-sm text-white/70">Taux de remplissage</p>
                <p className="text-2xl font-semibold">{occupancyRate}%</p>
              </div>
              <div className="bg-white/15 rounded-2xl px-4 py-3 backdrop-blur">
                <p className="text-sm text-white/70">Patients actifs</p>
                <p className="text-2xl font-semibold">{stats.totalPatients}</p>
              </div>
            </div>
          </div>
          <Link
            to="/appointments"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-white/90 text-primary-700 border border-white/50 shadow-[0_18px_45px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 transition dark:bg-slate-900/70 dark:text-primary-100 dark:border-white/10 dark:shadow-[0_15px_40px_rgba(0,0,0,0.35)]"
          >
            Gérer les rendez-vous
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} delay={0} />
        <StatCard icon={Stethoscope} label="Total Médecins" value={stats.totalDoctors} delay={0.1} />
        <StatCard icon={Calendar} label="Rendez-vous Aujourd'hui" value={stats.todayAppointments} delay={0.2} />
        <StatCard icon={CalendarCheck} label="Rendez-vous à Venir" value={stats.upcomingAppointments} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Prochains rendez-vous</h2>
              <p className="text-sm text-[var(--text-muted)]">5 créneaux confirmés</p>
            </div>
            <Link
              to="/appointments"
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Voir tout
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-[var(--text-subtle)]" />
              <p>Aucun rendez-vous à venir</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border-muted)] hover:border-primary-200/60 transition"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{apt.patientName || 'Patient inconnu'}</p>
                    <p className="text-xs text-[var(--text-muted)]">Avec {apt.doctorName || 'Médecin non attribué'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {apt.date ? format(new Date(apt.date), 'dd MMM') : 'N/A'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{apt.time || '--:--'}</p>
                  </div>
                  <Badge variant={getStatusBadge(apt.status)}>{apt.status}</Badge>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Focus opérationnel</h3>
          <div className="space-y-5">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">Occupation du jour</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: `${occupancyRate}%` }} />
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{occupancyRate}%</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-primary-50 border border-primary-100">
              <p className="text-xs uppercase tracking-widest text-primary-600 mb-2">Patients suivis</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalPatients}</p>
              <p className="text-sm text-[var(--text-muted)]">dont {stats.todayAppointments} rendez-vous aujourd&apos;hui</p>
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              Dernière mise à jour :{' '}
              <span className="font-semibold text-[var(--text-primary)]">
                {format(new Date(), 'dd MMM yyyy, HH:mm')}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
