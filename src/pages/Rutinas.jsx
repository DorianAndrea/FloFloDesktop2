import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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
  completeRoutineStep,
  completeChildRoutineStep,
  uncompleteRoutineStep,
  uncompleteChildRoutineStep,
} from "../services/routineService";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import AchievementPopup from "../components/AchievementPopup";
import { getCachedData, setCachedData } from "../utils/cache";
import { showUnlockedAchievements } from "../utils/showUnlockedAchievements";
import { getLearningContexts } from "../services/learningContextService";
import ContextPicker from "../components/routines/ContextPicker";
import DroppableFloPanel from "../components/design-system/cards/DroppableFloPanel";
import FloCard from "../components/design-system/cards/FloCard";
import RoutineHeader from "../components/routines/RoutineHeader";
import RoutineDashboard from "../components/routines/RoutineDashboard";
import RoutineExperienceFlow from "../components/routines/RoutineExperienceFlow";
import RoutineHistory from "../components/routines/RoutineHistory";
import RoutineCard from "../components/routines/RoutineCard";
import { getExperienceTemplate } from "../services/experienceTemplateService";
import { registerExperienceRecent } from "../services/experienceRecentService";

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

const RELATIONSHIP_LABELS = {
  primary_caregiver: "Cuidador/a principal",
  caregiver: "Cuidador/a",
  family: "Familiar",
  occupational_therapist: "Terapeuta ocupacional",
  psychologist: "Psicólogo/a",
  speech_therapist: "Fonoaudiólogo/a",
  teacher: "Profesor/a",
  other_professional: "Otro profesional",
};

const ACCESS_PROFILE_LABELS = {
  primary_caregiver: "Cuidador/a principal",
  caregiver: "Cuidador/a",
  family: "Familiar",
  therapist: "Profesional de terapia",
  teacher: "Profesor/a",
  professional: "Otro profesional",
  child: "Niño/a",
};

const getSupportProfileLabel = (relationshipKey, accessProfile) => {
  return (
    RELATIONSHIP_LABELS[relationshipKey] ||
    ACCESS_PROFILE_LABELS[accessProfile] ||
    "Adulto/a de apoyo"
  );
};

