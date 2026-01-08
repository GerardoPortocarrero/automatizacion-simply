import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DailyRouteReport from './pages/DailyRouteReport';
import VehiclePerformanceReport from './pages/VehiclePerformanceReport';
import OnTimeDeliveryReport from './pages/OnTimeDeliveryReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DailyRouteReport />} /> {/* Default page */}
          <Route path="daily-route" element={<DailyRouteReport />} />
          <Route path="vehicle-performance" element={<VehiclePerformanceReport />} />
          <Route path="on-time-delivery" element={<OnTimeDeliveryReport />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;