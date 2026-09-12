'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, UserX, UserCheck, AlertTriangle, 
  CheckCircle, RotateCcw, Users, Flag, Trash2 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState({ stats: {}, reports: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin');
      const json = await res.json();
      if (res.status === 403 || res.status === 401) {
        router.push('/');
        return;
      }
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAction = async (payload) => {
    setActionLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Action failed');

      setMessage(resData.message || 'Operation successful');
      fetchAdminData();
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetSeed = async () => {
    if (!confirm('Reset local fallback database to default demo seeds?')) return;
    try {
      await fetch('/api/seed', { method: 'POST' });
      setMessage('Demo data re-seeded successfully!');
      fetchAdminData();
    } catch (e) {
      setMessage('Failed to reseed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading administrator dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Platform Governance & Moderation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Admin Moderation Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Resolve student disputes, handle reports of unreturned items or no-shows, and maintain trust (FR-3.5).
          </p>
        </div>

        <button
          onClick={handleResetSeed}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
          title="Reset database to initial demo state"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs rounded-xl font-medium">
          {message}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Active Enrolled Students</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{data.stats?.total_students || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-amber-600 font-medium">Open Reports / Disputes</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{data.stats?.open_reports || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-rose-600 font-medium">Suspended Accounts</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{data.stats?.suspended_users || 0}</p>
        </div>
      </div>

      {/* Section 1: Open Reports / Disputes Table (FR-3.5.1) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Flag className="w-4 h-4 text-rose-600" />
          <span>Student Reports & Abuse Disputes ({data.reports?.length || 0})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Reported Student</th>
                <th className="py-3 px-4">Filer</th>
                <th className="py-3 px-4">Reason / Complaint</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.reports?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No reports or disputes filed!
                  </td>
                </tr>
              ) : (
                data.reports?.map((rep) => (
                  <tr key={rep.report_id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono text-slate-500">#{rep.report_id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{rep.reported_user_name}</td>
                    <td className="py-3 px-4 text-slate-500">{rep.reported_by_name}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">{rep.reason}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rep.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        rep.status === 'warned' ? 'bg-orange-100 text-orange-800' :
                        rep.status === 'suspended' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleAction({ action: 'warn_user', user_id: rep.reported_user_id, report_id: rep.report_id })}
                        disabled={actionLoading}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-[11px] font-semibold border border-amber-200"
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => handleAction({ action: 'suspend_user', user_id: rep.reported_user_id, report_id: rep.report_id })}
                        disabled={actionLoading}
                        className="px-2.5 py-1 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-lg text-[11px] font-semibold border border-rose-200"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => handleAction({ action: 'dismiss_report', report_id: rep.report_id })}
                        disabled={actionLoading}
                        className="px-2.5 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-[11px] font-medium border border-slate-200"
                      >
                        Dismiss
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Student Account Governance (FR-3.5.2) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Users className="w-4 h-4 text-sky-600" />
          <span>Student Accounts Directory</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">VIT Email</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Karma Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.users?.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-4 text-slate-500">Year {u.year}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-800">✨ {u.karma_balance}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      u.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      u.status === 'warned' ? 'bg-orange-100 text-orange-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    {u.status === 'suspended' ? (
                      <button
                        onClick={() => handleAction({ action: 'reinstate_user', user_id: u.user_id })}
                        disabled={actionLoading}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold border border-emerald-200"
                      >
                        Reinstate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction({ action: 'suspend_user', user_id: u.user_id })}
                        disabled={actionLoading}
                        className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-semibold border border-rose-200"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
