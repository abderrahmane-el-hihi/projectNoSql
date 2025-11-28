import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock10, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

const heroHighlights = [
  {
    title: 'Coordination fluide',
    description: 'Planification centralisée des consultations et suivi patients en temps réel.',
    icon: ShieldCheck,
  },
  {
    title: 'Alertes intelligentes',
    description: 'Notifications instantanées pour les rendez-vous prioritaires et urgences.',
    icon: Clock10,
  },
  {
    title: 'Vision patient 360°',
    description: 'Historique, contacts et rendez-vous accessibles en un seul écran.',
    icon: HeartPulse,
  },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form.username, form.password);
      showToast('Connexion réussie', 'success');
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error.response?.data?.error || 'Identifiants invalides';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-body)] text-[var(--text-primary)]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
        <div className="absolute -top-24 -right-16 w-[520px] h-[520px] bg-primary-400/20 dark:bg-primary-500/30 blur-[120px] rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-[460px] h-[460px] bg-accent-400/15 dark:bg-accent-400/20 blur-[140px] rounded-full" />
      </div>

      <div className="relative flex flex-col lg:flex-row min-h-screen z-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex w-full lg:w-1/2 flex-col justify-between px-12 py-14"
        >
          <div>
            <p className="uppercase text-sm tracking-[0.4em] text-[var(--text-muted)] mb-6">GRH Platform</p>
            <h1 className="text-4xl xl:text-5xl font-semibold leading-tight">
              La nouvelle façon de coordonner les rendez-vous hospitaliers.
            </h1>
            <p className="mt-6 text-lg text-[var(--text-muted)] max-w-xl">
              Automatisez la planification, libérez vos équipes et offrez une expérience fluide aux patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {heroHighlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <div
                  key={highlight.title}
                  className="rounded-2xl p-5 border border-[var(--border-muted)] bg-[var(--surface)]/70 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
                >
                  <Icon className="w-8 h-8 text-primary-500 dark:text-primary-200 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{highlight.title}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{highlight.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-[var(--surface)] text-[var(--text-primary)] rounded-3xl shadow-[0_25px_65px_rgba(15,23,42,0.24)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.6)] p-8 backdrop-blur-xl border border-[var(--border-muted)]"
          >
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary-strong)] text-xs font-semibold mb-4">
                Plateforme sécurisée
              </div>
              <h2 className="text-2xl font-bold">Connexion à GRH</h2>
              <p className="text-[var(--text-muted)] mt-1">Identifiez-vous pour accéder à vos outils de pilotage.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-semibold text-[var(--text-muted)]">
                  Nom d&apos;utilisateur
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border-muted)] focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--border-strong)] transition bg-[var(--surface-strong)] text-[var(--text-primary)] placeholder-[var(--text-subtle)] shadow-[0_10px_28px_rgba(15,23,42,0.12)]"
                  placeholder="ex: admin"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="password" className="font-semibold text-[var(--text-muted)]">
                    Mot de passe
                  </label>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border-muted)] focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--border-strong)] transition bg-[var(--surface-strong)] text-[var(--text-primary)] placeholder-[var(--text-subtle)] shadow-[0_10px_28px_rgba(15,23,42,0.12)]"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary-500 via-indigo-500 to-accent-500 text-white font-semibold shadow-[0_18px_45px_rgba(79,70,229,0.35)] hover:shadow-[0_22px_60px_rgba(79,70,229,0.45)] transition disabled:opacity-70"
              >
                {submitting ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="text-xs text-[var(--text-muted)] text-center mt-6">
              Accès réservé au personnel autorisé. Toutes les actions sont journalisées.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
