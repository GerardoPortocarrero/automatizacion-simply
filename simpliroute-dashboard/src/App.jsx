import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DailyRouteReport from './pages/DailyRouteReport';
import VehiclePerformanceReport from './pages/VehiclePerformanceReport';
import OnTimeDeliveryReport from './pages/OnTimeDeliveryReport';
import DataPage from './pages/Data';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DailyRouteReport />} /> {/* Default page */}
          <Route path="avance-por-ruta" element={<DailyRouteReport />} />
          <Route path="avance-por-cliente" element={<OnTimeDeliveryReport />} />
          <Route path="capacidad-por-camion" element={<VehiclePerformanceReport />} />          
          <Route path="data" element={<DataPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;