import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPlaces } from "../services/placeService";

const lugaresPredeterminados = [
  {
    id: "demo-1",
    nombre: "Médico",
    descripcion: "Un lugar donde revisan nuestra salud.",
    emoji: "🩺",
    esDemo: true,
  },
  {
    id: "demo-2",
    nombre: "Colegio",
    descripcion: "Un lugar para aprender y compartir.",
    emoji: "🏫",
    esDemo: true,
  },
  {
    id: "demo-3",
    nombre: "Parque",
    descripcion: "Un lugar para jugar y caminar.",
    emoji: "🌳",
    esDemo: true,
  },
];

const Lugares = () => {
  const [lugaresBD, setLugaresBD] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounce, setBusquedaDebounce] = useState("");
  const [orden, setOrden] = useState("recientes");

  const loadPlaces = async () => {
    try {
      const data = await getPlaces(busquedaDebounce, orden);

      const lugaresFormateados = data.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.name,
        descripcion: lugar.description,
        imagen: lugar.image,
        emoji: "📍",
        esDemo: false,
      }));
      console.log(data);
      setLugaresBD(lugaresFormateados);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, [busquedaDebounce, orden]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounce(busqueda);
    }, 500);

    return () => clearTimeout(timer);
  }, [busqueda]);

  const lugares =
    busqueda.trim() || orden !== "recientes"
      ? lugaresBD
      : [...lugaresPredeterminados, ...lugaresBD];

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-extrabold text-[#4B367C]">Lugares</h1>

            <p className="text-[#6B5A95] text-xl mt-2">
              Prepárate con Félix antes de visitar un lugar.
            </p>
          </div>

          <Link
            to="/lugares/crear"
            className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold px-6 py-3 rounded-full transition"
          >
            Crear lugar
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <input
            id="buscar-lugar"
            name="buscar-lugar"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar por nombre o descripción..."
            className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] text-[#4B367C] font-semibold"
          />

          <select
            id="orden-lugares"
            name="orden-lugares"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] text-[#4B367C] font-semibold"
          >
            <option value="recientes">Más recientes</option>
            <option value="antiguos">Más antiguos</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lugares.map((lugar) => {
            const imagenValida =
              lugar.imagen &&
              lugar.imagen.startsWith("https://res.cloudinary.com");

            return (
              <Link
                key={`${lugar.esDemo ? "demo" : "bd"}-${lugar.id}`}
                to={`/lugares/${lugar.id}`}
                className="bg-white rounded-[2rem] p-6 shadow-md hover:scale-[1.02] transition"
              >
                {imagenValida ? (
                  <img
                    src={lugar.imagen}
                    alt={lugar.nombre}
                    className="w-full h-40 object-cover rounded-2xl mb-4"
                  />
                ) : (
                  <div className="text-5xl mb-4">{lugar.emoji || "📍"}</div>
                )}

                <h2 className="text-3xl font-bold text-[#4B367C]">
                  {lugar.nombre}
                </h2>

                <p className="text-[#6B5A95] mt-2">
                  {lugar.descripcion || "Sin descripción"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Lugares;
