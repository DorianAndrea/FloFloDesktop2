import { useEffect, useMemo, useState } from "react";
import felix from "../assets/webp/felix_cara_sonriendo.webp";
import {
  createRoutine,
  getRoutines,
  getTodayRoutines,
  getRoutineHistory,
  deleteRoutine,
  updateRoutine,
  completeRoutine,
  getChildRoutines,
  getChildTodayRoutines,
  getChildRoutineHistory,
  createChildRoutine,
  updateChildRoutine,
  deleteChildRoutine,
  completeChildRoutine,
} from "../services/routineService";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import AchievementPopup from "../components/AchievementPopup";
import { getCachedData, setCachedData } from "../utils/cache";

const DAYS = [
  { key: "monday", label: "Lun", fullLabel: "Lunes" },
  { key: "tuesday", label: "Mar", fullLabel: "Martes" },
  { key: "wednesday", label: "Mié", fullLabel: "Miércoles" },
  { key: "thursday", label: "Jue", fullLabel: "Jueves" },
  { key: "friday", label: "Vie", fullLabel: "Viernes" },
  { key: "saturday", label: "Sáb", fullLabel: "Sábado" },
  { key: "sunday", label: "Dom", fullLabel: "Domingo" },
];

const ALL_DAYS = DAYS.map((day) => day.key);

const dayNames = {
  monday: "lunes",
  tuesday: "martes",
  wednesday: "miércoles",
  thursday: "jueves",
  friday: "viernes",
  saturday: "sábado",
  sunday: "domingo",
};

const formatTime = (time) => {
  if (!time) return "";
  return String(time).slice(0, 5);
};

const formatDays = (days = []) => {
  if (!Array.isArray(days) || days.length === 0) {
    return "Todos los días";
  }

  const normalizedDays = [...new Set(days)];

  if (normalizedDays.length === 7) {
    return "Todos los días";
  }

  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const isWeekdays =
    normalizedDays.length === 5 &&
    weekdays.every((day) => normalizedDays.includes(day));

  if (isWeekdays) {
    return "Lunes a viernes";
  }

  return normalizedDays
    .map((day) => DAYS.find((item) => item.key === day)?.fullLabel || day)
    .join(", ");
};

