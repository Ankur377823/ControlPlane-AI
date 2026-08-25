/**
 * ControlPlane AI — Authentication, Account Switcher & Admin Approval Module
 */

import { loginUser, googleLoginUser, fetchUsers, approveUser, rejectUser } from './api.js';
import { showToast } from './toast.js';

export function getStoredUser() {
  const stored = sessionStorage.getItem('cp_user') || localStorage.getItem('cp_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn("Corrupt cp_user session, clearing:", e);
      clearStoredUser();
    }
  }
  return null;
}

export function isRemembered() {
  return !!localStorage.getItem('cp_user');
}

export function setStoredUser(user, remember = false) {
  const json = JSON.stringify(user);
  if (remember) {
    localStorage.setItem('cp_user', json);
    sessionStorage.removeItem('cp_user');
  } else {
    sessionStorage.setItem('cp_user', json);
    localStorage.removeItem('cp_user');
  }
}

export function clearStoredUser() {
  localStorage.removeItem('cp_user');
  sessionStorage.removeItem('cp_user');
}

export function checkAuth() {
  const loginScreen = document.getElementById('login-screen');
  const user = getStoredUser();
  if (user && typeof user === 'object' && (user.id || user.username || user.email)) {
    if (loginScreen) loginScreen.style.display = 'none';
    
    const nameEl = document.getElementById('user-display-name');
    if (nameEl) nameEl.innerText = user.name || user.username || user.email || 'User';
    
    const roleEl = document.getElementById('user-display-role');
    if (roleEl) roleEl.innerText = `${user.role || 'USER'} (${user.auth_provider === 'google' ? 'Google Auth' : 'Local Auth'})`;

    const isAdmin = (user.role === 'ADMIN' || user.username === 'admin' || user.username === 'ankur' || (user.email && user.email.includes('ankur')));
    const tenantEl = document.getElementById('tenant-display-id');
    if (tenantEl) {
      const allowed = (Array.isArray(user.allowed_tenants) && user.allowed_tenants.length > 0)
        ? user.allowed_tenants
        : [user.tenant_id || 'acme-tenant-1'];
      if (isAdmin && allowed.length > 1) {
        let opts = allowed.map(t => `<option value="${t}" ${t === user.tenant_id ? 'selected' : ''}>${t}</option>`).join('');
        tenantEl.innerHTML = `<select id="header-tenant-switcher" style="background:transparent; color:#fff; border:none; font-family:var(--font-mono); font-size:0.82rem; font-weight:700; cursor:pointer;" onchange="changeActiveTenant(this.value)">${opts}</select>`;
      } else {
        tenantEl.innerText = user.tenant_id || 'globex-tenant-2';
      }
    }

    const adminBtn = document.getElementById('btn-admin-approvals');
    if (adminBtn) {
      adminBtn.style.display = (user.role === 'ADMIN' || user.username === 'admin' || (user.email && (user.email.includes('admin') || user.email.includes('ankur')))) ? 'inline-flex' : 'none';
    }

    return user;
  }

  if (loginScreen) loginScreen.style.display = 'flex';
  return null;
}

export async function handleLogin(e, onLoginSuccess) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }

  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const rememberCheckbox = document.getElementById('login-remember');
  const username = usernameInput ? usernameInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';
  const remember = rememberCheckbox ? rememberCheckbox.checked : false;

  if (!username || !password) {
    showToast('Please enter both Username/Email and Password', 'warning');
    return false;
  }

  try {
    const user = await loginUser(username, password);
    if (!user || !user.token) {
      throw new Error('Invalid credentials');
    }
    setStoredUser(user, remember);
    checkAuth();
    showToast(`Welcome back, ${user.name || user.username}! Connected to ${user.tenant_id}`, 'success');
    window.location.hash = '#/dashboard';
    if (onLoginSuccess) onLoginSuccess();
  } catch (err) {
    showToast(err.message || 'Login failed. Please check credentials.', 'error');
  }
  return false;
}

window.changeActiveTenant = function(newTenantId) {
  const user = getStoredUser();
  if (user) {
    const remember = isRemembered();
    user.tenant_id = newTenantId;
    setStoredUser(user, remember);
    showToast(`Switched active tenant workspace to ${newTenantId}`, 'info');
    const dashTenantEl = document.getElementById('dash-tenant-id');
    if (dashTenantEl) dashTenantEl.innerText = newTenantId;
    if (typeof window.handleRoute === 'function') {
      window.handleRoute();
    }
  }
};

