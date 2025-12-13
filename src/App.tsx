// App.tsx
import { Routes, Route, Navigate } from "react-router-dom"; // ✅ Ya está correcto
import { useAuth } from "./context/AuthContext";
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
import Patients from "./pages/Dentistry/Patients";
import CreatePatient from "./pages/Dentistry/CreatePatient";
import Agenda from "./pages/Dentistry/Agenda";
import Users from "./pages/Dentistry/Users";
import CreateUser from "./pages/Dentistry/CreateUser";
import OdontogramaPage from "./pages/Odontogram/OdontogramaPage";


// Rutas públicas que redirigen si ya está autenticado
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Auth Layout - Rutas públicas */}
        <Route
          path="/signin"
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



        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

    </>
  );
}