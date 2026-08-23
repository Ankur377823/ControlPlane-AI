/**
 * ControlPlane AI — Main Application Orchestrator & View Switcher
 */

import { 
  checkAuth, 
  getStoredUser,
  handleLogin, 
  handleGoogleLoginPrompt, 
  switchAccount, 
  openUserManagementModal, 
  approveUserAccount, 
  rejectUserAccount, 
  logout, 
  quickFillLogin 
} from './auth.js';
import { parseHash, navigate, formatTitle } from './router.js';
import { fetchResources } from './api.js';

import { initFindingsView, setRFFilter, onRFSearchInput, renderFindingsTable } from './views/findingsView.js';
import { renderEventOverviewPage, openEventOverviewModal, closeEventOverviewModal } from './views/eventOverviewView.js';
import { renderTokensPage, handleCreateTokenSubmit } from './views/tokensView.js';
import { renderDashboardPage } from './views/dashboardView.js';
import { renderInventoryPage, handleOnboardSubmit } from './views/inventoryView.js';
import { handleRunRedTeamScan, handleSandboxSubmit, downloadScanPdfReport } from './views/scannerView.js';
import { handlePolicySubmit, initPoliciesView } from './views/policiesView.js';
import { handleVerifyClick, populateSampleData } from './views/hallucinationsView.js';


let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = checkAuth();
  
  // Auth Form Submit Listener
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await handleLogin(e, onLoginSuccess);
      return false;
    });
  }

  // Toggle Show/Hide Password Listener
  const togglePasswordBtn = document.getElementById('btn-toggle-password');
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const pInput = document.getElementById('login-password');
      if (pInput) {
        pInput.type = (pInput.type === 'password') ? 'text' : 'password';
        togglePasswordBtn.innerText = (pInput.type === 'password') ? '👁️' : '🙈';
      }
    });
  }

  document.getElementById('btn-google-login')?.addEventListener('click', () => handleGoogleLoginPrompt(onLoginSuccess));
  document.getElementById('btn-logout')?.addEventListener('click', logout);
  document.getElementById('btn-admin-approvals')?.addEventListener('click', openUserManagementModal);

  // Router listener
  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  // Load initial global resources dropdowns
  await populateResources();
});

function onLoginSuccess() {
  currentUser = checkAuth();
  handleRoute();
}

// Router Event Handler
async function handleRoute() {
  if (!getStoredUser()) return;

  const { route, queryParams } = parseHash();

  // Update Nav active highlighting
  document.querySelectorAll('.nav-item').forEach(el => {
    const r = el.getAttribute('data-route');
    if (r === route || (r && route.startsWith(r) && r !== '')) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Update Top Breadcrumb Title
  const bEl = document.getElementById('breadcrumb-title');
  const parts = route.split('/');
  if (bEl) {
    if (parts.length > 1) {
      bEl.innerHTML = `<span>${formatTitle(parts[0])}</span> / <strong style="color:#fff;">${formatTitle(parts[1])}</strong>`;
    } else {
      bEl.innerHTML = `<strong style="color:#fff;">${formatTitle(parts[0])}</strong>`;
    }
  }

  // Switch Active Page View
  document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));

  let targetPageId = `page-${route.replace(/\//g, '-')}`;
  let targetEl = document.getElementById(targetPageId);

  if (!targetEl) {
    targetPageId = 'page-dashboard';
    targetEl = document.getElementById(targetPageId);
  }
  targetEl?.classList.add('active');

  // Trigger Page Controller Logic
  if (route === 'security-center/risk-findings') {
    initFindingsView(queryParams);
  } else if (route === 'security-center/event-overview') {
    openEventOverviewModal();
  } else if (route === 'security-center/policies') {
    initPoliciesView();
  } else if (route === 'tokens') {
    renderTokensPage();
  } else if (route === 'dashboard') {
    renderDashboardPage();
  } else if (route === 'inventory') {
    renderInventoryPage();
  }
}

// Bind Global Helpers
window.navigate = navigate;
window.setRFFilter = setRFFilter;
window.onRFSearchInput = onRFSearchInput;
window.renderFindingsTable = renderFindingsTable;
window.renderTokensPage = renderTokensPage;
window.downloadScanPdfReport = downloadScanPdfReport;
window.quickFillLogin = quickFillLogin;
window.handleGoogleLoginPrompt = handleGoogleLoginPrompt;
window.switchAccount = switchAccount;
window.openUserManagementModal = openUserManagementModal;
window.approveUserAccount = approveUserAccount;
window.rejectUserAccount = rejectUserAccount;
window.openEventOverviewModal = openEventOverviewModal;
window.closeEventOverviewModal = closeEventOverviewModal;
window.populateSampleData = populateSampleData;

// Resource Populate Helper
async function populateResources() {
  try {
    const resources = await fetchResources();
    const selectors = [
      document.getElementById('tok-resource-id'),
      document.getElementById('scanner-resource-id'),
      document.getElementById('sandbox-resource-id')
    ];

    selectors.forEach(sel => {
      if (sel) {
        sel.innerHTML = '';
        resources.forEach(r => {
          sel.innerHTML += `<option value="${r.id}">${r.resource_name} (${r.use_case_type})</option>`;
        });
      }
    });
  } catch (err) {
    console.error('Error fetching resources:', err);
  }
}

// Form Event Bindings
document.getElementById('create-token-form')?.addEventListener('submit', handleCreateTokenSubmit);
document.getElementById('onboard-resource-form')?.addEventListener('submit', (e) => handleOnboardSubmit(e, populateResources));
document.getElementById('btn-run-redteam')?.addEventListener('click', handleRunRedTeamScan);
document.getElementById('sandbox-form')?.addEventListener('submit', handleSandboxSubmit);
document.getElementById('policy-form')?.addEventListener('submit', handlePolicySubmit);
document.getElementById('hallucination-verify-form')?.addEventListener('submit', handleVerifyClick);