export async function handleGoogleLoginPrompt(onLoginSuccess) {
  const emailInput = prompt("Enter your Gmail address to sign in with Google:", "user@gmail.com");
  if (!emailInput) return;

  const nameInput = prompt("Enter your Full Name (optional):", emailInput.split('@')[0]);

  try {
    const user = await googleLoginUser(emailInput, nameInput || emailInput);
    user.tenant_id = 'acme-tenant-1';
    user.allowed_tenants = ['acme-tenant-1'];
    const rememberCheckbox = document.getElementById('login-remember');
    const remember = rememberCheckbox ? rememberCheckbox.checked : false;
    setStoredUser(user, remember);
    checkAuth();
    showToast(`Google Sign-In Successful! Welcome ${user.name}`, 'success');
    window.location.hash = '#/dashboard';
    if (onLoginSuccess) onLoginSuccess();
  } catch (err) {
    showToast('Google Sign-In Notice: ' + err.message, 'error');
  }
}

export async function switchAccount(username, password, tenantId) {
  try {
    const user = await loginUser(username, password);
    const allowed = user.allowed_tenants || [user.tenant_id || 'acme-tenant-1'];
    user.tenant_id = allowed.includes(tenantId) ? tenantId : allowed[0];
    const remember = isRemembered();
    setStoredUser(user, remember);
    checkAuth();
    showToast(`Switched active account session to ${user.name} (${user.role})`, 'success');
    window.location.hash = '#/dashboard';
  } catch (err) {
    showToast('Account switch failed: ' + err.message, 'error');
  }
}

export async function openUserManagementModal() {
  const modal = document.getElementById('user-mgmt-modal');
  const tbody = document.getElementById('user-mgmt-table-body');
  if (!modal || !tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">Loading user directory & pending approvals...</td></tr>`;
  modal.style.display = 'flex';

  try {
    const users = await fetchUsers();
    tbody.innerHTML = '';
    
    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No users found in database.</td></tr>`;
      return;
    }

    users.forEach(u => {
      const isApproved = u.status === 'approved';
      const isRejected = u.status === 'rejected';
      const statusBadge = isApproved 
        ? `<span class="status-badge" style="background:rgba(34,197,94,0.15); color:var(--success);">🟢 Approved</span>`
        : (isRejected 
          ? `<span class="status-badge" style="background:rgba(239,68,68,0.15); color:var(--danger);">🔴 Rejected</span>`
          : `<span class="status-badge" style="background:rgba(245,158,11,0.15); color:var(--warning);">⏳ Pending Admin Approval</span>`);

      tbody.innerHTML += `
        <tr>
          <td>
            <div style="font-weight:700; color:#fff;">${escapeHtml(u.name)}</div>
            <div style="font-size:0.75rem; color:var(--text-subtle);">${escapeHtml(u.email)}</div>
          </td>
          <td><code style="color:var(--cyan);">${escapeHtml(u.username)}</code></td>
          <td><span class="source-tag">${u.auth_provider === 'google' ? 'Google Auth' : 'Local Auth'}</span></td>
          <td><span style="font-size:0.8rem; font-weight:700; color:var(--primary);">${u.role}</span></td>
          <td>${statusBadge}</td>
          <td>
            ${!isApproved ? `<button class="btn" style="padding:4px 10px; font-size:0.75rem;" onclick="approveUserAccount('${u.id}')">✓ Approve</button>` : ''}
            ${!isRejected ? `<button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="rejectUserAccount('${u.id}')">✕ Reject</button>` : ''}
            <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="switchAccount('${u.username}', '', '${u.tenant_id}')">⚡ Switch To</button>

          </td>
        </tr>
      `;
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger);">Failed to load user directory: ${err.message}</td></tr>`;
  }
}

export async function approveUserAccount(userId) {
  try {
    await approveUser(userId);
    showToast('User account approved by Admin!', 'success');
    openUserManagementModal();
  } catch (err) {
    showToast('Failed to approve account: ' + err.message, 'error');
  }
}

export async function rejectUserAccount(userId) {
  try {
    await rejectUser(userId);
    showToast('User account rejected', 'warning');
    openUserManagementModal();
  } catch (err) {
    showToast('Failed to reject account: ' + err.message, 'error');
  }
}

export function quickFillLogin(userStr, passStr) {
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');

  if (uInput) uInput.value = userStr;
  if (pInput) pInput.value = passStr;
  showToast(`Prefilled credentials for ${userStr}`, 'cyan');
}

export function logout() {
  clearStoredUser();
  const loginScreen = document.getElementById('login-screen');
  if (loginScreen) loginScreen.style.display = 'flex';
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');
  if (uInput) uInput.value = '';
  if (pInput) pInput.value = '';
  showToast('Logged out of ControlPlane AI', 'info');
}

window.handleLogin = handleLogin;
window.logout = logout;

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
