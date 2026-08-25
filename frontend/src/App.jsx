import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { LoginScreen } from './components/modals/LoginScreen';
import { UserManagementModal } from './components/modals/UserManagementModal';
import { EventOverviewModal } from './components/modals/EventOverviewModal';

// Views
import { DashboardView } from './views/DashboardView';
import { RiskFindingsView } from './views/RiskFindingsView';
import { EventOverviewView } from './views/EventOverviewView';
import { InventoryView } from './views/InventoryView';
import { OnboardResourceView } from './views/OnboardResourceView';
import { AgentRuntimeView } from './views/AgentRuntimeView';
import { PoliciesView } from './views/PoliciesView';
import { EnrollmentTokensView } from './views/EnrollmentTokensView';
import { EndpointAIView } from './views/EndpointAIView';
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
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [path, query] = hash.split('?');
      if (path) setRoute(path);

      if (query) {
        const params = new URLSearchParams(query);
        if (params.get('id')) setSelectedEventId(params.get('id'));
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

  const handleSelectFinding = (id, session_id) => {
    setSelectedEventId(id);
    setSelectedSessionId(session_id);
    navigate('security-center/event-overview', { id, session_id });
  };

  // If user is not authenticated, show login overlay
  if (!user) {
    return <LoginScreen />;
  }

  const renderActiveView = () => {
    switch (route) {
      case 'dashboard':
        return <DashboardView />;
      case 'inventory':
        return <InventoryView onNavigateOnboard={() => navigate('inventory/add')} />;
      case 'inventory/add':
        return <OnboardResourceView onBack={() => navigate('inventory')} />;
      case 'agent-runtime':
        return <AgentRuntimeView />;
      case 'security-center/risk-findings':
        return <RiskFindingsView onSelectFinding={handleSelectFinding} />;
      case 'security-center/event-overview':
        return (
          <EventOverviewView
            eventId={selectedEventId}
            sessionId={selectedSessionId}
            onBack={() => navigate('security-center/risk-findings')}
          />
        );
      case 'security-center/policies':
        return <PoliciesView />;
      case 'tokens':
        return <EnrollmentTokensView />;
      case 'endpoint-ai':
        return <EndpointAIView />;
      case 'ai-red-team':
        return <RedTeamScannerView />;
      case 'hallucinations':
        return <HallucinationsView />;
      case 'documentation':
        return <DocumentationView />;
      default:
        return <DashboardView />;
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
