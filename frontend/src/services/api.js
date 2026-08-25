/**
 * ControlPlane AI — Centralized API Client Service
 */

const API_BASE = '/api/v1';

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = { 'Content-Type': 'application/json' };

  const storedUser = sessionStorage.getItem('cp_user') || localStorage.getItem('cp_user');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      if (u && u.tenant_id) {
        defaultHeaders['X-Tenant-ID'] = u.tenant_id;
      }
    } catch (e) {
      console.warn('Error reading tenant_id from stored user:', e);
    }
  }

  const config = {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'API request failed');
  }
  return response.json();
}

export async function loginUser(username, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function googleLoginUser(email, name) {
  return apiFetch('/auth/google-login', {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  });
}

export async function fetchUsers() {
  return apiFetch('/auth/users');
}

export async function approveUser(userId) {
  return apiFetch(`/auth/users/${userId}/approve`, { method: 'POST' });
}

export async function rejectUser(userId) {
  return apiFetch(`/auth/users/${userId}/reject`, { method: 'POST' });
}

export async function fetchFindings(params = {}) {
  const query = new URLSearchParams();
  if (params.source && params.source !== 'All') query.set('source', params.source);
  if (params.severity && params.severity !== 'All severities') query.set('severity', params.severity);
  if (params.status && params.status !== 'All') query.set('status', params.status);
  if (params.search) query.set('search', params.search);

  const storedUser = sessionStorage.getItem('cp_user') || localStorage.getItem('cp_user');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      if (u && u.tenant_id) {
        query.set('tenant_id', u.tenant_id);
      }
    } catch (e) {}
  }

  query.set('limit', String(params.limit || 100));

  const qStr = query.toString();
  return apiFetch(`/findings${qStr ? '?' + qStr : ''}`);
}

export async function fetchFindingById(id) {
  return apiFetch(`/findings/${id}`);
}

export async function updateFindingStatus(id, status) {
  return apiFetch(`/findings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function fetchTokens() {
  return apiFetch('/tokens');
}

export async function createToken(name, resourceId = 'res_demo', daysValid = 48) {
  return apiFetch('/tokens', {
    method: 'POST',
    body: JSON.stringify({ name, resource_id: resourceId, days_valid: daysValid }),
  });
}

export async function revokeToken(tokenId) {
  return apiFetch(`/tokens/${tokenId}`, { method: 'DELETE' });
}

export async function fetchResources() {
  return apiFetch('/resources');
}

export async function onboardResource(payload) {
  return apiFetch('/resources', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function validateResource(id) {
  return apiFetch(`/resources/${id}/validate`, { method: 'POST' });
}

export async function fetchAnalytics(tenantId) {
  const q = tenantId ? `?tenant_id=${encodeURIComponent(tenantId)}` : '';
  return apiFetch(`/analytics/summary${q}`);
}

export async function runScan(resourceId, prompts) {
  return apiFetch(`/resources/${resourceId}/scan`, {
    method: 'POST',
    body: JSON.stringify({ prompts, reset_conversation: true }),
  });
}

export async function runAdhocScan(webhookId, resourceName, prompts) {
  return apiFetch('/scan/adhoc', {
    method: 'POST',
    body: JSON.stringify({
      webhook_id: webhookId,
      resource_name: resourceName,
      prompts,
      reset_conversation: true,
    }),
  });
}

export async function runCheck(resourceId, userPrompt, toolCall = null) {
  return apiFetch(`/resources/${resourceId}/check`, {
    method: 'POST',
    body: JSON.stringify({ user_prompt: userPrompt, tool_call: toolCall }),
  });
}

export async function fetchPolicy(resourceId = 'res_demo') {
  return apiFetch(`/resources/${resourceId}/policy`);
}

export async function updatePolicy(resourceId, policyData) {
  return apiFetch(`/resources/${resourceId}/policy`, {
    method: 'PUT',
    body: JSON.stringify(policyData),
  });
}

export async function fetchReviewQueue(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.severity) query.set('severity', params.severity);
  if (params.use_case_type) query.set('use_case_type', params.use_case_type);
  const qStr = query.toString();
  return apiFetch(`/findings/review-queue${qStr ? '?' + qStr : ''}`);
}

export async function submitReviewDecision(findingId, decision, reviewerNotes = '', reviewerId = 'usr_reviewer') {
  return apiFetch(`/findings/${findingId}/review`, {
    method: 'POST',
    body: JSON.stringify({ decision, reviewer_notes: reviewerNotes, reviewer_id: reviewerId }),
  });
}

export async function submitFindingFeedback(findingId, feedbackType, notes = '') {
  return apiFetch(`/findings/${findingId}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ feedback_type: feedbackType, notes }),
  });
}

export async function fetchTrustworthiness(tenantId = 'ankur-tenant-1') {
  return apiFetch(`/analytics/trustworthiness?tenant_id=${encodeURIComponent(tenantId)}`);
}

export async function verifyHallucination(payload) {
  return apiFetch('/hallucination/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
