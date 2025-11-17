import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Stethoscope, Calendar, CalendarCheck } from 'lucide-react';
import Card from '../components/ui/Card';
import { getPatients } from '../api/patients';
import { getDoctors } from '../api/doctors';
import { getAppointments, getAppointmentsByDate } from '../api/appointments';
import { useToast } from '../components/ui/Toast';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card hover className="h-full">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary-100 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600 mt-1">{label}</p>
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
      const upcoming = allAppointments.filter((apt) => {
        const aptDate = new Date(apt.date + 'T' + apt.time);
        return aptDate > now && apt.status === 'PLANIFIE';
      }).sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
      }).slice(0, 5);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Vue d'ensemble du système</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Patients"
          value={stats.totalPatients}
          delay={0}
        />
        <StatCard
          icon={Stethoscope}
          label="Total Médecins"
          value={stats.totalDoctors}
          delay={0.1}
        />
        <StatCard
          icon={Calendar}
          label="Rendez-vous Aujourd'hui"
          value={stats.todayAppointments}
          delay={0.2}
        />
        <StatCard
          icon={CalendarCheck}
          label="Rendez-vous à Venir"
          value={stats.upcomingAppointments}
          delay={0.3}
        />
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Prochains Rendez-vous
        </h2>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Aucun rendez-vous à venir</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Patient
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Médecin
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Heure
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((apt, index) => (
                  <motion.tr
                    key={apt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="table-row-hover border-b border-gray-100"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {apt.patientName || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {apt.doctorName || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {apt.date ? format(new Date(apt.date), 'dd MMM yyyy') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {apt.time || 'N/A'}
                    </td>
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
    </div>
  );
};

export default Dashboard;

