import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
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

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/emociones" element={<EstadosAnimo />} />

        <Route path="/rutinas" element={<Rutinas />} />

        <Route path="/amigos" element={<Amigos />} />

        <Route path="/conversaciones" element={<Conversaciones />} />

        <Route path="/lugares" element={<Lugares />} />
        
        <Route path="/lugares/crear" element={<CrearLugar />} />
        
        <Route path="/lugares/:id" element={<LugarDetalle />} />

        <Route path="/registro" element={<User />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
