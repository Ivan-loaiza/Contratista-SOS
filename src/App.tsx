import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import  ClientDashboard  from './components/ClientDashboard';
import { ContractorDashboard } from './components/ContractorDashbaord';

export type UserRole = 'client' | 'contractor' | null;
export type Screen = 'welcome' | 'client-dashboard' | 'contractor-dashboard';

export interface AppState {
  currentScreen: Screen;
  userRole: UserRole;
  isLoggedIn: boolean;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    currentScreen: 'welcome',
    userRole: null,
    isLoggedIn: false
  });

  const navigateToScreen = (screen: Screen, role?: UserRole) => {
    setAppState({
      currentScreen: screen,
      userRole: role || appState.userRole,
      isLoggedIn: screen !== 'welcome'
    });
  };

  const logout = () => {
    setAppState({
      currentScreen: 'welcome',
      userRole: null,
      isLoggedIn: false
    });
  };

  const renderCurrentScreen = () => {
    switch (appState.currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={navigateToScreen} />;
      case 'client-dashboard':
        return <ClientDashboard onLogout={logout} />;
      case 'contractor-dashboard':
        return <ContractorDashboard onLogout={logout} />;
      default:
        return <WelcomeScreen onNavigate={navigateToScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentScreen()}
    </div>
  );
}