import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ROLE_HOME = {
  LEVEL1: '/dashboard-level1',
  LEVEL2: '/dashboard-level2',
  LEVEL3: '/dashboard-level3',
  LEVEL4: '/dashboard-level4',
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(ROLE_HOME[data.user.role] || '/dashboard-level1');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sos-blue via-sos-blue-dark to-sos-blue p-4">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-md">
        {/* Card — speech-bubble corners */}
        <div className="bg-white bubble shadow-xl p-8 sm:p-10 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-sos-blue-light flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-sos-blue" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-sos-gray-900">
              SOS Safeguarding
            </h1>
            <p className="mt-1 text-sm text-sos-gray-500">
              Plateforme de signalement — SOS Villages d'Enfants
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-sos-red bg-sos-red-light px-4 py-2.5 rounded-lg animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-sos-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="prenom.nom@sos-kd.org"
                className="w-full px-4 py-2.5 rounded-lg border border-sos-gray-300 text-sm
                           placeholder:text-sos-gray-400
                           focus:outline-none focus:ring-2 focus:ring-sos-blue/40 focus:border-sos-blue
                           transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-sos-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-sos-gray-300 text-sm
                             placeholder:text-sos-gray-400
                             focus:outline-none focus:ring-2 focus:ring-sos-blue/40 focus:border-sos-blue
                             transition pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sos-gray-400 hover:text-sos-gray-600"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-sos-blue text-white font-semibold text-sm
                         hover:bg-sos-blue-dark active:scale-[0.98] transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 border-t border-sos-gray-200 pt-6">
            <p className="text-xs font-semibold text-sos-gray-700 mb-4 text-center">
              🔑 Identifiants de Test:
            </p>
            <div className="space-y-3 text-xs">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="font-semibold text-green-800 mb-1">🏠 Level 1 - Maman SOS:</div>
                <div className="text-green-700">
                  <div><strong>Email:</strong> fatma@sos.tn</div>
                  <div><strong>Mot de passe:</strong> fatma123</div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-semibold text-blue-800 mb-1">🧠 Level 2 - Psychologue:</div>
                <div className="text-blue-700">
                  <div><strong>Email:</strong> psy@sos.tn</div>
                  <div><strong>Mot de passe:</strong> psy123</div>
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="font-semibold text-purple-800 mb-1">⚖️ Level 3 - Admin:</div>
                <div className="text-purple-700">
                  <div><strong>Email:</strong> admin@sos.tn</div>
                  <div><strong>Mot de passe:</strong> admin123</div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="font-semibold text-amber-800 mb-1">👨‍🏫 Level 1 - Éducateur:</div>
                <div className="text-amber-700">
                  <div><strong>Email:</strong> ahmed@sos.tn</div>
                  <div><strong>Mot de passe:</strong> ahmed123</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <strong>Note:</strong> If credentials don't work, run: <code className="bg-yellow-100 px-1 rounded">cd backend && node seed.js</code>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-sos-gray-400">
            Accès réservé au personnel autorisé de SOS Villages d'Enfants
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
