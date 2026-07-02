import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPlaces, getChildPlaces } from "../services/placeService";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import { getCachedData, setCachedData } from "../utils/cache";

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
  const [loading, setLoading] = useState(true);

  const { user } = useFloFlo();

  const {
    isParent,
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,
  } = useSelectedChild();

  const { showFeedback } = useFeedback();

  const isParentMode = isParent && Boolean(selectedChildId);
  const isParentWithoutChild = isParent && !selectedChildId;

  const childName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "el niño/a seleccionado";

  const loadPlaces = async () => {
    try {
      if (!user) return;

      if (isParent && loadingChildren) {
        return;
      }

      const ownerId = isParentMode ? selectedChildId : user.id;
      const searchKey = busquedaDebounce.trim() || "all";
      const cacheKey = `floflo_places_${ownerId}_${searchKey}_${orden}`;

      if (isParentWithoutChild) {
        setLugaresBD([]);
        setLoading(false);
        return;
      }

      const cachedPlaces = getCachedData(cacheKey);

      if (Array.isArray(cachedPlaces)) {
        setLugaresBD(cachedPlaces);
        setLoading(false);
      } else {
        setLoading(true);
      }

      const data = isParentMode
        ? await getChildPlaces(selectedChildId, busquedaDebounce, orden)
        : await getPlaces(busquedaDebounce, orden);

      const lugaresFormateados = data.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.name,
        descripcion: lugar.description,
        imagen: lugar.image,
        emoji: "📍",
        esDemo: false,
        managed_by_parent: lugar.managed_by_parent,
      }));

      setLugaresBD(lugaresFormateados);
      setCachedData(cacheKey, lugaresFormateados);
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudieron cargar los lugares",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, [
    user?.id,
    user?.role,
    selectedChildId,
    loadingChildren,
    busquedaDebounce,
    orden,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounce(busqueda);
    }, 500);

    return () => clearTimeout(timer);
  }, [busqueda]);

  const lugares = useMemo(() => {
    if (isParentMode) {
      return lugaresBD;
    }

    if (busqueda.trim() || orden !== "recientes") {
      return lugaresBD;
    }

    return [...lugaresPredeterminados, ...lugaresBD];
  }, [isParentMode, lugaresBD, busqueda, orden]);

  const getVisitedPlacesKey = () => {
    const ownerId = isParentMode ? selectedChildId : user?.id;

    return ownerId
      ? `floflo_visited_places_${ownerId}`
      : "floflo_visited_places";
  };

  const getVisitedPlaces = () => {
    try {
      return JSON.parse(
        localStorage.getItem(getVisitedPlacesKey()) || "[]",
      ).map(String);
    } catch {
      return [];
    }
  };

  const visitedPlaces = getVisitedPlaces();

  const isPlaceVisited = (placeId) => {
    return visitedPlaces.includes(String(placeId));
  };

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="mb-2 text-lg font-bold text-[#9B7BE8]">
              {isParentMode ? "Modo cuidador activo" : "Prepárate con Félix"}
            </p>

            <h1 className="text-5xl font-extrabold text-[#4B367C]">
              {isParentMode ? `Lugares de ${childName}` : "Lugares"}
            </h1>

            <p className="mt-2 text-xl text-[#6B5A95]">
              {isParentMode
                ? "Crea y revisa lugares para preparar al niño/a antes de una visita."
                : "Prepárate con Félix antes de visitar un lugar."}
            </p>
          </div>

          <Link
            to="/lugares/crear"
            className="rounded-full bg-[#9B7BE8] px-6 py-3 font-bold text-white transition hover:bg-[#8B6FD6]"
          >
            {isParentMode ? "Crear lugar para niño/a" : "Crear lugar"}
          </Link>
        </div>

        {isParent && (
          <div className="mb-8 rounded-[2rem] border-2 border-[#9ED5B3] bg-[#EAF8EF] p-5 text-center shadow-sm">
            <p className="font-bold text-[#2F6B4F]">Modo cuidador</p>

            <p className="mt-1 text-[#2F6B4F]">
              {selectedChild
                ? `Estás viendo y gestionando lugares de ${childName}.`
                : "No hay un niño/a activo seleccionado."}
            </p>
          </div>
        )}

        {isParentWithoutChild ? (
          <div className="rounded-[2rem] border-2 border-dashed border-[#DCCCF8] bg-white p-8 text-center shadow-md">
            <p className="text-2xl font-extrabold text-[#4B367C]">
              No hay niño/a seleccionado
            </p>

            <p className="mt-3 text-[#6B5A95]">
              Para gestionar lugares como cuidador, primero debes tener un
              niño/a asociado y seleccionado.
            </p>
          </div>
        ) : (
          <>
            <section className="mx-auto mb-8 max-w-6xl rounded-[2rem] bg-white px-8 py-8 shadow-sm md:px-12">
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  id="buscar-lugar"
                  name="buscar-lugar"
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="🔍 Buscar por nombre o descripción..."
                  className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4 font-semibold text-[#4B367C] focus:border-[#9B7BE8] focus:outline-none"
                />

                <select
                  id="orden-lugares"
                  name="orden-lugares"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4 font-semibold text-[#4B367C] focus:border-[#9B7BE8] focus:outline-none"
                >
                  <option value="recientes">Más recientes</option>
                  <option value="antiguos">Más antiguos</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </select>
              </div>
            </section>
            {loading ? (
              <div className="rounded-[2rem] bg-white p-8 text-center shadow-md">
                <p className="text-xl font-bold text-[#4B367C]">
                  Cargando lugares...
                </p>
              </div>
            ) : lugares.length === 0 ? (
              <div className="rounded-[2rem] border-2 border-dashed border-[#DCCCF8] bg-white p-8 text-center shadow-md">
                <p className="text-2xl font-extrabold text-[#4B367C]">
                  No hay lugares todavía
                </p>

                <p className="mt-3 text-[#6B5A95]">
                  {isParentMode
                    ? `Puedes crear el primer lugar para ${childName}.`
                    : "Puedes crear tu primer lugar para prepararte con Félix."}
                </p>
              </div>
            ) : (
              <section className="mx-auto mb-8 max-w-6xl rounded-[2rem] bg-white px-8 py-8 shadow-sm md:px-12">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {lugares.map((lugar) => {
                    const getImageUrl = (image) => {
                      if (!image) return null;

                      if (image.startsWith("http")) {
                        return image;
                      }

                      return `${import.meta.env.VITE_API_URL}${image}`;
                    };

                    const imageUrl = getImageUrl(lugar.imagen);

                    return (
                      <Link
                        key={`${lugar.esDemo ? "demo" : "bd"}-${lugar.id}`}
                        to={`/lugares/${lugar.id}`}
                        className="rounded-[2rem] bg-white p-6 shadow-md transition hover:scale-[1.02]"
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={lugar.nombre}
                            className="mb-4 h-40 w-full rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="mb-4 text-5xl">
                            {lugar.emoji || "📍"}
                          </div>
                        )}

                        <h2 className="text-3xl font-bold text-[#4B367C]">
                          {lugar.nombre}
                        </h2>

                        {isPlaceVisited(lugar.id) && (
                          <p className="mt-4 inline-flex rounded-full bg-[#EAF8EF] px-3 py-1 text-sm font-bold text-[#2F6B4F]">
                            ✅ Lugar visitado
                          </p>
                        )}

                        <p className="mt-2 text-[#6B5A95]">
                          {lugar.descripcion || "Sin descripción"}
                        </p>

                        {lugar.managed_by_parent && (
                          <p className="mt-4 inline-flex rounded-full bg-[#EAF8EF] px-3 py-1 text-sm font-bold text-[#2F6B4F]">
                            Lugar del niño/a
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default Lugares;
