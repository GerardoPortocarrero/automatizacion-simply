import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DailyRouteReport from './pages/DailyRouteReport';
import VehiclePerformanceReport from './pages/VehiclePerformanceReport';
import OnTimeDeliveryReport from './pages/OnTimeDeliveryReport';
import ClientVisitHistoryReport from './pages/ClientVisitHistoryReport';
import PODReport from './pages/PODReport';
import FinancialReport from './pages/FinancialReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DailyRouteReport />} /> {/* Default page */}
          <Route path="daily-route" element={<DailyRouteReport />} />
          <Route path="vehicle-performance" element={<VehiclePerformanceReport />} />
          <Route path="on-time-delivery" element={<OnTimeDeliveryReport />} />
          <Route path="client-visit-history" element={<ClientVisitHistoryReport />} />
          <Route path="pod-report" element={<PODReport />} />
          <Route path="financial-report" element={<FinancialReport />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;