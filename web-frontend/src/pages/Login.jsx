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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/80 via-slate-900 to-indigo-900 opacity-90" />
        <div className="absolute -top-20 -right-10 w-[520px] h-[520px] bg-primary-400/30 blur-[120px] rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-[420px] h-[420px] bg-indigo-500/30 blur-[140px] rounded-full" />
      </div>

      <div className="relative flex flex-col lg:flex-row min-h-screen">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex w-full lg:w-1/2 flex-col justify-between px-12 py-12"
        >
          <div>
            <p className="uppercase text-sm tracking-[0.4em] text-white/70 mb-6">GRH Platform</p>
            <h1 className="text-4xl xl:text-5xl font-semibold leading-tight">
              La nouvelle façon de coordonner les rendez-vous hospitaliers.
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-xl">
              Automatisez la planification, libérez vos équipes et offrez une expérience fluide aux patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {heroHighlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <div key={highlight.title} className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-xl">
                  <Icon className="w-8 h-8 text-primary-200 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{highlight.title}</h3>
                  <p className="text-sm text-white/70">{highlight.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-white/95 text-gray-900 rounded-3xl shadow-[0_25px_65px_rgba(15,23,42,0.35)] p-8 backdrop-blur-xl"
          >
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-4">
                Platforme sécurisée
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Connexion à GRH</h2>
              <p className="text-gray-500 mt-1">Identifiez-vous pour accéder à vos outils de pilotage.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Nom d&apos;utilisateur
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
                  placeholder="ex: admin"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="password" className="font-medium text-gray-700">
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
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-semibold shadow-lg shadow-primary-600/30 hover:shadow-xl transition disabled:opacity-70"
              >
                {submitting ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-6">
              Accès réservé au personnel autorisé. Toutes les actions sont journalisées.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