const getFullName = (firstName, lastName) => {
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  return fullName || "Usuario FloFlo";
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
  const [learningContexts, setLearningContexts] = useState([]);
  const [selectedLearningContext, setSelectedLearningContext] = useState(null);
  const [loadingContexts, setLoadingContexts] = useState(true);

  const [allRoutines, setAllRoutines] = useState([]);
  const [todayRoutines, setTodayRoutines] = useState([]);
  const [todayInfo, setTodayInfo] = useState(null);
  const [history, setHistory] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [experienceView, setExperienceView] = useState(null);
  const [selectedExperienceTemplateId, setSelectedExperienceTemplateId] =
    useState(null);
  const [selectedExperienceTemplate, setSelectedExperienceTemplate] =
    useState(null);

  const [updatingStepKey, setUpdatingStepKey] = useState(null);
  const { user } = useFloFlo();

  const {
    isParent,
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,

    selectedAccessProfile,
    selectedRelationshipKey,
    canManageSelectedChildTeam,

    isCaregiver,
    isTherapist,
    isTeacher,
    isFamily,
    isProfessional,
  } = useSelectedChild();

  const { showFeedback, showConfirm } = useFeedback();

  const dndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const isParentMode = isParent && Boolean(selectedChildId);
  const isParentWithoutChild = isParent && !selectedChildId;

  const canCreateOrEditRoutines =
    !isParent ||
    [
      "primary_caregiver",
      "caregiver",
      "therapist",
      "teacher",
      "professional",
    ].includes(selectedAccessProfile);

  const canDeleteRoutines =
    !isParent ||
    ["primary_caregiver", "caregiver"].includes(selectedAccessProfile);

  const supportModeLabel = (() => {
    if (canManageSelectedChildTeam) return "Modo cuidador principal";
    if (isTherapist) return "Modo profesional";
    if (isTeacher) return "Modo educativo";
    if (isFamily) return "Modo familiar";
    if (isProfessional) return "Modo profesional";
    if (isCaregiver) return "Modo cuidador";

    return "Modo adulto de apoyo";
  })();

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

  const loadLearningContexts = async () => {
    try {
      setLoadingContexts(true);

      const data = await getLearningContexts();
      setLearningContexts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando contextos de aprendizaje:", error);

      setLearningContexts([]);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Contextos no disponibles",
        title: "No se pudieron cargar los contextos",
        message:
          error.response?.data?.message ||
          "Revisa la conexión e intenta nuevamente.",
      });
    } finally {
      setLoadingContexts(false);
    }
  };

  useEffect(() => {
    loadLearningContexts();
  }, []);

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
    setSelectedLearningContext(null);
    setEditingId(null);
    setExperienceView(null);
    setSelectedExperienceTemplateId(null);
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

  const handleLearningContextSelect = (context) => {
    if (!context) return;
    setSelectedLearningContext(context);
  };

  const handleLearningContextDragEnd = (event) => {
    const { active, over } = event;

    if (!over || over.id !== "routine-learning-context") {
      return;
    }

    const draggedData = active.data.current;

    if (draggedData?.type !== "learning-context" || !draggedData?.context) {
      return;
    }

    setSelectedLearningContext(draggedData.context);
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

    if (!canCreateOrEditRoutines) {
      showFeedback({
        type: "warning",
        icon: "🔒",
        label: "Acceso de consulta",
        title: "No puedes modificar rutinas",
        message:
          "Tu perfil puede revisar y completar rutinas, pero no crear ni editar actividades.",
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

    if (!selectedLearningContext?.id) {
      showFeedback({
        type: "warning",
        icon: "📍",
        label: "Falta contexto",
        title: "Selecciona un contexto de aprendizaje",
        message:
          "Arrastra una FloCard hacia la rutina o toca una tarjeta para seleccionarla.",
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
        learning_context_id: Number(selectedLearningContext.id),
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

    if (!canDeleteRoutines) {
      showFeedback({
        type: "warning",
        icon: "🔒",
        label: "Acción restringida",
        title: "No puedes eliminar rutinas",
        message: "Solo una cuenta cuidadora puede eliminar rutinas del niño/a.",
      });

      return;
    }

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

      const ownerId = isParentMode ? selectedChildId : user.id;
      localStorage.removeItem(`floflo_achievements_${ownerId}`);

      if (response.alreadyCompleted) {
        showFeedback({
          type: "info",
          icon: "💜",
          label: "Ya realizada",
          title: "Esta rutina ya estaba completada hoy",
          message: "Mañana podrás volver a completarla.",
        });

        await loadRoutines({ useCache: false });
        return;
      }

      const unlockedAchievements = Array.isArray(response?.unlockedAchievements)
        ? response.unlockedAchievements
        : [];

      if (unlockedAchievements.length > 0) {
        showUnlockedAchievements(showFeedback, unlockedAchievements);

        setNewAchievement(unlockedAchievements[0]);

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

    const routineContext = learningContexts.find(
      (context) => Number(context.id) === Number(routine.learning_context_id),
    );

    setSelectedLearningContext(routineContext || null);

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

  const handleToggleRoutineStep = async (routine, step) => {
    if (!validateParentChildSelection()) {
      return;
    }

    const stepKey = `${routine.id}:${step.id}`;

    if (updatingStepKey === stepKey) {
      return;
    }

    try {
      setUpdatingStepKey(stepKey);

      if (step.completed_today) {
        if (isParentMode) {
          await uncompleteChildRoutineStep(
            selectedChildId,
            routine.id,
            step.id,
          );
        } else {
          await uncompleteRoutineStep(routine.id, step.id);
        }
      } else {
        const progressData = {
          support_level: "independent",
          notes: "",
        };

        if (isParentMode) {
          await completeChildRoutineStep(
            selectedChildId,
            routine.id,
            step.id,
            progressData,
          );
        } else {
          await completeRoutineStep(routine.id, step.id, progressData);
        }
      }

      await loadRoutines({
        useCache: false,
      });
    } catch (error) {
      console.error("Error actualizando paso:", error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "No se pudo guardar",
        title: "Error al actualizar el paso",
        message: error.response?.data?.message || "Intenta nuevamente.",
      });
    } finally {
      setUpdatingStepKey(null);
    }
  };
  if (
    experienceView === "library" ||
    experienceView === "detail" ||
    experienceView === "builder"
  ) {
    return (
      <div className="min-h-screen bg-[#F3ECFF] px-4 py-10 md:px-6">
        <div className="mx-auto max-w-6xl">
          {experienceView === "library" && (
            <button
              type="button"
              onClick={() => {
                setSelectedExperienceTemplateId(null);
                setExperienceView(null);
              }}
              className="mb-6 rounded-2xl border-2 border-[#DCCCF8] bg-white px-5 py-3 font-extrabold text-[#5F4A8B] transition hover:bg-[#F7F3FF]"
            >
              ← Volver a rutinas
            </button>
          )}
          <RoutineExperienceFlow
            canCreateOrEditRoutines={canCreateOrEditRoutines}
            editingId={editingId}
            experienceView={experienceView}
            selectedTemplateId={selectedExperienceTemplateId}
            selectedTemplate={selectedExperienceTemplate}
            childId={isParentMode ? selectedChildId : null}

            onOpenLibrary={() => {
              setSelectedExperienceTemplateId(null);
              setSelectedExperienceTemplate(null);
              setExperienceView("library");
            }}
            onSelectTemplate={async (templateId) => {
              try {
                const template = await getExperienceTemplate(templateId);

                setSelectedExperienceTemplateId(templateId);
                setSelectedExperienceTemplate(template);
                setExperienceView("detail");

                try {
                  await registerExperienceRecent(
                    templateId,
                    isParentMode ? selectedChildId : null,
                  );
                } catch (recentError) {
                  console.error(
                    "Error registrando experiencia reciente:",
                    recentError,
                  );
                }
              } catch (error) {
                console.error("Error abriendo experiencia:", error);
              }
            }}
            onBackToLibrary={() => {
              setSelectedExperienceTemplateId(null);
              setSelectedExperienceTemplate(null);
              setExperienceView("library");
            }}
            onUseTemplate={() => {
              setExperienceView("builder");
            }}
            onCreated={async () => {
              setSelectedExperienceTemplateId(null);
              setSelectedExperienceTemplate(null);
              setExperienceView(null);

              await loadRoutines({
                useCache: false,
              });
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F3ECFF] px-4 py-10 md:px-6">
      <AchievementPopup achievement={newAchievement} />

      <img
        src={felix}
        alt="Félix"
        className="pointer-events-none absolute right-10 top-28 hidden h-52 w-52 object-contain opacity-95 xl:block"
      />

      <div className="mx-auto max-w-6xl">
        {experienceView === null && (
          <>
            <RoutineHeader
              isParentMode={isParentMode}
              childName={childName}
              canCreateOrEditRoutines={canCreateOrEditRoutines}
              isParent={isParent}
              supportModeLabel={supportModeLabel}
              selectedChild={selectedChild}
            />

            <RoutineDashboard
              todayCount={todayRoutines.length}
              pendingCount={pendingToday.length}
              completedCount={completedToday.length}
              dayLabel={todayInfo?.day ? dayNames[todayInfo.day] : "hoy"}
            />
          </>
        )}

        <RoutineExperienceFlow
          canCreateOrEditRoutines={canCreateOrEditRoutines}
          editingId={editingId}
          experienceView={experienceView}
          selectedTemplateId={selectedExperienceTemplateId}
          selectedTemplate={selectedExperienceTemplate}
          childId={isParentMode ? selectedChildId : null}
          
          onOpenLibrary={() => {
            setSelectedExperienceTemplateId(null);
            setSelectedExperienceTemplate(null);
            setExperienceView("library");
          }}
          onSelectTemplate={async (templateId) => {
            try {
              const template = await getExperienceTemplate(templateId);

              setSelectedExperienceTemplateId(templateId);
              setSelectedExperienceTemplate(template);
              setExperienceView("detail");

              try {
                await registerExperienceRecent(
                  templateId,
                  isParentMode ? selectedChildId : null,
                );
              } catch (recentError) {
                console.error(
                  "Error registrando experiencia reciente:",
                  recentError,
                );
              }
            } catch (error) {
              console.error("Error abriendo experiencia:", error);
            }
          }}
          onBackToLibrary={() => {
            setSelectedExperienceTemplateId(null);
            setSelectedExperienceTemplate(null);
            setExperienceView("library");
          }}
          onUseTemplate={() => {
            setExperienceView("builder");
          }}
          onCreated={async () => {
            setSelectedExperienceTemplateId(null);
            setSelectedExperienceTemplate(null);
            setExperienceView(null);

            await loadRoutines({
              useCache: false,
            });
          }}
        />

        {experienceView === null && (
          <>
            <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
              {canCreateOrEditRoutines && editingId ? (
                <section className="rounded-[2rem] bg-white p-6 shadow-lg md:p-8">
                  <h2 className="text-3xl font-extrabold text-[#4B367C]">
                    Editar rutina
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

                    <DndContext
                      sensors={dndSensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleLearningContextDragEnd}
                    >
                      <div className="space-y-6 rounded-[2rem] border-2 border-[#E8DFFF] bg-[#FCFAFF] p-5">
                        <ContextPicker
                          contexts={learningContexts}
                          selectedContext={selectedLearningContext}
                          loading={loadingContexts}
                          disabled={saving}
                          onSelect={handleLearningContextSelect}
                        />

                        <DroppableFloPanel
                          id="routine-learning-context"
                          data={{
                            type: "routine-learning-context-dropzone",
                          }}
                          title="Contexto de esta rutina"
                          description="Arrastra aquí el lugar donde ocurre normalmente."
                          emptyTitle="Arrastra una FloCard aquí"
                          emptyDescription="El contexto seleccionado acompañará la evidencia cognitiva de esta rutina."
                          icon="📍"
                          disabled={saving}
                          hasContent={Boolean(selectedLearningContext)}
                        >
                          {selectedLearningContext && (
                            <FloCard
                              title={selectedLearningContext.name}
                              subtitle={selectedLearningContext.description}
                              icon={selectedLearningContext.icon}
                              selected
                              compact
                              actionLabel="Quitar"
                              onAction={() => setSelectedLearningContext(null)}
                            />
                          )}
                        </DroppableFloPanel>
                      </div>
                    </DndContext>

                    <div>
                      <label className="mb-2 block font-semibold text-[#4B367C]">
                        Descripción{" "}
                        <span className="font-normal text-[#9B7BE8]">
                          (opcional)
                        </span>
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
                      {saving ? "Guardando..." : "Actualizar rutina"}
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
              ) : !canCreateOrEditRoutines ? (
                <section className="rounded-[2rem] border-2 border-[#DCCCF8] bg-white p-8 text-center shadow-lg">
                  <p className="text-5xl">👀</p>

                  <h2 className="mt-4 text-3xl font-extrabold text-[#4B367C]">
                    Vista de consulta
                  </h2>

                  <p className="mt-3 text-[#6B5A95]">
                    Puedes revisar y marcar rutinas como realizadas, pero tu
                    perfil no permite crear, editar ni eliminar actividades.
                  </p>
                </section>
              ) : (
                <section className="rounded-[2rem] border-2 border-dashed border-[#DCCCF8] bg-white p-8 text-center shadow-lg">
                  <p className="text-5xl">✨</p>

                  <h2 className="mt-4 text-3xl font-extrabold text-[#4B367C]">
                    Biblioteca de experiencias
                  </h2>

                  <p className="mt-3 text-[#6B5A95]">
                    Selecciona una experiencia desde la biblioteca para
                    comenzar.
                  </p>
                </section>
              )}

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
                        {canCreateOrEditRoutines
                          ? "Puedes crear una rutina nueva o editar sus días."
                          : "No hay actividades programadas para hoy."}
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
                            {pendingToday.map((routine) => (
                              <RoutineCard
                                key={routine.id}
                                routine={routine}
                                showCompleteButton
                                updatingStepKey={updatingStepKey}
                                isScheduledToday={isScheduledToday}
                                onToggleStep={handleToggleRoutineStep}
                                onComplete={handleCompleteRoutine}
                                onEdit={handleEdit}
                                onDelete={handleDeleteRoutine}
                                canCreateOrEditRoutines={
                                  canCreateOrEditRoutines
                                }
                                canDeleteRoutines={canDeleteRoutines}
                                formatTime={formatTime}
                                formatDays={formatDays}
                                getFullName={getFullName}
                                getSupportProfileLabel={getSupportProfileLabel}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {completedToday.length > 0 && (
                        <div>
                          <h3 className="mb-3 mt-6 text-xl font-bold text-green-700">
                            Completadas
                          </h3>

                          <div className="space-y-4">
                            {completedToday.map((routine) => (
                              <RoutineCard
                                key={routine.id}
                                routine={routine}
                                showCompleteButton
                                updatingStepKey={updatingStepKey}
                                isScheduledToday={isScheduledToday}
                                onToggleStep={handleToggleRoutineStep}
                                onComplete={handleCompleteRoutine}
                                onEdit={handleEdit}
                                onDelete={handleDeleteRoutine}
                                canCreateOrEditRoutines={
                                  canCreateOrEditRoutines
                                }
                                canDeleteRoutines={canDeleteRoutines}
                                formatTime={formatTime}
                                formatDays={formatDays}
                                getFullName={getFullName}
                                getSupportProfileLabel={getSupportProfileLabel}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-[2rem] bg-white p-6 shadow-lg md:p-8">
                  <h2 className="text-3xl font-extrabold text-[#4B367C]">
                    {isParentMode
                      ? `Rutinas de ${childName}`
                      : "Todas mis rutinas"}
                  </h2>

                  <p className="mt-2 text-[#6B5A95]">
                    {isParentMode
                      ? canCreateOrEditRoutines
                        ? `Administra las rutinas activas de ${childName}.`
                        : `Consulta las rutinas activas de ${childName}.`
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
                      {allRoutines.map((routine) => (
                        <RoutineCard
                          key={routine.id}
                          routine={routine}
                          compact
                          updatingStepKey={updatingStepKey}
                          isScheduledToday={isScheduledToday}
                          onToggleStep={handleToggleRoutineStep}
                          onComplete={handleCompleteRoutine}
                          onEdit={handleEdit}
                          onDelete={handleDeleteRoutine}
                          canCreateOrEditRoutines={canCreateOrEditRoutines}
                          canDeleteRoutines={canDeleteRoutines}
                          formatTime={formatTime}
                          formatDays={formatDays}
                          getFullName={getFullName}
                          getSupportProfileLabel={getSupportProfileLabel}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <RoutineHistory
              history={history}
              isParentMode={isParentMode}
              childName={childName}
              formatTime={formatTime}
              getFullName={getFullName}
              getSupportProfileLabel={getSupportProfileLabel}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Rutinas;
