import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PredictPage } from './pages/PredictPage';
import { BatchPredictPage } from './pages/BatchPredictPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CustomerInsightsPage } from './pages/CustomerInsightsPage';
import { ProductAssociationsPage } from './pages/ProductAssociationsPage';
import { HistoryPage } from './pages/HistoryPage';

export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#08090a] text-[#d0d6e0] flex flex-col font-sans selection:bg-[#e4f222]/20 selection:text-white">
        <Navbar />

        <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/predict" element={<PredictPage />} />
            <Route path="/batch" element={<BatchPredictPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/customers" element={<CustomerInsightsPage />} />
            <Route path="/associations" element={<ProductAssociationsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
