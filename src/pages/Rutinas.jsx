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
  completeRoutineStepSequence,
  completeChildRoutineStepSequence,
  uncompleteRoutineStep,
  uncompleteChildRoutineStep,
  startRoutineStepFloCard,
  startChildRoutineStepFloCard,
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
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [experienceView, setExperienceView] = useState(null);
  const [selectedExperienceTemplateId, setSelectedExperienceTemplateId] =
    useState(null);
  const [selectedExperienceTemplate, setSelectedExperienceTemplate] =
    useState(null);

  const [updatingStepKey, setUpdatingStepKey] = useState(null);
  const [expandedRoutineId, setExpandedRoutineId] = useState(null);
  const [expandedAllRoutineId, setExpandedAllRoutineId] = useState(null);

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
  useEffect(() => {
    if (pendingToday.length === 0) {
      setExpandedRoutineId(null);
      return;
    }

    // Si solo hay una pendiente, la dejamos abierta.
    if (pendingToday.length === 1) {
      setExpandedRoutineId(pendingToday[0].id);
      return;
    }

    // Si la rutina abierta dejó de estar pendiente,
    // cerramos el acordeón.
    const expandedStillPending = pendingToday.some(
      (routine) => Number(routine.id) === Number(expandedRoutineId),
    );

    if (!expandedStillPending) {
      setExpandedRoutineId(null);
    }
  }, [pendingToday, expandedRoutineId]);

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
    setEditingRoutine(null);
    setExperienceView(null);
    setSelectedExperienceTemplateId(null);
    setSelectedExperienceTemplate(null);
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
    setEditingRoutine(routine);

    setSelectedExperienceTemplateId(null);
    setSelectedExperienceTemplate(null);
    setExperienceView("builder");

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

  const handleToggleRoutineStep = async (
    routine,
    step,
    supportLevel = "independent",
    interactionResult = null,
  ) => {
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
          support_level: supportLevel,
          notes: "",
          interaction_result: interactionResult,
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
  const handleCompleteRoutineStepSequence = async (
    routine,
    triggerStep,
    stepIds,
    supportLevel = "independent",
    interactionResult = null,
  ) => {
    if (!validateParentChildSelection()) {
      return;
    }

    if (!Array.isArray(stepIds) || stepIds.length === 0) {
      showFeedback({
        type: "error",
        icon: "❌",
        label: "Secuencia inválida",
        title: "No se encontraron los pasos",
        message: "No se pudo completar la secuencia.",
      });

      return;
    }

    const stepKey = `${routine.id}:${triggerStep.id}`;

    if (updatingStepKey === stepKey) {
      return;
    }

    try {
      setUpdatingStepKey(stepKey);

      const progressData = {
        step_ids: stepIds,
        support_level: supportLevel,
        notes: "",
        interaction_result: interactionResult,
      };

      let response;

      if (isParentMode) {
        response = await completeChildRoutineStepSequence(
          selectedChildId,
          routine.id,
          triggerStep.id,
          progressData,
        );
      } else {
        response = await completeRoutineStepSequence(
          routine.id,
          triggerStep.id,
          progressData,
        );
      }

      await loadRoutines({
        useCache: false,
      });

      return response;
    } catch (error) {
      console.error("Error completando secuencia FloCard:", error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "No se pudo guardar",
        title: "Error al completar la secuencia",
        message: error.response?.data?.message || "Intenta nuevamente.",
      });

      throw error;
    } finally {
      setUpdatingStepKey(null);
    }
  };

  const handleStartFloCard = async (routine, step) => {
    try {
      if (isParent) {
        if (!selectedChildId) {
          throw new Error("No hay un niño/a seleccionado");
        }

        return await startChildRoutineStepFloCard(
          selectedChildId,
          routine.id,
          step.id,
        );
      }

      return await startRoutineStepFloCard(routine.id, step.id);
    } catch (error) {
      console.error("Error iniciando FloCard:", error);

      throw error;
    }
  };

  const renderRoutineCard = (routine, options = {}) => {
    const { showCompleteButton = false, compact = false } = options;

    const creatorName = getFullName(
      routine.creator_first_name,
      routine.creator_last_name,
    );

    const creatorProfile = getSupportProfileLabel(
      routine.creator_relationship_key,
      routine.creator_access_profile,
    );

    const completerName = getFullName(
      routine.today_completer_first_name,
      routine.today_completer_last_name,
    );

    const completerProfile = getSupportProfileLabel(
      routine.today_completer_relationship_key,
      routine.today_completer_access_profile,
    );

    const hasCreatorInformation = Boolean(
      routine.created_by ||
      routine.creator_first_name ||
      routine.creator_access_profile ||
      routine.creator_relationship_key,
    );

    const hasCompleterInformation = Boolean(
      routine.today_completed_by ||
      routine.today_completer_first_name ||
      routine.today_completer_access_profile ||
      routine.today_completer_relationship_key,
    );

    const totalSteps = Array.isArray(routine.steps) ? routine.steps.length : 0;

    const completedSteps = Array.isArray(routine.steps)
      ? routine.steps.filter((step) => Boolean(step.completed_today)).length
      : 0;

    const progress = totalSteps === 0 ? 0 : (completedSteps / totalSteps) * 100;

    return (
      <div
        key={routine.id}
        className={`rounded-3xl border-2 p-5 transition ${
          routine.completed_today
            ? "border-green-200 bg-green-50"
            : "border-[#DCCCF8] bg-white"
        }`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
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

            {routine.learning_context_key &&
              routine.learning_context_key !== "unspecified" && (
                <div
                  className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: routine.learning_context_color || "#DCCCF8",
                    backgroundColor:
                      routine.learning_context_color || "#F7F3FF",
                  }}
                >
                  <span aria-hidden="true">
                    {routine.learning_context_icon || "📍"}
                  </span>

                  <span className="text-sm font-bold text-[#5F4A8B]">
                    {routine.learning_context_name}
                  </span>
                </div>
              )}

            {routine.description && !compact && (
              <p className="mt-3 text-[#6B5A95]">{routine.description}</p>
            )}

            {Array.isArray(routine.steps) &&
              routine.steps.length > 0 &&
              !compact && (
                <div className="mt-6 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="mt-4">
                      <div className="h-3 w-full overflow-hidden rounded-full bg-[#EEE7FA]">
                        <div
                          className="h-full rounded-full bg-[#7C5CE6] transition-all duration-500 ease-out"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex justify-between text-sm font-semibold text-[#756596]">
                        <span>
                          {completedSteps} de {totalSteps} pasos
                        </span>

                        <span>{Math.round(progress)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-extrabold uppercase tracking-wide text-[#9B7BE8]">
                        Pasos de la experiencia
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#756596]">
                        Completa cada paso en orden.
                      </p>
                    </div>

                    <span className="rounded-full bg-[#F3ECFF] px-4 py-2 text-sm font-extrabold text-[#5F4A8B]">
                      {
                        routine.steps.filter((step) => step.completed_today)
                          .length
                      }
                      /{routine.steps.length}
                    </span>
                  </div>

                  <div className="mt-4 grid w-full gap-3">
                    {routine.steps.map((step, index) => {
                      const isChecked = Boolean(step.completed_today);
                      const stepKey = `${routine.id}:${step.id}`;
                      const isUpdating = updatingStepKey === stepKey;
                      return (
                        <button
                          key={step.id || `${routine.id}-${index}`}
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleRoutineStep(routine, step)}
                          aria-pressed={isChecked}
                          className={`grid w-full grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border-2 px-5 py-4 text-left transition ${
                            isChecked
                              ? "border-green-300 bg-green-50 hover:bg-green-100"
                              : "border-[#E4D8FF] bg-[#FAF8FF] hover:border-[#BCA6F0] hover:bg-white"
                          } ${
                            isUpdating
                              ? "cursor-wait opacity-60"
                              : "cursor-pointer"
                          }`}
                        >
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-lg font-extrabold ${
                              isChecked
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-[#DCCCF8] bg-white text-[#5F4A8B]"
                            }`}
                            aria-hidden="true"
                          >
                            {isUpdating ? "…" : isChecked ? "✓" : index + 1}
                          </span>

                          <span
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm"
                            aria-hidden="true"
                          >
                            {step.icon || "✨"}
                          </span>

                          <div className="min-w-0">
                            <p
                              className={`break-words text-base font-extrabold sm:text-lg ${
                                isChecked
                                  ? "text-green-700 line-through"
                                  : "text-[#4B367C]"
                              }`}
                            >
                              {step.title}
                            </p>

                            {step.description && (
                              <p className="mt-1 hidden text-sm font-medium text-[#756596] sm:block">
                                {step.description}
                              </p>
                            )}

                            {step.is_optional && (
                              <span className="mt-2 inline-flex rounded-full bg-[#EEE7FA] px-3 py-1 text-xs font-extrabold text-[#756596]">
                                Opcional
                              </span>
                            )}
                          </div>

                          {step.estimated_minutes && (
                            <span className="whitespace-nowrap rounded-full bg-white px-3 py-2 text-xs font-extrabold text-[#6B5A95] shadow-sm">
                              {step.estimated_minutes} min
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            <div className="mt-3 rounded-2xl border border-[#E4D8FF] bg-[#F7F3FF] px-4 py-3">
              {hasCreatorInformation ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9B7BE8]">
                    Creada por
                  </p>

                  <p className="mt-1 font-bold text-[#4B367C]">{creatorName}</p>

                  <p className="text-sm font-semibold text-[#6B5A95]">
                    {creatorProfile}
                  </p>
                </>
              ) : (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9B7BE8]">
                    Creada anteriormente
                  </p>

                  <p className="mt-1 font-bold text-[#4B367C]">
                    Por una cuenta cuidadora
                  </p>

                  <p className="text-sm font-semibold text-[#8A7BB0]">
                    Registro anterior
                  </p>
                </div>
              )}
            </div>

            {routine.today_completed_at && (
              <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="font-semibold text-green-700">
                  Completada hoy a las{" "}
                  {new Date(routine.today_completed_at).toLocaleTimeString(
                    "es-CL",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>

                {hasCompleterInformation ? (
                  <>
                    <p className="mt-2 text-sm font-bold text-[#4B367C]">
                      Marcada como realizada por {completerName}
                    </p>

                    <p className="text-sm font-semibold text-[#6B5A95]">
                      {completerProfile}
                    </p>
                  </>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm font-bold text-[#4B367C]">
                      Marcada como realizada desde una cuenta cuidadora
                    </p>

                    <p className="text-sm text-[#8A7BB0]">Registro anterior</p>
                  </div>
                )}
              </div>
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

            {canCreateOrEditRoutines && (
              <button
                type="button"
                onClick={() => handleEdit(routine)}
                className="rounded-2xl bg-[#9B7BE8] px-4 py-2 font-bold text-white transition hover:bg-[#8B6FD6]"
              >
                Editar
              </button>
            )}

            {canDeleteRoutines && (
              <button
                type="button"
                onClick={() => handleDeleteRoutine(routine)}
                className="rounded-2xl bg-red-400 px-4 py-2 font-bold text-white transition hover:bg-red-500"
              >
                Eliminar
              </button>
            )}
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

        <RoutineExperienceFlow
          canCreateOrEditRoutines={canCreateOrEditRoutines}
          editingId={editingId}
          editingRoutine={editingRoutine}
          experienceView={experienceView}
          selectedTemplateId={selectedExperienceTemplateId}
          selectedTemplate={selectedExperienceTemplate}
          childId={isParentMode ? selectedChildId : null}
          onOpenLibrary={() => {
            setSelectedExperienceTemplateId(null);
            setSelectedExperienceTemplate(null);
            setExperienceView("library");
          }}
          onCreateBlank={() => {
            setEditingId(null);
            setEditingRoutine(null);
            setSelectedExperienceTemplateId(null);
            setSelectedExperienceTemplate(null);
            setExperienceView("builder");
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
            setEditingId(null);
            setEditingRoutine(null);
            setSelectedExperienceTemplateId(null);
            setSelectedExperienceTemplate(null);
            setExperienceView("library");
          }}
          onCancelEdit={() => {
            setEditingId(null);
            setEditingRoutine(null);
            setSelectedExperienceTemplateId(null);
            setSelectedExperienceTemplate(null);
            setExperienceView(null);
          }}
          onUseTemplate={() => {
            setExperienceView("builder");
          }}
          onCreated={async () => {
            setEditingId(null);
            setEditingRoutine(null);
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
            <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
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
                                expanded={
                                  Number(expandedRoutineId) ===
                                  Number(routine.id)
                                }
                                onToggleExpanded={() => {
                                  setExpandedRoutineId((current) =>
                                    Number(current) === Number(routine.id)
                                      ? null
                                      : routine.id,
                                  );
                                }}
                                showCompleteButton
                                updatingStepKey={updatingStepKey}
                                isScheduledToday={isScheduledToday}
                                onToggleStep={handleToggleRoutineStep}
                                onCompleteStepSequence={
                                  handleCompleteRoutineStepSequence
                                }
                                onStartFloCard={handleStartFloCard}
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
                                compact
                                expanded={false}
                                onToggleExpanded={() => {}}
                                updatingStepKey={updatingStepKey}
                                isScheduledToday={isScheduledToday}
                                onToggleStep={handleToggleRoutineStep}
                                onStartFloCard={handleStartFloCard}
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
                          expanded={
                            Number(expandedAllRoutineId) === Number(routine.id)
                          }
                          onToggleExpanded={() => {
                            setExpandedAllRoutineId((current) =>
                              Number(current) === Number(routine.id)
                                ? null
                                : routine.id,
                            );
                          }}
                          updatingStepKey={updatingStepKey}
                          isScheduledToday={isScheduledToday}
                          onToggleStep={handleToggleRoutineStep}
                          onStartFloCard={handleStartFloCard}
                          onCompleteStepSequence={
                            handleCompleteRoutineStepSequence
                          }
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
