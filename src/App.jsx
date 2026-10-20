import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AdminPortal from './components/AdminPortal';
import EmployeePortal from './components/EmployeePortal';
import CustomerPortal from './components/CustomerPortal';
import EmployeeDashboard from './views/EmployeeDashboard';
import PredictionView from './views/PredictionView';
import EvaluationResultsView from './components/EvaluationResultsView';
import AdminMaterialsView from './components/AdminMaterialsView';
import AdminDashboard from './views/AdminDashboard';
import CustomerReportsView from './components/CustomerReportsView';
import CustomerPage from './components/CustomerPage';
import PredictionResultView from './views/PredictionResultView';
import Footer from './components/Footer';
import Toast from './components/Toast';

function AppContent() {
  const { activeTab, setActiveTab, logout } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {activeTab === 'home' && <LandingPage />}
        {activeTab === 'admin-portal' && <AdminPortal />}
        {activeTab === 'employee-portal' && <EmployeePortal />}
        {activeTab === 'customer-portal' && <CustomerPortal />}
        {activeTab === 'login' && <EmployeePortal />}
        {activeTab === 'prediction-result' && (
          <div className="py-6">
            <PredictionResultView
              onBackToInput={() => setActiveTab('prediction')}
              onNavigateToHistory={() => setActiveTab('employee-dashboard')}
            />
          </div>
        )}
        {(activeTab === 'employee-dashboard' || activeTab === 'employee-input') && (
          <EmployeeDashboard onNavigateToPrediction={() => setActiveTab('prediction')} />
        )}
        {activeTab === 'prediction' && (
          <PredictionView
            onBackToDashboard={() => setActiveTab('employee-dashboard')}
            onPredictionComplete={() => setActiveTab('prediction-result')}
          />
        )}
        {activeTab === 'evaluation-results' && <EvaluationResultsView />}
        {(activeTab === 'admin-dashboard' || activeTab === 'admin-materials') && (
          <AdminDashboard onLogout={() => { logout(); setActiveTab('admin-portal'); }} />
        )}
        {activeTab === 'customer-reports' && <CustomerReportsView />}
        {activeTab === 'customer-page' && <CustomerPage onBack={() => setActiveTab('customer-portal')} />}
      </main>

      <Footer />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
