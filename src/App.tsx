import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { AuthModal } from './components/AuthModal.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { FoodAnalyzer } from './pages/FoodAnalyzer.js';
import { AnalysisResultPage } from './pages/AnalysisResultPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminPage } from './pages/AdminPage.js';
import { FoodAnalysis } from './types/index.js';

function AppContent() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [selectedAnalysisObj, setSelectedAnalysisObj] = useState<FoodAnalysis | undefined>(undefined);

  // If user signs in and is on landing, default to dashboard
  React.useEffect(() => {
    if (isAuthenticated && currentTab === 'landing') {
      setCurrentTab('dashboard');
    } else if (!isAuthenticated && currentTab !== 'landing') {
      setCurrentTab('landing');
    }
  }, [isAuthenticated]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigate = (tab: string, meta?: any) => {
    if (tab === 'analysis-detail' && meta?.analysisId) {
      setSelectedAnalysisId(meta.analysisId);
      setSelectedAnalysisObj(meta.analysis);
      setCurrentTab('analysis-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Protection check
    if (!isAuthenticated && ['dashboard', 'analyze', 'history', 'analytics', 'profile', 'admin'].includes(tab)) {
      handleOpenAuth('login');
      return;
    }

    if (tab === 'admin' && !isAdmin) {
      alert('Access restricted to Administrators');
      return;
    }

    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (analysis: FoodAnalysis) => {
    setSelectedAnalysisId(analysis.id);
    setSelectedAnalysisObj(analysis);
    setCurrentTab('analysis-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#ecfdf5_0%,_#f8fafc_45%,_#f1f5f9_100%)] text-slate-900 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      <main className={`flex-1 w-full mx-auto pt-6 pb-10 ${currentTab === 'landing' ? 'max-w-none px-0' : 'max-w-7xl px-4 sm:px-6 lg:px-8'}`}>
        {currentTab === 'landing' && (
          <LandingPage
            onStartAnalyze={() => {
              if (isAuthenticated) {
                setCurrentTab('analyze');
              } else {
                handleOpenAuth('register');
              }
            }}
            onExploreFeatures={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'analyze' && (
          <FoodAnalyzer onAnalysisComplete={handleAnalysisComplete} />
        )}

        {currentTab === 'analysis-detail' && selectedAnalysisId && (
          <AnalysisResultPage
            analysisId={selectedAnalysisId}
            initialAnalysis={selectedAnalysisObj}
            onBack={() => setCurrentTab('dashboard')}
            onAnalyzeAnother={() => setCurrentTab('analyze')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryPage
            onSelectMeal={(meal) => handleNavigate('analysis-detail', { analysisId: meal.id, analysis: meal })}
            onNavigateAnalyze={() => setCurrentTab('analyze')}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsPage />
        )}

        {currentTab === 'profile' && (
          <ProfilePage />
        )}

        {currentTab === 'admin' && isAdmin && (
          <AdminPage />
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
