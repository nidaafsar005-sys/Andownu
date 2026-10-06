import React, { useEffect, useState } from 'react';
import { Activity, Power, LogOut, Lock } from 'lucide-react';
import { fetchAdminStats, adminLogin, adminTogglePlatform } from '../api';

export const AdminDashboard: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('andown_admin_token'));
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await adminLogin(password);
      localStorage.setItem('andown_admin_token', res.token);
      setToken(res.token);
    } catch (err: any) {
      setError(err.message || 'Invalid password (default: admin123)');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!token) return;
    try {
      const data = await fetchAdminStats(token);
      setStats(data);
    } catch {
      setToken(null);
      localStorage.removeItem('andown_admin_token');
    }
  };

  useEffect(() => {
    if (token) {
      loadStats();
      const interval = setInterval(loadStats, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleToggle = async (providerId: string, currentStatus: boolean) => {
    if (!token) return;
    try {
      await adminTogglePlatform(token, providerId, !currentStatus);
      await loadStats();
    } catch {
      alert('Failed to update provider status');
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 glass-panel rounded-2xl border border-indigo-500/20 shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-center text-white">Andown Admin Console</h2>
        <p className="text-xs text-center text-slate-400 mt-1 mb-6">Enter system administrator credentials</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Admin Email</label>
            <input 
              type="text" 
              disabled 
              value="admin@andown.in" 
              className="w-full mt-1.5 px-3 py-2 text-sm bg-slate-900/80 border border-slate-700 rounded-lg text-slate-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Default: admin123" 
              className="w-full mt-1.5 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-400" />
            <span>Admin Operations Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time media server telemetry, job queues & provider controls</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('andown_admin_token');
            setToken(null);
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Total Ingestion Requests</span>
            <div className="text-2xl font-extrabold text-white mt-1">{stats.metrics.total_requests}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Completed Downloads</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.metrics.successful_downloads}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Active Working Jobs</span>
            <div className="text-2xl font-extrabold text-indigo-400 mt-1">{stats.metrics.active_jobs}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Total Bandwidth Transferred</span>
            <div className="text-2xl font-extrabold text-purple-400 mt-1">{stats.metrics.bandwidth_formatted}</div>
          </div>
        </div>
      )}

      {/* Provider Toggle Management */}
      {stats && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">Platform Extractor Status & Runtime Toggles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.platforms.map((p: any) => (
              <div key={p.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">{p.name}</div>
                  <div className="text-[11px] text-slate-400">{p.id}.py provider</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(p.id, p.is_enabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    p.is_enabled 
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900' 
                      : 'bg-red-950/80 text-red-300 border border-red-500/40 hover:bg-red-900'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{p.is_enabled ? 'ONLINE' : 'OFFLINE'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Log */}
      {stats && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">Recent Media Jobs Queue</h2>
          {stats.recent_jobs.length === 0 ? (
            <p className="text-xs text-slate-500">No jobs recorded in current session.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Job ID</th>
                    <th className="p-3">Media Title</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.recent_jobs.map((job: any) => (
                    <tr key={job.job_id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono text-slate-400">{job.job_id.slice(0, 8)}...</td>
                      <td className="p-3 truncate max-w-xs">{job.media_info?.title || job.url}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.status === 'completed' ? 'bg-emerald-950 text-emerald-400' :
                          job.status === 'failed' ? 'bg-red-950 text-red-400' :
                          'bg-indigo-950 text-indigo-400'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-3">{job.filesize_formatted || '-'}</td>
                      <td className="p-3 text-slate-400">{new Date(job.expires_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
