import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import KanbanBoard from './components/KanbanBoard';
import RegistrationForm from './components/RegistrationForm';
import MobileInspection from './components/MobileInspection';
import ClientList from './components/ClientList';
import Settings from './components/Settings';
import ProjectDetails from './components/ProjectDetails';
import LoginPage from './components/LoginPage';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.KANBAN);
  const { currentProjectId, setCurrentProjectId } = useProjects();

  useEffect(() => {
    if (currentProjectId) {
      setCurrentView(ViewState.PROJECT_DETAILS);
    }
  }, [currentProjectId]);

  const handleBackToKanban = () => {
      setCurrentProjectId(null);
      setCurrentView(ViewState.KANBAN);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!isAuthenticated) {
      return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewState.KANBAN: return <KanbanBoard />;
      case ViewState.CLIENT_REGISTRATION: return <RegistrationForm onComplete={handleBackToKanban} />;
      case ViewState.MOBILE_INSPECTION: return <MobileInspection />;
      case ViewState.CLIENT_LIST: return <ClientList />;
      case ViewState.SETTINGS: return <Settings />;
      case ViewState.PROJECT_DETAILS: return <ProjectDetails onBack={handleBackToKanban} />;
      default: return <KanbanBoard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background-light dark:bg-background-dark font-display">
      <aside className="w-20 bg-white dark:bg-[#1a2632] border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 z-30 shrink-0">
        <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mb-8 shadow-lg shadow-primary/20">F</div>
        <nav className="flex flex-col gap-6 w-full px-4">
          <SidebarButton icon="view_kanban" isActive={currentView === ViewState.KANBAN} onClick={() => setCurrentView(ViewState.KANBAN)} tooltip="Painel Operacional" />
          <SidebarButton icon="groups" isActive={currentView === ViewState.CLIENT_LIST} onClick={() => setCurrentView(ViewState.CLIENT_LIST)} tooltip="Lista de Clientes" />
          <SidebarButton icon="person_add" isActive={currentView === ViewState.CLIENT_REGISTRATION} onClick={() => setCurrentView(ViewState.CLIENT_REGISTRATION)} tooltip="Novo Cadastro" />
          <SidebarButton icon="smartphone" isActive={currentView === ViewState.MOBILE_INSPECTION} onClick={() => setCurrentView(ViewState.MOBILE_INSPECTION)} tooltip="Vistoria Mobile" />
          <div className="h-px bg-slate-200 dark:bg-slate-700 w-full my-2"></div>
          <SidebarButton icon="settings" isActive={currentView === ViewState.SETTINGS} onClick={() => setCurrentView(ViewState.SETTINGS)} tooltip="Configurações" />
          <button onClick={logout} className="w-full aspect-square rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all mt-auto" title="Sair"><span className="material-symbols-outlined text-2xl">logout</span></button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {currentView !== ViewState.MOBILE_INSPECTION && currentView !== ViewState.PROJECT_DETAILS && (
             <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2632] flex items-center justify-between px-6 shrink-0 z-20">
             <div className="flex items-center gap-4">
               <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                 {currentView === ViewState.KANBAN && "Painel Operacional"}
                 {currentView === ViewState.CLIENT_REGISTRATION && "Novo Cadastro"}
                 {currentView === ViewState.CLIENT_LIST && "Carteira de Clientes"}
                 {currentView === ViewState.SETTINGS && "Configurações do Sistema"}
               </h1>
             </div>
             <div className="flex items-center gap-6">
               <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
                 <div className="size-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{user?.name?.charAt(0) || 'A'}</div>
                 <div className="hidden md:block">
                   <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">{user?.name || 'Admin'}</p>
                   <p className="text-xs text-slate-500">{user?.role || 'User'}</p>
                 </div>
               </div>
             </div>
           </header>
        )}
        <div className="flex-1 overflow-hidden relative">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <ProjectProvider>
            <AppContent />
        </ProjectProvider>
    </AuthProvider>
  );
};

interface SidebarButtonProps {
  icon: string;
  isActive: boolean;
  onClick: () => void;
  tooltip: string;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, isActive, onClick, tooltip }) => {
  return (
    <button 
      onClick={onClick}
      title={tooltip}
      className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200 group relative ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary'}`}
    >
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </button>
  );
};

export default App;