const Rutinas = () => {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState(ALL_DAYS);

  const [allRoutines, setAllRoutines] = useState([]);
  const [todayRoutines, setTodayRoutines] = useState([]);
  const [todayInfo, setTodayInfo] = useState(null);
  const [history, setHistory] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { user } = useFloFlo();

  const {
    isParent,
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,
  } = useSelectedChild();

  const { showFeedback, showConfirm } = useFeedback();

  const isParentMode = isParent && Boolean(selectedChildId);
  const isParentWithoutChild = isParent && !selectedChildId;

  const childName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "el niño/a seleccionado";

  const pendingToday = useMemo(
    () => todayRoutines.filter((routine) => !routine.completed_today),
    [todayRoutines],
  );

  const completedToday = useMemo(
    () => todayRoutines.filter((routine) => routine.completed_today),
    [todayRoutines],
  );

  const loadRoutines = async ({ useCache = true } = {}) => {
    try {
      if (!user) return;

      if (isParent && loadingChildren) {
        return;
      }

      const ownerId = isParentMode ? selectedChildId : user.id;
      const cacheKey = `floflo_routines_${ownerId}`;

      if (isParentWithoutChild) {
        setAllRoutines([]);
        setTodayRoutines([]);
        setTodayInfo(null);
        setHistory([]);
        setLoading(false);
        return;
      }

      if (useCache) {
        const cachedRoutines = getCachedData(cacheKey);

        if (cachedRoutines) {
          setAllRoutines(
            Array.isArray(cachedRoutines.allRoutines)
              ? cachedRoutines.allRoutines
              : [],
          );

          setTodayRoutines(
            Array.isArray(cachedRoutines.todayRoutines)
              ? cachedRoutines.todayRoutines
              : [],
          );

          setTodayInfo(cachedRoutines.todayInfo || null);

          setHistory(
            Array.isArray(cachedRoutines.history) ? cachedRoutines.history : [],
          );

          setLoading(false);
        } else {
          setLoading(true);
        }
      } else {
        setLoading(true);
      }

      const [allData, todayData, historyData] = await Promise.all([
        isParentMode ? getChildRoutines(selectedChildId) : getRoutines(),
        isParentMode
          ? getChildTodayRoutines(selectedChildId)
          : getTodayRoutines(),
        isParentMode
          ? getChildRoutineHistory(selectedChildId)
          : getRoutineHistory(),
      ]);

      const safeAllRoutines = Array.isArray(allData) ? allData : [];
      const safeTodayRoutines = Array.isArray(todayData?.routines)
        ? todayData.routines
        : [];
      const safeTodayInfo = todayData || null;
      const safeHistory = Array.isArray(historyData) ? historyData : [];

      setAllRoutines(safeAllRoutines);
      setTodayRoutines(safeTodayRoutines);
      setTodayInfo(safeTodayInfo);
      setHistory(safeHistory);

      setCachedData(cacheKey, {
        allRoutines: safeAllRoutines,
        todayRoutines: safeTodayRoutines,
        todayInfo: safeTodayInfo,
        history: safeHistory,
      });
    } catch (error) {
      console.error("Error cargando rutinas:", error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudieron cargar las rutinas",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutines();
  }, [user?.id, user?.role, selectedChildId, loadingChildren]);

  useEffect(() => {
    resetForm();
  }, [selectedChildId, user?.id]);

  const resetForm = () => {
    setName("");
    setStartTime("");
    setEndTime("");
    setDescription("");
    setSelectedDays(ALL_DAYS);
    setEditingId(null);
  };

  const toggleDay = (dayKey) => {
    setSelectedDays((currentDays) => {
      if (currentDays.includes(dayKey)) {
        return currentDays.filter((day) => day !== dayKey);
      }

      return [...currentDays, dayKey];
    });
  };

  const selectAllDays = () => {
    setSelectedDays(ALL_DAYS);
  };

  const selectWeekDays = () => {
    setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday"]);
  };

  const validateParentChildSelection = () => {
    if (!isParent) return true;

    if (!selectedChildId) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta niño/a activo",
        title: "Selecciona un niño/a",
        message:
          "Para gestionar rutinas como cuidador, primero debes tener un niño/a asociado y seleccionado.",
      });

      return false;
    }

    return true;
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

    if (!validateParentChildSelection()) return;

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

    if (selectedDays.length === 0) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Faltan días",
        title: "Selecciona al menos un día",
        message: "Debes elegir qué días se repetirá esta rutina.",
      });
      return;
    }

    try {
      setSaving(true);

      const routineData = {
        name: name.trim(),
        start_time: startTime,
        end_time: endTime,
        description: description.trim(),
        days_of_week: selectedDays,
      };

      if (editingId) {
        if (isParentMode) {
          await updateChildRoutine(selectedChildId, editingId, routineData);
        } else {
          await updateRoutine(editingId, routineData);
        }

        showFeedback({
          type: "success",
          icon: "✅",
          label: "Cambios guardados",
          title: "Rutina actualizada",
          message: isParentMode
            ? `Los cambios de la rutina de ${childName} se guardaron correctamente.`
            : "Los cambios de la rutina se guardaron correctamente.",
        });
      } else {
        if (isParentMode) {
          await createChildRoutine(selectedChildId, routineData);
        } else {
          await createRoutine(routineData);
        }

        showFeedback({
          type: "success",
          icon: "✅",
          label: "Rutina creada",
          title: "Guardada correctamente",
          message: isParentMode
            ? `La rutina fue creada para ${childName}.`
            : "La rutina fue creada y ya está disponible en FloFlo.",
        });
      }

      resetForm();
      await loadRoutines({ useCache: false });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo guardar",
        message:
          error.response?.data?.message ||
          "Revisa los datos e intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoutine = async (routine) => {
    if (!validateParentChildSelection()) return;

    const confirmed = await showConfirm({
      type: "danger",
      icon: "🗑️",
      label: "Eliminar rutina",
      title: "¿Eliminar esta rutina?",
      message: `Estás por eliminar "${routine.name}". Su historial se conservará, pero ya no aparecerá como rutina activa.`,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    try {
      if (isParentMode) {
        await deleteChildRoutine(selectedChildId, routine.id);
      } else {
        await deleteRoutine(routine.id);
      }

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Rutina eliminada",
        title: "Eliminada correctamente",
        message: isParentMode
          ? `La rutina fue eliminada para ${childName}.`
          : "La rutina fue eliminada de FloFlo.",
      });

      if (Number(editingId) === Number(routine.id)) {
        resetForm();
      }

      await loadRoutines({ useCache: false });
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

  const handleCompleteRoutine = async (routine) => {
    if (!validateParentChildSelection()) return;

    if (routine.completed_today) {
      showFeedback({
        type: "info",
        icon: "💜",
        label: "Ya realizada",
        title: "Esta rutina ya fue completada hoy",
        message: "Mañana podrás volver a marcarla como realizada.",
      });
      return;
    }

    try {
      const response = isParentMode
        ? await completeChildRoutine(selectedChildId, routine.id)
        : await completeRoutine(routine.id);

      if (response.alreadyCompleted) {
        showFeedback({
          type: "info",
          icon: "💜",
          label: "Ya realizada",
          title: "Esta rutina ya estaba completada hoy",
          message: "Mañana podrás volver a completarla.",
        });
      } else if (response.unlockedAchievements?.length > 0) {
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
          message: isParentMode
            ? `La rutina de ${childName} quedó marcada como realizada.`
            : "Ganaste una estrella por realizar tu rutina.",
        });
      }

      await loadRoutines({ useCache: false });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo completar",
        message:
          error.response?.data?.message ||
          "No se pudo marcar la rutina como realizada.",
      });
    }
  };

  const handleEdit = (routine) => {
    setEditingId(routine.id);
    setName(routine.name || "");
    setStartTime(formatTime(routine.start_time));
    setEndTime(formatTime(routine.end_time));
    setDescription(routine.description || "");
    setSelectedDays(
      Array.isArray(routine.days_of_week) && routine.days_of_week.length > 0
        ? routine.days_of_week
        : ALL_DAYS,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const isScheduledToday = (routine) => {
    if (!todayInfo?.day) return false;
    if (!Array.isArray(routine.days_of_week)) return true;
    return routine.days_of_week.includes(todayInfo.day);
  };

  const renderRoutineCard = (routine, options = {}) => {
    const { showCompleteButton = false, compact = false } = options;

    return (
      <div
        key={routine.id}
        className={`border-2 rounded-3xl p-5 transition ${
          routine.completed_today
            ? "border-green-200 bg-green-50"
            : "border-[#DCCCF8] bg-white"
        }`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-[#4B367C]">
                {routine.name}
              </h3>

              {routine.completed_today && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Hecha hoy
                </span>
              )}

              {!routine.completed_today && isScheduledToday(routine) && (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                  Pendiente hoy
                </span>
              )}

              {!isScheduledToday(routine) && (
                <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-bold text-[#6B5A95]">
                  No toca hoy
                </span>
              )}
            </div>

            <p className="mt-2 text-[#6B5A95]">
              {formatTime(routine.start_time)} - {formatTime(routine.end_time)}
            </p>

            <p className="mt-1 text-sm font-semibold text-[#9B7BE8]">
              {formatDays(routine.days_of_week)}
            </p>

            {routine.description && !compact && (
              <p className="mt-3 text-[#6B5A95]">{routine.description}</p>
            )}

            {routine.today_completed_at && (
              <p className="mt-3 text-sm font-semibold text-green-700">
                Completada hoy a las{" "}
                {new Date(routine.today_completed_at).toLocaleTimeString(
                  "es-CL",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            {showCompleteButton && (
              <button
                type="button"
                onClick={() => handleCompleteRoutine(routine)}
                disabled={routine.completed_today}
                className={`rounded-2xl px-4 py-2 font-bold text-white transition ${
                  routine.completed_today
                    ? "cursor-not-allowed bg-green-300"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {routine.completed_today ? "✅ Lista" : "⭐ Realizada"}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleEdit(routine)}
              className="rounded-2xl bg-[#9B7BE8] px-4 py-2 font-bold text-white transition hover:bg-[#8B6FD6]"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => handleDeleteRoutine(routine)}
              className="rounded-2xl bg-red-400 px-4 py-2 font-bold text-white transition hover:bg-red-500"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F3ECFF] px-4 py-10 md:px-6">
      <AchievementPopup achievement={newAchievement} />

      <img
        src={felix}
        alt="Félix"
        className="pointer-events-none absolute right-10 top-28 hidden h-52 w-52 object-contain opacity-95 xl:block"
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-lg font-bold text-[#9B7BE8]">
            Rutinas de FloFlo
          </p>

          <h1 className="text-4xl font-extrabold text-[#4B367C] md:text-6xl">
            {isParentMode ? `Rutinas de ${childName}` : "Organiza tu día"}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#6B5A95]">
            {isParentMode
              ? "Gestiona las rutinas del niño/a seleccionado desde el modo cuidador."
              : "Crea rutinas por día, marca las actividades realizadas y revisa tu avance diario."}
          </p>
        </div>

        {isParent && (
          <div className="mb-8 rounded-[2rem] border-2 border-[#9ED5B3] bg-[#EAF8EF] p-5 text-center shadow-sm">
            <p className="font-bold text-[#2F6B4F]">Modo cuidador activo</p>

            <p className="mt-1 text-[#2F6B4F]">
              {selectedChild
                ? `Estás viendo y gestionando rutinas de ${childName}.`
                : "No hay un niño/a activo seleccionado."}
            </p>
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-lg">
            <p className="text-sm font-bold uppercase tracking-wide text-[#9B7BE8]">
              Hoy
            </p>
            <p className="mt-2 text-4xl font-extrabold text-[#4B367C]">
              {todayRoutines.length}
            </p>
            <p className="mt-1 text-[#6B5A95]">
              rutinas para {todayInfo?.day ? dayNames[todayInfo.day] : "hoy"}
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-lg">
            <p className="text-sm font-bold uppercase tracking-wide text-yellow-600">
              Pendientes
            </p>
            <p className="mt-2 text-4xl font-extrabold text-[#4B367C]">
              {pendingToday.length}
            </p>
            <p className="mt-1 text-[#6B5A95]">por completar hoy</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-lg">
            <p className="text-sm font-bold uppercase tracking-wide text-green-600">
              Completadas
            </p>
            <p className="mt-2 text-4xl font-extrabold text-[#4B367C]">
              {completedToday.length}
            </p>
            <p className="mt-1 text-[#6B5A95]">realizadas hoy</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[2rem] bg-white p-6 shadow-lg md:p-8">
            <h2 className="text-3xl font-extrabold text-[#4B367C]">
              {editingId ? "Editar rutina" : "Nueva rutina"}
            </h2>

            <p className="mt-2 text-[#6B5A95]">
              {isParentMode
                ? `Esta rutina se guardará para ${childName}.`
                : "Elige el horario y los días en que se repetirá."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block font-semibold text-[#4B367C]">
                  Nombre de la rutina
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Lavarse los dientes"
                  className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4 transition focus:border-[#9B7BE8] focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold text-[#4B367C]">
                    Hora de inicio
                  </label>

                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4 transition focus:border-[#9B7BE8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-[#4B367C]">
                    Hora de término
                  </label>

                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4 transition focus:border-[#9B7BE8] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <label className="font-semibold text-[#4B367C]">
                    Días de la semana
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={selectAllDays}
                      className="rounded-full bg-[#F3ECFF] px-3 py-1 text-sm font-bold text-[#6B5A95] transition hover:bg-[#E8DDFF]"
                    >
                      Todos
                    </button>

                    <button
                      type="button"
                      onClick={selectWeekDays}
                      className="rounded-full bg-[#F3ECFF] px-3 py-1 text-sm font-bold text-[#6B5A95] transition hover:bg-[#E8DDFF]"
                    >
                      Lun a vie
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day.key);

                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`rounded-2xl border-2 px-3 py-3 text-sm font-extrabold transition ${
                          isSelected
                            ? "border-[#9B7BE8] bg-[#9B7BE8] text-white"
                            : "border-[#DCCCF8] bg-white text-[#6B5A95] hover:bg-[#F3ECFF]"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-semibold text-[#4B367C]">
                  Descripción{" "}
                  <span className="font-normal text-[#9B7BE8]">(opcional)</span>
                </label>

                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe la actividad, instrucciones o detalles opcionales..."
                  className="w-full resize-none rounded-2xl border-2 border-[#DCCCF8] p-4 transition focus:border-[#9B7BE8] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving || isParentWithoutChild}
                className="w-full rounded-2xl bg-[#9B7BE8] py-4 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#8B6FD6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Guardando..."
                  : editingId
                    ? "Actualizar rutina"
                    : isParentMode
                      ? "Guardar rutina para niño/a"
                      : "Guardar rutina"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-2xl bg-[#E8DDFF] py-4 font-bold text-[#4B367C] transition hover:bg-[#D8C7FF]"
                >
                  Cancelar edición
                </button>
              )}
            </form>
          </section>

          <section className="space-y-8">
            <div className="rounded-[2rem] bg-white p-6 shadow-lg md:p-8">
              <h2 className="text-3xl font-extrabold text-[#4B367C]">
                Rutinas de hoy
              </h2>

              <p className="mt-2 text-[#6B5A95]">
                {todayInfo?.date
                  ? `Hoy es ${dayNames[todayInfo.day] || todayInfo.day}.`
                  : "Estas son las actividades programadas para hoy."}
              </p>

              {loading ? (
                <p className="mt-6 text-[#6B5A95]">Cargando rutinas...</p>
              ) : todayRoutines.length === 0 ? (
                <div className="mt-6 rounded-3xl border-2 border-dashed border-[#DCCCF8] p-6 text-center">
                  <p className="text-lg font-bold text-[#4B367C]">
                    No hay rutinas para hoy
                  </p>
                  <p className="mt-2 text-[#6B5A95]">
                    Puedes crear una rutina nueva o editar sus días.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {pendingToday.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-xl font-bold text-[#4B367C]">
                        Pendientes
                      </h3>

                      <div className="space-y-4">
                        {pendingToday.map((routine) =>
                          renderRoutineCard(routine, {
                            showCompleteButton: true,
                          }),
                        )}
                      </div>
                    </div>
                  )}

                  {completedToday.length > 0 && (
                    <div>
                      <h3 className="mb-3 mt-6 text-xl font-bold text-green-700">
                        Completadas
                      </h3>

                      <div className="space-y-4">
                        {completedToday.map((routine) =>
                          renderRoutineCard(routine, {
                            showCompleteButton: true,
                          }),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg md:p-8">
              <h2 className="text-3xl font-extrabold text-[#4B367C]">
                {isParentMode ? `Rutinas de ${childName}` : "Todas mis rutinas"}
              </h2>

              <p className="mt-2 text-[#6B5A95]">
                {isParentMode
                  ? `Administra las rutinas activas de ${childName}.`
                  : "Administra tus rutinas activas y sus días."}
              </p>

              {loading ? (
                <p className="mt-6 text-[#6B5A95]">Cargando...</p>
              ) : allRoutines.length === 0 ? (
                <p className="mt-6 text-[#6B5A95]">
                  No hay rutinas creadas todavía.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {allRoutines.map((routine) =>
                    renderRoutineCard(routine, {
                      compact: true,
                    }),
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-lg md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-[#4B367C]">
                Historial reciente
              </h2>
              <p className="mt-2 text-[#6B5A95]">
                {isParentMode
                  ? `Aquí aparecen las rutinas que ${childName} ya realizó.`
                  : "Aquí aparecen las rutinas que ya marcaste como realizadas."}
              </p>
            </div>
            <p className="text-sm font-bold text-[#9B7BE8]">
              El historial se mantiene aunque la rutina ya no esté en la lista
              activa.
            </p>
          </div>

          {history.length === 0 ? (
            <div className="mt-6 rounded-3xl border-2 border-dashed border-[#DCCCF8] p-6 text-center">
              <p className="font-bold text-[#4B367C]">
                Aún no hay historial de rutinas.
              </p>
              <p className="mt-2 text-[#6B5A95]">
                Cuando marques una rutina como realizada, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {history.slice(0, 8).map((item) => (
                <div
                  key={`${item.routine_id}-${item.completion_date}-${item.id}`}
                  className="rounded-3xl border-2 border-[#DCCCF8] p-5"
                >
                  <p className="text-lg font-extrabold text-[#4B367C]">
                    {item.name}
                  </p>

                  <p className="mt-1 text-[#6B5A95]">
                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                  </p>

                  <p className="mt-2 text-sm font-bold text-green-700">
                    Realizada el{" "}
                    {new Date(item.completion_date).toLocaleDateString("es-CL")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Rutinas;
