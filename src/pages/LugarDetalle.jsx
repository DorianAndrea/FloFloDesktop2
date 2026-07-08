import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getPlaceById,
  getPlaceSteps,
  updatePlace,
  deletePlace,
  completePlace,
  replacePlaceSteps,
  getChildPlaceById,
  getChildPlaceSteps,
  updateChildPlace,
  deleteChildPlace,
  completeChildPlace,
  replaceChildPlaceSteps,
} from "../services/placeService";

import { generatePlaceSteps } from "../services/aiService";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import felix from "../assets/webp/felix_respirando.webp";
import { getCachedData, setCachedData, removeCachedData } from "../utils/cache";
import { validateImageFile } from "../utils/validateImageFile";
import AchievementPopup from "../components/AchievementPopup";
import { showUnlockedAchievements } from "../utils/showUnlockedAchievements";

const lugaresDemo = [
  {
    id: "demo-1",
    nombre: "Médico",
    emoji: "🩺",
    imagen: null,
    direccion: "Centro médico cercano",
    descripcion: "Es un lugar donde revisan nuestra salud.",
    actividad: "El doctor nos revisará unos minutos.",
    personas: "Mamá, Félix y el doctor.",
    transporte: "Automóvil",
    duracion: "30 minutos",
    consejos: "Puedes llevar tu juguete favorito.",
    pasos: [
      "Vamos a salir de casa.",
      "Iremos en automóvil.",
      "Llegaremos al médico.",
      "El doctor nos saludará.",
      "La revisión durará unos minutos.",
      "Luego volveremos a casa.",
    ],
  },
  {
    id: "demo-2",
    nombre: "Colegio",
    emoji: "🏫",
    imagen: null,
    direccion: "Colegio",
    descripcion: "Es un lugar donde aprendemos y compartimos.",
    actividad: "Entraremos a clases y haremos actividades.",
    personas: "Profesora, compañeros y Félix.",
    transporte: "Automóvil o bus escolar",
    duracion: "Media jornada",
    consejos: "Puedes llevar tu mochila y tu colación.",
    pasos: [
      "Vamos a preparar la mochila.",
      "Saldremos de casa.",
      "Iremos al colegio.",
      "La profesora nos saludará.",
      "Haremos actividades en la sala.",
      "Luego volveremos a casa.",
    ],
  },
  {
    id: "demo-3",
    nombre: "Parque",
    emoji: "🌳",
    imagen: null,
    direccion: "Parque cercano",
    descripcion: "Es un lugar para caminar, jugar y descansar.",
    actividad: "Podremos caminar, mirar árboles o jugar.",
    personas: "Familia, otros niños y Félix.",
    transporte: "Caminando o en automóvil",
    duracion: "1 hora",
    consejos: "Puedes llevar agua y usar bloqueador.",
    pasos: [
      "Vamos a salir de casa.",
      "Iremos al parque.",
      "Veremos árboles y juegos.",
      "Podremos caminar o jugar.",
      "Descansaremos si lo necesitas.",
      "Luego volveremos a casa.",
    ],
  },
];

const defaultSteps = [
  "Vamos a salir de casa.",
  "Iremos al lugar.",
  "Llegaremos y miraremos alrededor.",
  "Saludaremos a las personas presentes.",
  "Haremos la actividad preparada.",
  "Luego volveremos a casa.",
];
const getPlaceImageUrl = (image) => {
  if (!image) return null;

  if (image.startsWith("http")) {
    return image;
  }

  return `${import.meta.env.VITE_API_URL}${image}`;
};

const LugarDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const esDemo = String(id).startsWith("demo");

  const { user } = useFloFlo();

  const {
    isParent,
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,
  } = useSelectedChild();

  const { showFeedback, showConfirm } = useFeedback();
  const previousSelectedChildId = useRef(selectedChildId);

  const isParentMode = isParent && Boolean(selectedChildId);
  const isParentWithoutChild = isParent && !selectedChildId;

  const childName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "el niño/a seleccionado";
  const getLugarDetalleCacheKey = () => {
    const ownerId = isParentMode ? selectedChildId : user?.id;

    return ownerId ? `floflo_lugar_detalle_${ownerId}_${id}` : null;
  };

  const [lugar, setLugar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newAchievement, setNewAchievement] = useState(null);
  const [modoPreparacion, setModoPreparacion] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editingSteps, setEditingSteps] = useState([]);
  const [generandoIA, setGenerandoIA] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    descripcion: "",
    actividad: "",
    personas: "",
    transporte: "",
    duracion: "",
    consejos: "",
  });

  const validateParentChildSelection = () => {
    if (!isParent) return true;

    if (!selectedChildId) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta niño/a activo",
        title: "Selecciona un niño/a",
        message:
          "Para gestionar lugares como cuidador, primero debes tener un niño/a asociado y seleccionado.",
      });

      return false;
    }

    return true;
  };

  const formatPlace = (data, pasosFinales) => ({
    id: data.id,
    nombre: data.name,
    imagen: data.image,
    direccion: data.address,
    descripcion: data.description,
    actividad: data.activity,
    personas: data.people_present,
    transporte: data.transport,
    duracion: data.estimated_duration,
    consejos: data.tips,
    emoji: "📍",
    pasos: pasosFinales,
    managed_by_parent: data.managed_by_parent,
  });

  const loadLugar = async ({ useCache = true } = {}) => {
    try {
      if (!user) return;

      if (isParent && loadingChildren) {
        return;
      }
      if (isParent && esDemo) {
        navigate("/lugares", { replace: true });
        return;
      }

      if (esDemo) {
        setLoading(true);

        const lugarDemo = lugaresDemo.find(
          (lugar) => String(lugar.id) === String(id),
        );

        setLugar(lugarDemo || null);
        setEditingSteps(lugarDemo?.pasos || defaultSteps);
        setLoading(false);
        return;
      }

      if (isParentWithoutChild) {
        setLugar(null);
        setLoading(false);
        return;
      }

      if (isParentMode && previousSelectedChildId.current) {
        if (
          String(previousSelectedChildId.current) !== String(selectedChildId)
        ) {
          previousSelectedChildId.current = selectedChildId;
          navigate("/lugares", { replace: true });
          setLoading(false);
          return;
        }
      }

      if (isParentMode && !previousSelectedChildId.current) {
        previousSelectedChildId.current = selectedChildId;
      }

      const cacheKey = getLugarDetalleCacheKey();
      const cachedLugar = useCache && cacheKey ? getCachedData(cacheKey) : null;

      if (cachedLugar?.lugar) {
        setLugar(cachedLugar.lugar);
        setEditingSteps(
          Array.isArray(cachedLugar.editingSteps)
            ? cachedLugar.editingSteps
            : cachedLugar.lugar.pasos || defaultSteps,
        );

        setForm(
          cachedLugar.form || {
            nombre: cachedLugar.lugar.nombre || "",
            direccion: cachedLugar.lugar.direccion || "",
            descripcion: cachedLugar.lugar.descripcion || "",
            actividad: cachedLugar.lugar.actividad || "",
            personas: cachedLugar.lugar.personas || "",
            transporte: cachedLugar.lugar.transporte || "",
            duracion: cachedLugar.lugar.duracion || "",
            consejos: cachedLugar.lugar.consejos || "",
          },
        );

        setLoading(false);
      } else {
        setLoading(true);
      }

      const [data, stepsData] = await Promise.all([
        isParentMode
          ? getChildPlaceById(selectedChildId, id)
          : getPlaceById(id),
        isParentMode
          ? getChildPlaceSteps(selectedChildId, id)
          : getPlaceSteps(id),
      ]);

      const pasosBD = Array.isArray(stepsData)
        ? stepsData
            .map((step) => step.description)
            .filter((step) => typeof step === "string" && step.trim() !== "")
        : [];

      const pasosFinales = pasosBD.length > 0 ? pasosBD : defaultSteps;
      const lugarFormateado = formatPlace(data, pasosFinales);

      const formActualizado = {
        nombre: data.name || "",
        direccion: data.address || "",
        descripcion: data.description || "",
        actividad: data.activity || "",
        personas: data.people_present || "",
        transporte: data.transport || "",
        duracion: data.estimated_duration || "",
        consejos: data.tips || "",
      };

      setLugar(lugarFormateado);
      setEditingSteps(pasosFinales);
      setForm(formActualizado);

      if (cacheKey) {
        setCachedData(cacheKey, {
          lugar: lugarFormateado,
          editingSteps: pasosFinales,
          form: formActualizado,
        });
      }
    } catch (error) {
      console.error(error);
      setLugar(null);

      if (isParentMode && error.response?.status === 404) {
        navigate("/lugares", { replace: true });
        return;
      }

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo cargar el lugar",
        message:
          error.response?.data?.message ||
          "El lugar no existe o no tienes permiso para verlo.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLugar();
  }, [id, user?.id, user?.role, selectedChildId, loadingChildren]);

  useEffect(() => {
    if (!isParent) return;

    if (loadingChildren) return;

    if (!previousSelectedChildId.current) {
      previousSelectedChildId.current = selectedChildId;
      return;
    }

    if (
      selectedChildId &&
      previousSelectedChildId.current &&
      String(previousSelectedChildId.current) !== String(selectedChildId)
    ) {
      previousSelectedChildId.current = selectedChildId;
      navigate("/lugares");
    }
  }, [isParent, selectedChildId, loadingChildren, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    const validation = validateImageFile(file);

    if (!validation.isValid) {
      e.target.value = "";
      setImageFile(null);
      setImagePreview(null);

      showFeedback(validation.feedback);

      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGenerateStepsAI = async () => {
    if (!form.nombre.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Ingresa el nombre del lugar",
        message: "Félix necesita saber el nombre para regenerar los pasos.",
      });
      return;
    }

    if (!form.actividad.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Describe la actividad",
        message:
          "Indica qué se hará en ese lugar para que Félix pueda ayudarte.",
      });
      return;
    }

    try {
      setGenerandoIA(true);

      const data = await generatePlaceSteps({
        placeName: form.nombre,
        activity: form.actividad,
        people: form.personas,
        transport: form.transporte,
        duration: form.duracion,
      });

      if (!data.steps || !Array.isArray(data.steps)) {
        showFeedback({
          type: "error",
          icon: "❌",
          label: "Algo salió mal",
          title: "No se generaron pasos",
          message: "Félix no pudo generar pasos válidos. Intenta nuevamente.",
        });
        return;
      }

      setEditingSteps(data.steps);

      showFeedback({
        type: "success",
        icon: "✨",
        label: "Pasos regenerados",
        title: "Félix actualizó los pasos",
        message: "Puedes revisarlos y guardar los cambios del lugar.",
      });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo regenerar",
        message: "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setGenerandoIA(false);
    }
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...editingSteps];
    newSteps[index] = value;
    setEditingSteps(newSteps);
  };

  const addStep = () => {
    setEditingSteps([...editingSteps, ""]);
  };

  const removeStep = (index) => {
    setEditingSteps(editingSteps.filter((_, i) => i !== index));
  };

  const handleUpdateLugar = async (e) => {
    e.preventDefault();

    if (!validateParentChildSelection()) return;

    if (!form.nombre.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Nombre obligatorio",
        message: "Debes ingresar el nombre del lugar antes de guardar.",
      });
      return;
    }

    if (!form.descripcion.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Descripción obligatoria",
        message: "Agrega una descripción simple del lugar antes de guardar.",
      });
      return;
    }

    const pasosValidos = editingSteps
      .map((step) => String(step || "").trim())
      .filter((step) => step !== "");

    if (pasosValidos.length === 0) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Faltan pasos",
        title: "Agrega al menos un paso",
        message: "El lugar necesita al menos un paso de preparación.",
      });
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", form.nombre.trim());
      formData.append("address", form.direccion.trim());
      formData.append("description", form.descripcion.trim());
      formData.append("activity", form.actividad.trim());
      formData.append("people_present", form.personas.trim());
      formData.append("transport", form.transporte.trim());
      formData.append("estimated_duration", form.duracion.trim());
      formData.append("tips", form.consejos.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      }
      const updated = isParentMode
        ? await updateChildPlace(selectedChildId, id, formData)
        : await updatePlace(id, formData);
      const updatedPlace = updated?.place || updated?.data || updated;

      if (isParentMode) {
        await replaceChildPlaceSteps(selectedChildId, id, pasosValidos);
      } else {
        await replacePlaceSteps(id, pasosValidos);
      }

      const lugarActualizado = {
        ...lugar,
        nombre: updatedPlace.name,
        direccion: updatedPlace.address,
        descripcion: updatedPlace.description,
        actividad: updatedPlace.activity,
        personas: updatedPlace.people_present,
        transporte: updatedPlace.transport,
        duracion: updatedPlace.estimated_duration,
        consejos: updatedPlace.tips,
        imagen: updatedPlace.image,
        pasos: pasosValidos,
        managed_by_parent: updatedPlace.managed_by_parent,
      };

      const formActualizado = {
        nombre: updatedPlace.name || "",
        direccion: updatedPlace.address || "",
        descripcion: updatedPlace.description || "",
        actividad: updatedPlace.activity || "",
        personas: updatedPlace.people_present || "",
        transporte: updatedPlace.transport || "",
        duracion: updatedPlace.estimated_duration || "",
        consejos: updatedPlace.tips || "",
      };

      setLugar(lugarActualizado);
      setEditingSteps(pasosValidos);
      setForm(formActualizado);
      setImageFile(null);
      setImagePreview(null);

      const cacheKey = getLugarDetalleCacheKey();

      if (cacheKey) {
        setCachedData(cacheKey, {
          lugar: lugarActualizado,
          editingSteps: pasosValidos,
          form: formActualizado,
        });
      }

      setEditing(false);

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Cambios guardados",
        title: "Lugar actualizado",
        message: isParentMode
          ? `Los cambios del lugar de ${childName} se guardaron correctamente.`
          : "Los cambios del lugar se guardaron correctamente.",
      });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo actualizar",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    }
  };

  const handleDeleteLugar = async () => {
    if (!validateParentChildSelection()) return;

    const confirmed = await showConfirm({
      type: "danger",
      icon: "🗑️",
      label: "Eliminar lugar",
      title: "¿Eliminar este lugar?",
      message: isParentMode
        ? `Esta acción eliminará el lugar de ${childName}. No se puede deshacer.`
        : "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    try {
      if (isParentMode) {
        await deleteChildPlace(selectedChildId, id);
      } else {
        await deletePlace(id);
      }
      const cacheKey = getLugarDetalleCacheKey();

      if (cacheKey) {
        removeCachedData(cacheKey);
      }

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Lugar eliminado",
        title: "Eliminado correctamente",
        message: isParentMode
          ? `El lugar fue eliminado para ${childName}.`
          : "El lugar fue eliminado de FloFlo.",
      });

      navigate("/lugares");
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo eliminar",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    }
  };

  const siguientePaso = () => {
    if (pasoActual < lugar.pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    }
  };

  const anteriorPaso = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };
  const getVisitedPlacesKey = () => {
    const ownerId = isParentMode ? selectedChildId : user?.id;

    return ownerId
      ? `floflo_visited_places_${ownerId}`
      : "floflo_visited_places";
  };

  const markPlaceAsVisited = () => {
    const key = getVisitedPlacesKey();

    let savedVisitedPlaces = [];

    try {
      savedVisitedPlaces = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      savedVisitedPlaces = [];
    }

    const placeId = String(id);

    if (!savedVisitedPlaces.includes(placeId)) {
      localStorage.setItem(
        key,
        JSON.stringify([...savedVisitedPlaces, placeId]),
      );
    }
  };

  const prepararLugar = async () => {
    if (!validateParentChildSelection()) return;

    try {
      let response = null;

      if (!esDemo) {
        response = isParentMode
          ? await completeChildPlace(selectedChildId, id)
          : await completePlace(id);
      }

      const ownerId = isParentMode ? selectedChildId : user.id;
      localStorage.removeItem(`floflo_achievements_${ownerId}`);

      markPlaceAsVisited();

      const unlockedAchievements = Array.isArray(response?.unlockedAchievements)
        ? response.unlockedAchievements
        : [];

      if (unlockedAchievements.length > 0) {
        showUnlockedAchievements(showFeedback, unlockedAchievements);

        setNewAchievement(unlockedAchievements[0]);

        setTimeout(() => {
          setNewAchievement(null);
        }, 5000);

        return;
      }

      showFeedback({
        type: "success",
        icon: "⭐",
        label: "Preparación completada",
        title: "¡Muy bien!",
        message: isParentMode
          ? `La preparación del lugar quedó registrada para ${childName}.`
          : "Félix te ayudó a prepararte. Ganaste una estrella.",
      });

      navigate("/lugares");
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo guardar",
        message:
          error.response?.data?.message ||
          "No se pudo guardar la preparación del lugar.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);

    if (!lugar) return;

    setForm({
      nombre: lugar.nombre || "",
      direccion: lugar.direccion || "",
      descripcion: lugar.descripcion || "",
      actividad: lugar.actividad || "",
      personas: lugar.personas || "",
      transporte: lugar.transporte || "",
      duracion: lugar.duracion || "",
      consejos: lugar.consejos || "",
    });

    setEditingSteps(lugar.pasos || defaultSteps);
    setImageFile(null);
    setImagePreview(null);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3ECFF]">
        <p className="text-2xl font-bold text-[#4B367C]">Cargando lugar...</p>
      </main>
    );
  }

  if (isParentWithoutChild) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3ECFF] px-6">
        <section className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-lg">
          <p className="text-2xl font-extrabold text-[#4B367C]">
            No hay niño/a seleccionado
          </p>

          <p className="mt-3 text-[#6B5A95]">
            Para revisar lugares como cuidador, primero debes seleccionar un
            niño/a activo.
          </p>

          <Link
            to="/lugares"
            className="mt-6 inline-block rounded-full bg-[#9B7BE8] px-6 py-3 font-bold text-white"
          >
            Volver a lugares
          </Link>
        </section>
      </main>
    );
  }

  if (!lugar) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3ECFF] px-6">
        <section className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-lg">
          <p className="text-2xl font-extrabold text-[#4B367C]">
            Lugar no encontrado
          </p>

          <p className="mt-3 text-[#6B5A95]">
            El lugar no existe o no tienes permiso para verlo.
          </p>

          <Link
            to="/lugares"
            className="mt-6 inline-block rounded-full bg-[#9B7BE8] px-6 py-3 font-bold text-white"
          >
            Volver a lugares
          </Link>
        </section>
      </main>
    );
  }

  if (modoPreparacion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3ECFF] px-6 py-10">
        <AchievementPopup achievement={newAchievement} />
        <section className="w-full max-w-3xl rounded-[2.5rem] bg-white p-8 text-center shadow-lg">
          <p className="mb-4 font-bold text-[#9B7BE8]">
            Paso {pasoActual + 1} de {lugar.pasos.length}
          </p>

          <motion.img
            src={felix}
            alt="Félix respirando"
            className="mx-auto mb-6 h-80 w-80 object-contain"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <h1 className="mb-8 text-3xl font-extrabold text-[#4B367C] md:text-5xl">
            {lugar.pasos[pasoActual]}
          </h1>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={anteriorPaso}
              disabled={pasoActual === 0}
              className="rounded-full bg-[#E8DDFF] px-6 py-3 font-bold text-[#4B367C] disabled:opacity-40"
            >
              Anterior
            </button>

            {pasoActual === lugar.pasos.length - 1 ? (
              <button
                type="button"
                onClick={prepararLugar}
                className="rounded-full bg-green-500 px-6 py-3 font-bold text-white"
              >
                ✅ Ya estoy preparado
              </button>
            ) : (
              <button
                type="button"
                onClick={siguientePaso}
                className="rounded-full bg-[#9B7BE8] px-6 py-3 font-bold text-white"
              >
                Siguiente
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setModoPreparacion(false)}
            className="mt-6 font-semibold text-[#6B5A95]"
          >
            Volver al lugar
          </button>
        </section>
      </main>
    );
  }

  const imageUrl = getPlaceImageUrl(lugar.imagen);

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <AchievementPopup achievement={newAchievement} />
      <section className="mx-auto max-w-6xl">
        <Link
          to="/lugares"
          className="mb-6 inline-block rounded-full bg-white px-5 py-3 font-bold text-[#4B367C] shadow-sm transition hover:shadow-md"
        >
          ← Volver a lugares
        </Link>

        {isParentMode && (
          <div className="mb-6 rounded-[2rem] border-2 border-[#9ED5B3] bg-[#EAF8EF] p-5 text-center shadow-sm">
            <p className="font-bold text-[#2F6B4F]">Modo cuidador</p>

            <p className="mt-1 text-[#2F6B4F]">
              Estás viendo y gestionando este lugar de {childName}.
            </p>
          </div>
        )}

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={lugar.nombre}
            className="mb-8 h-72 w-full rounded-[2.5rem] object-cover shadow-md"
          />
        ) : (
          <div className="mb-8 flex h-72 w-full items-center justify-center rounded-[2.5rem] bg-[#E8DDFF] text-7xl">
            {lugar.emoji || "📍"}
          </div>
        )}

        <div className="rounded-[2.5rem] bg-white p-8 shadow-lg md:p-10">
          {!esDemo && (
            <div className="mb-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (editing) {
                    handleCancelEdit();
                  } else {
                    setEditing(true);
                  }
                }}
                className="rounded-full bg-[#E8DDFF] px-5 py-3 font-bold text-[#4B367C]"
              >
                {editing ? "Cancelar edición" : "Editar lugar"}
              </button>

              <button
                type="button"
                onClick={handleDeleteLugar}
                className="rounded-full bg-red-100 px-5 py-3 font-bold text-red-600"
              >
                Eliminar lugar
              </button>
            </div>
          )}

          {editing ? (
            <form
              onSubmit={handleUpdateLugar}
              className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                className="rounded-2xl border-2 border-[#DCCCF8] p-4"
              />

              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección"
                className="rounded-2xl border-2 border-[#DCCCF8] p-4"
              />
              <div className="md:col-span-2 rounded-[2rem] border-2 border-[#DCCCF8] bg-[#FDFBFF] p-5">
                <p className="mb-3 font-bold text-[#4B367C]">
                  Imagen del lugar
                </p>

                {imagePreview || imageUrl ? (
                  <img
                    src={imagePreview || imageUrl}
                    alt="Vista previa del lugar"
                    className="mb-4 h-56 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-56 w-full items-center justify-center rounded-2xl bg-[#E8DDFF] text-6xl">
                    📍
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full rounded-2xl border-2 border-[#DCCCF8] bg-white p-4 text-[#4B367C]"
                />

                <p className="mt-2 text-sm text-[#6B5A95]">
                  Si no eliges una imagen nueva, se conservará la imagen actual.
                </p>
              </div>

              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción"
                className="rounded-2xl border-2 border-[#DCCCF8] p-4 md:col-span-2"
              />

              <input
                name="actividad"
                value={form.actividad}
                onChange={handleChange}
                placeholder="¿Qué se hará allí?"
                className="rounded-2xl border-2 border-[#DCCCF8] p-4"
              />

              <input
                name="personas"
                value={form.personas}
                onChange={handleChange}
                placeholder="¿Quién estará presente?"
                className="rounded-2xl border-2 border-[#DCCCF8] p-4"
              />

              <input
                name="transporte"
                value={form.transporte}
                onChange={handleChange}
                placeholder="Medio de transporte"
                className="rounded-2xl border-2 border-[#DCCCF8] p-4"
              />

              <input
                name="duracion"
                value={form.duracion}
                onChange={handleChange}
                placeholder="Tiempo estimado"
                className="rounded-2xl border-2 border-[#DCCCF8] p-4"
              />

              <textarea
                name="consejos"
                value={form.consejos}
                onChange={handleChange}
                placeholder="Consejos o recordatorios importantes"
                className="rounded-2xl border-2 border-[#DCCCF8] p-4 md:col-span-2"
              />

              <div className="rounded-[2rem] bg-[#F3ECFF] p-6 md:col-span-2">
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-[#4B367C]">
                      Pasos para prepararme
                    </h2>

                    <p className="text-[#6B5A95]">
                      Puedes editar los pasos o pedirle a Félix que los regenere
                      con IA.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateStepsAI}
                    disabled={generandoIA}
                    className="rounded-full bg-[#4B367C] px-5 py-3 font-bold text-white hover:bg-[#3E2E68] disabled:opacity-50"
                  >
                    {generandoIA ? "Generando..." : "✨ Regenerar con Félix"}
                  </button>
                </div>

                <div className="space-y-4">
                  {editingSteps.map((step, index) => (
                    <div key={`step-${index}`} className="flex gap-3">
                      <input
                        value={step}
                        onChange={(e) =>
                          handleStepChange(index, e.target.value)
                        }
                        placeholder={`Paso ${index + 1}`}
                        className="flex-1 rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="rounded-2xl bg-red-100 px-4 font-bold text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addStep}
                  className="mt-5 rounded-full bg-white px-5 py-3 font-bold text-[#4B367C] shadow"
                >
                  + Agregar paso
                </button>
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-[#9B7BE8] py-4 font-bold text-white md:col-span-2"
              >
                Guardar cambios
              </button>
            </form>
          ) : (
            <>
              <h1 className="mb-4 text-4xl font-extrabold text-[#4B367C] md:text-6xl">
                {lugar.nombre}
              </h1>

              <p className="mb-8 text-xl text-[#6B5A95]">
                {lugar.descripcion || "Sin descripción"}
              </p>

              <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                <InfoCard
                  icono="📍"
                  titulo="Dirección"
                  texto={lugar.direccion}
                />

                <InfoCard
                  icono="✅"
                  titulo="Qué haremos"
                  texto={lugar.actividad}
                />

                <InfoCard
                  icono="👥"
                  titulo="Quién estará"
                  texto={lugar.personas}
                />

                <InfoCard
                  icono="🚗"
                  titulo="Cómo iremos"
                  texto={lugar.transporte}
                />

                <InfoCard icono="⏱️" titulo="Duración" texto={lugar.duracion} />

                <InfoCard
                  icono="💡"
                  titulo="Recordatorio"
                  texto={lugar.consejos}
                />
              </div>

              <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-[#F3ECFF] p-6 md:flex-row">
                <div>
                  <h2 className="mb-2 text-2xl font-bold text-[#4B367C]">
                    Prepararme para ir
                  </h2>

                  <p className="text-[#6B5A95]">
                    Félix te mostrará paso a paso lo que puede ocurrir.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPasoActual(0);
                    setModoPreparacion(true);
                  }}
                  className="rounded-full bg-[#9B7BE8] px-8 py-4 font-bold text-white transition hover:bg-[#8B6FD6]"
                >
                  Empezar
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

const InfoCard = ({ icono, titulo, texto }) => {
  return (
    <div className="rounded-[2rem] border-2 border-[#E4D8FF] bg-[#FDFBFF] p-5">
      <div className="mb-3 text-4xl">{icono}</div>

      <h3 className="mb-2 text-xl font-bold text-[#4B367C]">{titulo}</h3>

      <p className="text-lg text-[#6B5A95]">{texto || "Sin información"}</p>
    </div>
  );
};

export default LugarDetalle;
