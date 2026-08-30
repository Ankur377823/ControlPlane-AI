import React, { useState, useEffect } from 'react';
import { fetchTokens, createToken, revokeToken } from '../services/api';
import { useToast } from '../context/ToastContext';
import { KeyRound, Copy, Trash2, RefreshCw, Key, X, Eye, EyeOff, Laptop, CheckCircle2, Shield } from 'lucide-react';

export function EnrollmentTokensView() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [daysValid, setDaysValid] = useState(48);
  const [submitting, setSubmitting] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [revealedTokens, setRevealedTokens] = useState({});
  const { showToast } = useToast();

  const loadTokens = async () => {
    setLoading(true);
    try {
      const data = await fetchTokens();
      setTokens(data || []);
      // If a token is currently selected in drawer, update its details
      if (selectedToken) {
        const updated = (data || []).find((t) => t.id === selectedToken.id);
        if (updated) setSelectedToken(updated);
      }
    } catch (err) {
      showToast('Error loading tokens: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const tok = await createToken(title.trim(), 'res_demo', parseInt(daysValid, 10));
      showToast(`Generated token '${tok.name}' valid for ${tok.days_valid} days`, 'success');
      setTitle('');
      await loadTokens();
      // Auto open details for the newly created token
      setSelectedToken(tok);
      setIsDrawerOpen(true);
    } catch (err) {
      showToast('Failed to create token: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text, label = 'Enrollment token') => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard`, 'cyan');
  };

  const handleRevoke = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to revoke this enrollment token? Enrolled extensions will be disconnected.')) return;
    try {
      await revokeToken(id);
      showToast('Enrollment token revoked successfully', 'info');
      await loadTokens();
      if (selectedToken && selectedToken.id === id) {
        setSelectedToken((prev) => ({ ...prev, status: 'revoked' }));
      }
    } catch (err) {
      showToast('Revocation failed: ' + err.message, 'error');
    }
  };

  const toggleReveal = (tokenId) => {
    setRevealedTokens((prev) => ({
      ...prev,
      [tokenId]: !prev[tokenId],
    }));
  };

  const openDrawer = (tok) => {
    setSelectedToken(tok);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return isoStr;
    }
  };

  const formatRelativeTime = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const now = Date.now();
      const diff = new Date(isoStr).getTime() - now;
      const days = Math.round(diff / (1000 * 60 * 60 * 24));
      if (days > 60) return `in ${Math.round(days / 30)} months`;
      if (days > 0) return `in ${days} days`;
      const pastDays = Math.abs(days);
      if (pastDays === 0) return 'today';
      if (pastDays === 1) return 'yesterday';
      if (pastDays < 30) return `${pastDays} days ago`;
      return `${Math.round(pastDays / 30)} months ago`;
    } catch (e) {
      return isoStr;
    }
  };

  const maskTokenKey = (key, isRevealed) => {
    if (!key) return '—';
    if (isRevealed) return key;
    if (key.length <= 10) return '••••••••••••••••';
    return key.substring(0, 7) + '••••••••••••••••••••••••';
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary dark:text-primary-light">
            <KeyRound className="w-5 h-5" />
            <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">
              Endpoint AI — Enrollment Tokens
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage tokens used to enroll browser extension endpoint devices and connectors into your organization.
          </p>
        </div>

        <button
          onClick={loadTokens}
          className="self-start sm:self-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md transition-colors text-xs flex items-center gap-1.5 font-medium shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Token Generator Card */}
      <div className="glass-panel p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-4">
        <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          <span>Create Extension & Endpoint Enrollment Token</span>
        </h3>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Token Label / Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. extension or Security Audit - Team A"
              required
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Active Validity (Days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={daysValid}
              onChange={(e) => setDaysValid(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{submitting ? 'Creating...' : 'Create Token'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modern Tokens Table (Clean Enterprise Style) */}
      <div className="glass-panel rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-dark-900 text-slate-600 dark:text-slate-400 font-semibold text-xs border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Label</th>
                <th className="py-3 px-4 font-semibold">Enrollments</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Expires</th>
                <th className="py-3 px-4 font-semibold">Created</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading && tokens.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading tokens...
                  </td>
                </tr>
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No enrollment tokens found. Generate one using the form above.
                  </td>
                </tr>
              ) : (
                tokens.map((tok) => {
                  const isAct = tok.status === 'active';
                  const shortId = tok.id ? tok.id.replace('tok_', '') : '—';
                  const enrollCount = tok.enrollments_count ?? (tok.devices?.length || 0);

                  return (
                    <tr
                      key={tok.id}
                      onClick={() => openDrawer(tok)}
                      className="hover:bg-slate-50 dark:hover:bg-dark-800/60 cursor-pointer transition-colors"
                    >
                      {/* Label & Short ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                          {tok.name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                          {shortId}
                        </div>
                      </td>

                      {/* Enrollments */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-800 dark:text-slate-200">
                        {enrollCount} / {tok.max_enrollments || 100}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                            isAct
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                          }`}
                        >
                          {tok.status}
                        </span>
                      </td>

                      {/* Expires */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                        {formatRelativeTime(tok.expires_at)}
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                        {formatDate(tok.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isAct ? (
                          <button
                            onClick={(e) => handleRevoke(tok.id, e)}
                            className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold text-xs transition-colors"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs">Revoked</span>
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

      {/* Slide-over Side Drawer on the Right (Matching Reference Screenshot 4) */}
      {isDrawerOpen && selectedToken && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px] transition-opacity animate-fade-in">
          {/* Backdrop Click to Close */}
          <div className="flex-1" onClick={closeDrawer}></div>

          {/* Drawer Container */}
          <div className="w-full max-w-[480px] bg-white dark:bg-dark-900 border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-slide-left">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 font-brand font-bold text-base text-slate-900 dark:text-white">
                  <span>Token Details</span>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Token Metadata Card / Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {/* Label */}
                <div className="grid grid-cols-3 p-3.5 bg-slate-50/50 dark:bg-dark-850/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Label</span>
                  <span className="col-span-2 font-semibold text-slate-900 dark:text-white">
                    {selectedToken.name}
                  </span>
                </div>

                {/* Token Key with Reveal & Copy */}
                <div className="grid grid-cols-3 p-3.5 items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Token</span>
                  <div className="col-span-2 flex items-center justify-between gap-2">
                    <code className="font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all">
                      {maskTokenKey(selectedToken.token_key, !!revealedTokens[selectedToken.id])}
                    </code>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleReveal(selectedToken.id)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                      >
                        {revealedTokens[selectedToken.id] ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hide</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Reveal</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(selectedToken.token_key, 'Enrollment token key')}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Copy full token"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-3 p-3.5 bg-slate-50/50 dark:bg-dark-850/50 items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                        selectedToken.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                      }`}
                    >
                      {selectedToken.status}
                    </span>
                  </div>
                </div>

                {/* Enrollments Count */}
                <div className="grid grid-cols-3 p-3.5 items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Enrollments</span>
                  <span className="col-span-2 font-mono text-slate-900 dark:text-white">
                    {selectedToken.enrollments_count ?? (selectedToken.devices?.length || 0)} / {selectedToken.max_enrollments || 100}
                  </span>
                </div>

                {/* Expires At */}
                <div className="grid grid-cols-3 p-3.5 bg-slate-50/50 dark:bg-dark-850/50">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Expires At</span>
                  <span className="col-span-2 text-slate-700 dark:text-slate-300">
                    {formatDate(selectedToken.expires_at)} ({formatRelativeTime(selectedToken.expires_at)})
                  </span>
                </div>

                {/* Created At */}
                <div className="grid grid-cols-3 p-3.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Created At</span>
                  <span className="col-span-2 text-slate-700 dark:text-slate-300">
                    {formatDate(selectedToken.created_at)}
                  </span>
                </div>
              </div>

              {/* Connected Device IDs Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-primary" />
                    <span>Connected Device IDs</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {selectedToken.devices?.length || 0} active
                  </span>
                </div>

                {selectedToken.devices && selectedToken.devices.length > 0 ? (
                  <div className="space-y-2">
                    {selectedToken.devices.map((dev, idx) => (
                      <div
                        key={dev.id || dev.device_id || idx}
                        className="p-3 bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-md flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 break-all">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                            {dev.device_id}
                          </span>
                          <button
                            onClick={() => handleCopy(dev.device_id, 'Device ID')}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
                            title="Copy Device ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          <span>{dev.device_name || 'Browser Extension'} ({dev.platform || 'Desktop'})</span>
                          <span>Last seen: {dev.last_seen_at ? formatRelativeTime(dev.last_seen_at) : 'Active'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-md text-center text-xs text-slate-500">
                    No devices have connected using this token yet. Enter this token in the Chrome extension popup to enroll a device.
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={closeDrawer}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 rounded-md text-xs font-semibold transition-colors"
              >
                Close
              </button>
              {selectedToken.status === 'active' && (
                <button
                  onClick={(e) => handleRevoke(selectedToken.id, e)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke Token</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
