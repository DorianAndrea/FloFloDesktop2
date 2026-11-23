import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import EstadosAnimo from "./pages/EstadosAnimo";
import Rutinas from "./pages/Rutinas";
import Amigos from "./pages/Amigos";
import Conversaciones from "./pages/Conversaciones";
import User from "./pages/User";
import Lugares from "./pages/Lugares";
import Home from "./components/Home";
import CrearLugar from "./pages/CrearLugar";
import LugarDetalle from "./pages/LugarDetalle";
import Login from "./pages/Login";
import PersonaDetalle from "./pages/PersonaDetalle";
import MiPerfil from "./pages/MiPerfil";
import Logros from "./pages/Logros";
import PanelPadres from "./pages/PanelPadres";
import Dashboard from "./pages/Dashboard";
import ChildDashboard from "./pages/ChildDashboard";
import PerfilSensorial from "./pages/PerfilSensorial";
import MiFamilia from "./pages/MiFamilia";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { FeedbackProvider } from "./context/FeedbackContext";
import { SelectedChildProvider } from "./context/SelectedChildContext";
import InformeInteligentePage from "./pages/InformeInteligentePage";
import EquipoFloFlo from "./pages/EquipoFloFlo";
import InvitacionEquipoFloFlo from "./pages/InvitacionEquipoFloFlo";
import RoutineExperienceLibrary from "./modules/experiences/components/RoutineExperienceLibrary";
import Privacidad from "./pages/Privacidad";
import Terminos from "./pages/Terminos";
import ReporteBienestar from "./pages/ReporteBienestar";

function App() {
  return (
    <BrowserRouter>
      <FeedbackProvider>
        <SelectedChildProvider>
          <div className="min-h-screen flex flex-col bg-[#F7F0FF]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/privacidad" element={<Privacidad />} />
                <Route path="/terminos" element={<Terminos />} />
                <Route
                  path="/biblioteca-experiencias"
                  element={
                    <ProtectedRoute requireSelectedChild>
                      <RoutineExperienceLibrary />
                    </ProtectedRoute>
                  }
                />
                <Route path="/registro" element={<User />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/mi-perfil"
                  element={
                    <ProtectedRoute>
                      <MiPerfil />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/emociones"
                  element={
                    <ProtectedRoute requireSelectedChild>
                      <EstadosAnimo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rutinas"
                  element={
                    <ProtectedRoute requireSelectedChild>
                      <Rutinas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/amigos"
                  element={
                    <ProtectedRoute requireSelectedChild>
                      <Amigos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/amigos/:id"
                  element={
                    <ProtectedRoute requireSelectedChild>
                      <PersonaDetalle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/conversaciones"
                  element={
                    <ProtectedRoute requireSelectedChild>
                      <Conversaciones />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lugares"
                  element={
                    <ProtectedRoute requireSelectedChild>
                      <Lugares />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lugares/crear"
                  element={
                    <ProtectedRoute requireSelectedChild>
                      <CrearLugar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lugares/:id"
                  element={
                    <ProtectedRoute requireSelectedChild>
                      <LugarDetalle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/logros"
                  element={
                    <ProtectedRoute requireSelectedChild>
                      <Logros />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mi-familia"
                  element={
                    <ProtectedRoute allowedRoles={["parent"]}>
                      <MiFamilia />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/panel-padres"
                  element={
                    <ProtectedRoute allowedRoles={["parent"]}>
                      <PanelPadres />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["parent"]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/children/:childId"
                  element={
                    <ProtectedRoute allowedRoles={["parent"]}>
                      <ChildDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/informe-inteligente"
                  element={
                    <ProtectedRoute allowedRoles={["parent"]}>
                      <InformeInteligentePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/perfil-sensorial"
                  element={
                    <ProtectedRoute>
                      <PerfilSensorial />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/equipo-floflo"
                  element={
                    <ProtectedRoute
                      allowedRoles={["parent"]}
                      requireSelectedChild
                    >
                      <EquipoFloFlo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/equipo-floflo/invitacion/:token"
                  element={<InvitacionEquipoFloFlo />}
                />
                <Route
                  path="/reporte-bienestar"
                  element={
                    <ProtectedRoute>
                      <ReporteBienestar />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </SelectedChildProvider>
      </FeedbackProvider>
    </BrowserRouter>
  );
}
export default App;
