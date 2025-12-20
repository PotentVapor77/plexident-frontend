import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import OdontogramaPage from "./pages/Odontogram/OdontogramaPage";
import { useNetworkStatus } from './hooks/useNetworkStatus';
import UsersPage from "./pages/Segurity/UsersPage";
import { useAuth } from "./hooks/auth/useAuth";
import PatientsPage from "./pages/Patients/PatientsPage";
import OdontogramaHistoryPage from "./pages/Odontogram/OdontogramaHistoryPage";

// ============================================================================
// RUTAS PÚBLICAS
// ============================================================================

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }
  
  // Si ya está autenticado, redirigir a dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si NO está autenticado, mostrar la página
  return <>{children}</>;
}

// ============================================================================
// APP
// ============================================================================

function App() {
  useNetworkStatus();

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* RUTA PÚBLICA - Solo accesible si NO está autenticado */}
        <Route
          path="/sign-in"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />

        {/* Dashboard Layout - Rutas protegidas */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} /> {/* ✅ CORREGIDO: quitar path="/" */}
          <Route path="/pacientes" element={<Patients />} />
          <Route path="/registrar-paciente" element={<CreatePatient />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/registrar-usuario" element={<CreateUser />} />

          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />

          {/* Forms */}
          <Route path="/form-elements" element={<FormElements />} />

          {/* Tables */}
          <Route path="/basic-tables" element={<BasicTables />} />

          {/* Ui Elements */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />

          {/* Charts */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />

          {/* Odontograma Route */}
          <Route path="/odontograma" element={
          <div className="p-0 m-0">
            <OdontogramaPage />
          </div>
      } />

        </Route>

        {/* REDIRECCIÓN RAÍZ */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 NOT FOUND */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
