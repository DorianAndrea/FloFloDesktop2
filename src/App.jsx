import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useFloFlo } from "./context/FloFloContext";

import EstadosAnimo from "./pages/EstadosAnimo";
import Rutinas from "./pages/Rutinas";
import Amigos from "./pages/Amigos";
import Conversaciones from "./pages/Conversaciones";
import User from "./pages/User";
import Footer from "./components/Footer";
import Lugares from "./pages/Lugares";
import Home from "./components/Home";
import CrearLugar from "./pages/CrearLugar";
import LugarDetalle from "./pages/LugarDetalle";
import Login from "./pages/Login";
import PersonaDetalle from "./pages/PersonaDetalle";
import MiPerfil from "./pages/MiPerfil";
import Logros from "./pages/Logros";
import PanelPadres from "./pages/PanelPadres";
import PerfilSensorial from "./pages/PerfilSensorial";

const ProtectedParentRoute = ({ children }) => {
  const { user } = useFloFlo();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "parent") {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/registro" element={<User />} />

        <Route path="/login" element={<Login />} />

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
            <ProtectedRoute>
              <EstadosAnimo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rutinas"
          element={
            <ProtectedRoute>
              <Rutinas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/amigos"
          element={
            <ProtectedRoute>
              <Amigos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/amigos/:id"
          element={
            <ProtectedRoute>
              <PersonaDetalle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/conversaciones"
          element={
            <ProtectedRoute>
              <Conversaciones />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lugares"
          element={
            <ProtectedRoute>
              <Lugares />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lugares/crear"
          element={
            <ProtectedRoute>
              <CrearLugar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lugares/:id"
          element={
            <ProtectedRoute>
              <LugarDetalle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logros"
          element={
            <ProtectedRoute>
              <Logros />
            </ProtectedRoute>
          }
        />

        <Route
          path="/panel-padres"
          element={
            <ProtectedParentRoute>
              <PanelPadres />
            </ProtectedParentRoute>
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
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
