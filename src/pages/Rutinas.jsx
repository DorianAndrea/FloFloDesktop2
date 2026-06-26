import { useEffect, useState } from "react";
import felix from "../assets/webp/felix_cara_sonriendo.webp";
import {
  createRoutine,
  getRoutines,
  deleteRoutine,
  updateRoutine,
  completeRoutine,
} from "../services/routineService";
import { useFloFlo } from "../context/FloFloContext";
import { useFeedback } from "../context/FeedbackContext";
import AchievementPopup from "../components/AchievementPopup";

const Rutinas = () => {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [routines, setRoutines] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);

  const { user } = useFloFlo();
  const { showFeedback, showConfirm } = useFeedback();

  const loadRoutines = async () => {
    try {
      if (!user) return;

      const data = await getRoutines();

      const rutinasUsuario = data.filter(
        (routine) => Number(routine.user_id) === Number(user.id),
      );

      setRoutines(rutinasUsuario);
    } catch (error) {
      console.error("Error cargando rutinas:", error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudieron cargar las rutinas",
        message: "Intenta nuevamente en unos segundos.",
      });
    }
  };

  useEffect(() => {
    loadRoutines();
  }, [user]);

  const resetForm = () => {
    setName("");
    setStartTime("");
    setEndTime("");
    setDescription("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Sesión requerida",
        title: "Debes iniciar sesión",
        message: "Inicia sesión para crear o editar tus rutinas.",
      });
      return;
    }

    if (!name.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Nombre obligatorio",
        message: "Debes ingresar el nombre de la rutina.",
      });
      return;
    }

    if (!startTime || !endTime) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Faltan horarios",
        message: "Debes ingresar hora de inicio y hora de término.",
      });
      return;
    }

    if (endTime <= startTime) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Revisa el horario",
        title: "Horario inválido",
        message: "La hora de término debe ser posterior a la hora de inicio.",
      });
      return;
    }

    try {
      const rutina = {
        name: name.trim(),
        start_time: startTime,
        end_time: endTime,
        description: description.trim(),
        user_id: user.id,
      };

      if (editingId) {
        await updateRoutine(editingId, rutina);

        showFeedback({
          type: "success",
          icon: "✅",
          label: "Cambios guardados",
          title: "Rutina actualizada",
          message: "Los cambios de la rutina se guardaron correctamente.",
        });
      } else {
        await createRoutine(rutina);

        showFeedback({
          type: "success",
          icon: "✅",
          label: "Rutina creada",
          title: "Guardada correctamente",
          message: "La rutina fue creada y ya está disponible en FloFlo.",
        });
      }

      resetForm();
      await loadRoutines();
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo guardar",
        message: "Revisa los datos e intenta nuevamente.",
      });
    }
  };

  const handleDeleteRoutine = async (routine) => {
    const confirmed = await showConfirm({
      type: "danger",
      icon: "🗑️",
      label: "Eliminar rutina",
      title: "¿Eliminar esta rutina?",
      message: `Estás por eliminar "${routine.name}". Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    try {
      await deleteRoutine(routine.id);

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Rutina eliminada",
        title: "Eliminada correctamente",
        message: "La rutina fue eliminada de FloFlo.",
      });

      await loadRoutines();
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo eliminar",
        message: "Intenta nuevamente en unos segundos.",
      });
    }
  };

  const handleCompleteRoutine = async (id) => {
    try {
      const response = await completeRoutine(id);

      if (response.unlockedAchievements?.length > 0) {
        setNewAchievement(response.unlockedAchievements[0]);

        setTimeout(() => {
          setNewAchievement(null);
        }, 5000);
      } else {
        showFeedback({
          type: "success",
          icon: "⭐",
          label: "Rutina realizada",
          title: "¡Muy bien!",
          message: "Ganaste una estrella por realizar tu rutina.",
        });
      }

      await loadRoutines();
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo completar",
        message: "No se pudo marcar la rutina como realizada.",
      });
    }
  };

  const handleEdit = (routine) => {
    setEditingId(routine.id);
    setName(routine.name || "");
    setStartTime(routine.start_time || "");
    setEndTime(routine.end_time || "");
    setDescription(routine.description || "");
  };

  return (
    <div className="relative min-h-screen bg-[#F3ECFF] px-6 py-10 overflow-hidden">
      <AchievementPopup achievement={newAchievement} />

      <img
        src={felix}
        alt="Félix"
        className="hidden xl:block absolute right-28 top-32 w-60 h-60 object-contain"
      />

      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-lg p-10 mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-[#4B367C] text-center mb-4">
          Nueva Rutina
        </h1>

        <p className="text-center text-[#6B5A95] text-lg mb-10">
          Crea una actividad para acompañar el día de Félix.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Nombre de la rutina
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Lavarse los dientes"
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] transition"
            />
          </div>

          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Hora de inicio
            </label>

            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] transition"
            />
          </div>

          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Hora de término
            </label>

            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] transition"
            />
          </div>

          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Descripción{" "}
              <span className="text-[#9B7BE8] font-normal">(opcional)</span>
            </label>

            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la actividad, instrucciones o detalles opcionales..."
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] transition resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            {editingId ? "Actualizar Rutina" : "Guardar Rutina"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full bg-[#E8DDFF] hover:bg-[#D8C7FF] text-[#4B367C] font-bold py-4 rounded-2xl transition"
            >
              Cancelar edición
            </button>
          )}
        </form>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-lg p-8 mx-auto mt-8">
        <h2 className="text-3xl font-bold text-[#4B367C] mb-6">
          Mis Rutinas
        </h2>

        {routines.length === 0 ? (
          <p className="text-[#6B5A95]">No hay rutinas creadas todavía.</p>
        ) : (
          routines.map((routine) => (
            <div
              key={routine.id}
              className="border-2 border-[#DCCCF8] rounded-2xl p-4 mb-4"
            >
              <h3 className="text-xl font-bold text-[#4B367C]">
                {routine.name}
              </h3>

              <p className="text-[#6B5A95]">
                {routine.start_time} - {routine.end_time}
              </p>

              {routine.description && (
                <p className="text-[#6B5A95] mt-2">{routine.description}</p>
              )}

              <button
                type="button"
                onClick={() => handleEdit(routine)}
                className="mt-4 mr-3 bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold py-2 px-4 rounded-xl"
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => handleCompleteRoutine(routine.id)}
                className="mt-4 mr-3 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl"
              >
                ✅ Rutina realizada
              </button>

              <button
                type="button"
                onClick={() => handleDeleteRoutine(routine)}
                className="mt-4 bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-xl"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Rutinas;