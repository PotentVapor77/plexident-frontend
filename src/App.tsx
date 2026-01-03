// src/App.tsx
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
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import UsersPage from "./pages/Segurity/UsersPage";
import { useAuth } from "./hooks/auth/useAuth";
import PatientsPage from "./pages/Patients/PatientsPage";
import ForgotPasswordForm from "./pages/AuthPages/ForgotPasswordForm";
import ResetPassword from "./pages/AuthPages/ResetPassword";

import { NotificationProvider } from "./context/notifications/NotificationContext";
import { NotificationContainer } from "./context/notifications/NotificationContainer";
import PersonalBackgroundPage from "./pages/PersonalBackground/personalBackgroundPage";
import OdontogramaHistoryPage from "./pages/Odontogram/OdontogramaHistoryPage";
import FamilyBackgroundPage from "./pages/FamilyBackground/familyBackgroundPage";
import ConstantesVitalesPage from "./pages/VitalSigns/ConstantesVitalesPage";
import StomatognathicExamPage from "./pages/StomatognathicExam/StomatognathicExamPage";

// ============================================================================
// RUTAS PÚBLICAS
// ============================================================================

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// ============================================================================
// APP
// ============================================================================

function App() {
  useNetworkStatus();

  return (
    <NotificationProvider>
      <ScrollToTop />

      <Routes>
        {/* PÚBLICAS */}
        <Route
          path="/sign-in"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordForm />
            </PublicRoute>
          }
        />

        <Route
          path="/reset-password/:uid/:token"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* PROTEGIDAS */}
        {/* RUTAS PROTEGIDAS - Solo accesibles si está autenticado */}

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/usuarios" element={<UsersPage />} />

            <Route path="/usuarios/:id/editar" element={<UsersPage />} />
            <Route path="/pacientes" element={<PatientsPage />} />
            <Route path="/pacientes/:id/editar" element={<PatientsPage />} />
            <Route path="/pacientes/antecedentes-personales" element={<PersonalBackgroundPage />} />
            <Route path="/pacientes/antecedentes-familiares" element={<FamilyBackgroundPage />} />
            <Route path="/pacientes/constantes-vitales" element={<ConstantesVitalesPage />} />
            <Route path="/pacientes/examen-estomatognatico" element={<StomatognathicExamPage/>} />


            
            <Route path="/odontogram" element={<OdontogramaPage />} />
            <Route path="/pacientes" element={<PatientsPage />} />
            <Route path="/odontograma" element={<OdontogramaPage />} />
            <Route path="/odontograma-timeline" element={<OdontogramaHistoryPage />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/charts/bar-chart" element={<BarChart />} />
            <Route path="/charts/line-chart" element={<LineChart />} />
            <Route path="/forms/form-elements" element={<FormElements />} />
            <Route path="/tables/basic-tables" element={<BasicTables />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/ui-elements/alerts" element={<Alerts />} />
            <Route path="/ui-elements/buttons" element={<Buttons />} />
            <Route path="/ui-elements/avatars" element={<Avatars />} />
            <Route path="/ui-elements/badges" element={<Badges />} />
            <Route path="/ui-elements/images" element={<Images />} />
            <Route path="/ui-elements/videos" element={<Videos />} />
            <Route path="/blank" element={<Blank />} />


            <Route path="/segurity/users" element={<UsersPage />} />
          </Route>
        </Route>

        {/* RAÍZ */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <NotificationContainer />
    </NotificationProvider>
  );
}

export default App;