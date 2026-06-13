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
    }
  };

  useEffect(() => {
    loadRoutines();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Debes iniciar sesión primero");
      return;
    }

    if (!name.trim()) {
      alert("Debes ingresar el nombre de la rutina");
      return;
    }

    if (!startTime || !endTime) {
      alert("Debes ingresar hora de inicio y hora de término");
      return;
    }

    if (endTime <= startTime) {
      alert("La hora de término debe ser posterior a la hora de inicio");
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
        const rutinaActualizada = await updateRoutine(editingId, rutina);
        console.log("Rutina actualizada:", rutinaActualizada);
        alert("Rutina actualizada correctamente");
      } else {
        const nuevaRutina = await createRoutine(rutina);
        console.log("Rutina creada:", nuevaRutina);
        alert("Rutina creada correctamente");
      }

      setName("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      setEditingId(null);

      await loadRoutines();
    } catch (error) {
      console.error(error);
      alert("Error al guardar rutina");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoutine(id);
      await loadRoutines();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la rutina");
    }
  };
  const handleCompleteRoutine = async (id) => {
    try {
      const response = await completeRoutine(id);

      if (response.unlockedAchievements?.length > 0) {
        setNewAchievement(response.unlockedAchievements[0]);
      } else {
        setNewAchievement({
          icon: "⭐",
          name: "¡Muy bien!",
          description: "Ganaste una estrella por realizar tu rutina.",
        });
      }

      setTimeout(() => {
        setNewAchievement(null);
      }, 5000);

      await loadRoutines();
    } catch (error) {
      console.error(error);
      alert("Error al completar rutina");
    }
  };

  const handleEdit = (routine) => {
    setEditingId(routine.id);
    setName(routine.name);
    setStartTime(routine.start_time);
    setEndTime(routine.end_time);
    setDescription(routine.description);
  };
  return (
    <div className="relative min-h-screen bg-[#F3ECFF] px-6 py-10 overflow-hidden">
      <AchievementPopup achievement={newAchievement} />
      {newAchievement && (
        <div className="fixed top-24 right-8 z-50 bg-white rounded-3xl shadow-xl p-6 border-4 border-yellow-300 max-w-sm">
          <div className="text-5xl mb-3">{newAchievement.icon}</div>

          <p className="text-[#9B7BE8] font-bold mb-1">
            Nuevo logro desbloqueado
          </p>

          <h3 className="font-extrabold text-2xl text-[#4B367C]">
            {newAchievement.name}
          </h3>

          <p className="text-[#6B5A95] mt-2">{newAchievement.description}</p>
        </div>
      )}

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
              Descripción
            </label>

            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la actividad, instrucciones o detalles importantes..."
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] transition resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            {editingId ? "Actualizar Rutina" : "Guardar Rutina"}
          </button>
        </form>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-lg p-8 mx-auto mt-8">
        <h2 className="text-3xl font-bold text-[#4B367C] mb-6">Mis Rutinas</h2>

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

              <p className="text-[#6B5A95] mt-2">{routine.description}</p>

              <button
                onClick={() => handleEdit(routine)}
                className="mt-4 mr-3 bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold py-2 px-4 rounded-xl"
              >
                Editar
              </button>

              <button
                onClick={() => handleCompleteRoutine(routine.id)}
                className="mt-4 mr-3 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl"
              >
                ✅ Rutina realizada
              </button>

              <button
                onClick={() => handleDelete(routine.id)}
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
