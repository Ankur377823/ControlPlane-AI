import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { LoginScreen } from './components/modals/LoginScreen';
import { UserManagementModal } from './components/modals/UserManagementModal';
import { EventOverviewModal } from './components/modals/EventOverviewModal';

// Views
import { DashboardView } from './views/DashboardView';
import { SecurityCenterOverviewView } from './views/SecurityCenterOverviewView';
import { RiskFindingsView } from './views/RiskFindingsView';
import { FindingDetailView } from './views/FindingDetailView';
import { ReviewQueueView } from './views/ReviewQueueView';
import { InventoryView } from './views/InventoryView';
import { OnboardResourceView } from './views/OnboardResourceView';
import { AgentRuntimeView } from './views/AgentRuntimeView';
import { PoliciesView } from './views/PoliciesView';
import { PolicyDetailView } from './views/PolicyDetailView';
import { EnrollmentTokensView } from './views/EnrollmentTokensView';
import { RedTeamScannerView } from './views/RedTeamScannerView';
import { HallucinationsView } from './views/HallucinationsView';
import { DocumentationView } from './views/DocumentationView';

export function App() {
  const { user } = useAuth();
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || 'dashboard';
  });

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState('EU_AI_ACT');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [path, query] = hash.split('?');
      if (path) setRoute(path);

      if (query) {
        const params = new URLSearchParams(query);
        if (params.get('id')) {
          if (path === 'security-center/policies/detail') {
            setSelectedPolicyId(params.get('id'));
          } else {
            setSelectedEventId(params.get('id'));
          }
        }
        if (params.get('session_id')) setSelectedSessionId(params.get('session_id'));
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newRoute, queryParams = null) => {
    let hash = `#/${newRoute}`;
    if (queryParams) {
      const q = new URLSearchParams(queryParams).toString();
      if (q) hash += `?${q}`;
    }
    window.location.hash = hash;
    setRoute(newRoute);
  };

  const handleSelectFinding = (id) => {
    setSelectedEventId(id);
    navigate('security-center/finding-detail', { id });
  };

  const handleViewPolicyDetail = (policyId) => {
    setSelectedPolicyId(policyId);
    navigate('security-center/policies/detail', { id: policyId });
  };

  // If user is not authenticated, show login overlay
  if (!user) {
    return <LoginScreen />;
  }

  // Standalone full-page Documentation route without AppShell sidebar or header
  if (route === 'documentation') {
    return <DocumentationView onBackToStudio={() => navigate('dashboard')} />;
  }

  const renderActiveView = () => {
    switch (route) {
      case 'dashboard':
        return <DashboardView onNavigate={navigate} />;
      case 'inventory':
        return <InventoryView onNavigateOnboard={() => navigate('inventory/add')} />;
      case 'inventory/add':
        return <OnboardResourceView onBack={() => navigate('inventory')} />;
      case 'agent-runtime':
        return <AgentRuntimeView />;
      case 'security-center/overview':
      case 'security-center/event-overview':
        return (
          <SecurityCenterOverviewView
            onSelectFinding={handleSelectFinding}
            onNavigatePolicies={() => navigate('security-center/policies')}
            onNavigateRiskFindings={() => navigate('security-center/risk-findings')}
            onNavigateReviewQueue={() => navigate('security-center/review-queue')}
          />
        );
      case 'security-center/review-queue':
        return <ReviewQueueView />;
      case 'security-center/risk-findings':
        return <RiskFindingsView onSelectFinding={handleSelectFinding} />;
      case 'security-center/finding-detail':
        return (
          <FindingDetailView
            findingId={selectedEventId}
            onBack={() => navigate('security-center/risk-findings')}
          />
        );
      case 'security-center/policies':
        return (
          <PoliciesView
            onViewPolicyDetail={handleViewPolicyDetail}
          />
        );
      case 'security-center/policies/detail':
        return (
          <PolicyDetailView
            policyId={selectedPolicyId}
            onBack={() => navigate('security-center/policies')}
            onNavigatePolicies={() => navigate('security-center/policies')}
          />
        );
      case 'tokens':
        return <EnrollmentTokensView />;
      case 'ai-red-team':
        return <RedTeamScannerView />;
      case 'hallucinations':
        return <HallucinationsView />;
      default:
        return <DashboardView onNavigate={navigate} />;
    }
  };

  return (
    <AppShell activeRoute={route} onNavigate={navigate}>
      {renderActiveView()}

      {/* Global Modals */}
      <UserManagementModal />
      <EventOverviewModal
        eventId={selectedEventId}
        sessionId={selectedSessionId}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />
    </AppShell>
  );
}
