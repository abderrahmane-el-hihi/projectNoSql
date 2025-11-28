import { useEffect, useState } from 'react';
import { Bell, Mail, Smartphone } from 'lucide-react';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { notificationsAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';

const channelIcon = (channel) => (channel === 'EMAIL' ? Mail : Smartphone);
const channelColors = (channel) => (channel === 'EMAIL'
  ? 'bg-blue-50 text-blue-600'
  : 'bg-emerald-50 text-emerald-600');

const Notifications = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await notificationsAPI.getRecent();
        setNotifications(data);
      } catch (error) {
        showToast('Impossible de charger les notifications', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Notifications</h1>
          <p className="text-[var(--text-muted)]">Historique des SMS et emails envoyés</p>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((row) => (
              <Skeleton key={row} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <Bell className="w-10 h-10 mx-auto mb-4" />
            Aucune notification enregistrée.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((item) => {
              const Icon = channelIcon(item.channel);
              return (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-muted)] pb-4 last:border-none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${channelColors(item.channel)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{item.recipientName}</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {item.recipientType === 'DOCTOR' ? 'Médecin' : 'Patient'} • {item.channel}
                      </p>
                      <p className="text-sm text-[var(--text-muted)] mt-1">{item.message}</p>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
