import React, { useState, useEffect } from 'react';
import { fetchTokens, createToken, revokeToken } from '../services/api';
import { useToast } from '../context/ToastContext';
import { KeyRound, Copy, Trash2, RefreshCw, Key } from 'lucide-react';

export function EnrollmentTokensView() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [daysValid, setDaysValid] = useState(48);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const loadTokens = async () => {
    setLoading(true);
    try {
      const data = await fetchTokens();
      setTokens(data || []);
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
    if (!title) return;

    setSubmitting(true);
    try {
      const tok = await createToken(title, 'res_demo', parseInt(daysValid, 10));
      showToast(`Generated token '${tok.name}' valid for ${tok.days_valid} days`, 'success');
      setTitle('');
      loadTokens();
    } catch (err) {
      showToast('Failed to create token: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (key) => {
    navigator.clipboard.writeText(key);
    showToast('Enrollment token copied to clipboard', 'cyan');
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this enrollment token?')) return;
    try {
      await revokeToken(id);
      showToast('Enrollment token revoked successfully', 'info');
      loadTokens();
    } catch (err) {
      showToast('Revocation failed: ' + err.message, 'error');
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleDateString();
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary dark:text-primary-light">
          <KeyRound className="w-5 h-5" />
          <h2 className="font-brand text-2xl font-bold text-slate-900 dark:text-white">Enrollment Tokens</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generate and manage activation tokens for browser extensions and endpoint AI connectors (Default: 48 days).
        </p>
      </div>

      {/* Generator Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm space-y-4">
        <h3 className="font-brand font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          <span>Create Extension & Endpoint Enrollment Token</span>
        </h3>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Token Title / Label
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chrome Extension Token - Security Audit"
              required
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Active Validity (Days)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="365"
                value={daysValid}
                onChange={(e) => setDaysValid(e.target.value)}
                required
                className="w-24 bg-slate-50 dark:bg-dark-900 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm"
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/25 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tokens List */}
      <div className="glass-panel rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-850 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-brand font-bold text-sm text-slate-900 dark:text-white">
            Active & Historical Enrollment Tokens
          </h3>
          <button
            onClick={loadTokens}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md transition-colors text-xs flex items-center gap-1 font-medium shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-dark-900 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 border border-slate-200 dark:border-slate-800">Token Title</th>
                <th className="py-3.5 px-4 border border-slate-200 dark:border-slate-800">Token Key</th>
                <th className="py-3.5 px-4 border border-slate-200 dark:border-slate-800">Created At</th>
                <th className="py-3.5 px-4 border border-slate-200 dark:border-slate-800">Expires At</th>
                <th className="py-3.5 px-4 border border-slate-200 dark:border-slate-800">Remaining</th>
                <th className="py-3.5 px-4 border border-slate-200 dark:border-slate-800">Status</th>
                <th className="py-3.5 px-4 text-right border border-slate-200 dark:border-slate-800">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              {loading && tokens.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading tokens...
                  </td>
                </tr>
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No enrollment tokens found. Generate one using the form above.
                  </td>
                </tr>
              ) : (
                tokens.map((tok) => {
                  const isAct = tok.status === 'active';
                  return (
                    <tr key={tok.id} className="hover:bg-slate-50/80 dark:hover:bg-dark-900/50 transition-colors">
                      <td className="py-3.5 px-4 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">{tok.name}</td>
                      <td className="py-3.5 px-4 border border-slate-200 dark:border-slate-800">
                        <code className="text-primary font-mono text-[11px] bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20 font-semibold">
                          {tok.token_key}
                        </code>
                      </td>
                      <td className="py-3.5 px-4 border border-slate-200 dark:border-slate-800 text-slate-500">{formatDate(tok.created_at)}</td>
                      <td className="py-3.5 px-4 border border-slate-200 dark:border-slate-800 text-slate-500">{formatDate(tok.expires_at)}</td>
                      <td className="py-3.5 px-4 border border-slate-200 dark:border-slate-800 font-semibold text-primary">{tok.days_remaining} days</td>
                      <td className="py-3.5 px-4 border border-slate-200 dark:border-slate-800">
                        <span
                            className={`px-2.5 py-0.5 rounded-sm text-[10px] font-semibold uppercase ${
                            isAct
                              ? 'bg-primary/10 text-primary border border-primary/25'
                              : 'bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {tok.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 border border-slate-200 dark:border-slate-800 text-right space-x-1.5">
                        <button
                          onClick={() => handleCopy(tok.token_key)}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                        {isAct && (
                          <button
                            onClick={() => handleRevoke(tok.id)}
                            className="px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 shadow-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Revoke</span>
                          </button>
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
  );
}
