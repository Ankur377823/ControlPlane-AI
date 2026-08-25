import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUsers, approveUser, rejectUser } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, X, RefreshCw } from 'lucide-react';

export function UserManagementModal() {
  const { isUserMgmtOpen, setIsUserMgmtOpen, user: currentUser, isAdmin, switchAccount } = useAuth();
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data || []);
    } catch (err) {
      showToast('Failed to load user directory: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserMgmtOpen) {
      loadUsers();
    }
  }, [isUserMgmtOpen]);

  if (!isUserMgmtOpen) return null;

  const handleApprove = async (userId, name) => {
    try {
      await approveUser(userId);
      showToast(`User account '${name}' approved successfully`, 'success');
      loadUsers();
    } catch (err) {
      showToast('Approval failed: ' + err.message, 'error');
    }
  };

  const handleReject = async (userId, name) => {
    try {
      await rejectUser(userId);
      showToast(`User account '${name}' status updated`, 'warning');
      loadUsers();
    } catch (err) {
      showToast('Action failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-dark-900/80 backdrop-blur-md animate-fade-in transition-colors">
      <div className="w-full max-w-4xl max-h-[85vh] bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-400/30 dark:shadow-black/80 flex flex-col overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-dark-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/25 flex items-center justify-center text-primary dark:text-primary-light">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white">
                User Directory & Admin Approvals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage user permissions, approve pending accounts, or switch session.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadUsers}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              title="Refresh users"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsUserMgmtOpen(false)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Table */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-900/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">User Name & Email</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      {loading ? 'Loading user directory...' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSelf = currentUser?.id === u.id || currentUser?.username === u.username;
                    const isApproved = u.approval_status === 'approved' || !u.approval_status;

                    return (
                      <tr key={u.id || u.username} className="hover:bg-slate-100/50 dark:hover:bg-dark-800/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{u.name || u.username}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{u.email || '—'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{u.username}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200/70 dark:bg-dark-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            {u.auth_provider === 'google' ? 'Google OAuth' : 'Local DB'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light border border-primary/25'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {u.role || 'USER'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isApproved
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25'
                            }`}
                          >
                            {isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {isAdmin && !isApproved && (
                            <>
                              <button
                                onClick={() => handleApprove(u.id, u.name || u.username)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(u.id, u.name || u.username)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-[11px] font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {isAdmin && !isSelf && (
                            <button
                              onClick={() => switchAccount(u)}
                              className="px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-[11px] font-semibold transition-colors"
                            >
                              Switch To
                            </button>
                          )}
                          {isSelf && (
                            <span className="text-[11px] text-primary dark:text-accent-cyan font-bold px-2 py-1">
                              Active Now
                            </span>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
