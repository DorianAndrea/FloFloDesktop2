import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import ExperienceBuilder from "./ExperienceBuilder";
import useExperienceDraft from "../hooks/useExperienceDraft";

import { getLearningContexts } from "../../../services/learningContextService";
import { getExperienceTemplate } from "../../../services/experienceTemplateService";

import {
  createRoutine,
  createChildRoutine,
} from "../../../services/routineService";

import { useFloFlo } from "../../../context/FloFloContext";
import { useSelectedChild } from "../../../context/SelectedChildContext";
import { useFeedback } from "../../../context/FeedbackContext";

const ALL_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const RoutineExperienceBuilder = ({
  templateId,
  onCreated,
  onCancel,
}) => {
  const [learningContexts, setLearningContexts] = useState([]);
  const [loadingContexts, setLoadingContexts] = useState(true);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [loadedTemplateDraft, setLoadedTemplateDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const { user } = useFloFlo();

  const {
    isParent,
    selectedChildId,
    selectedChild,
    getChildDisplayName,
  } = useSelectedChild();

  const { showFeedback } = useFeedback();

  const isParentMode = isParent && Boolean(selectedChildId);

  const childName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "el niño/a seleccionado";

  const {
    draft,
    validation,
    updateDraft,
    setLearningContext,
    toggleDay,
    addStep,
    updateStep,
    removeStep,
    resetDraft,
    toRoutinePayload,
  } = useExperienceDraft(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    const loadContexts = async () => {
      try {
        setLoadingContexts(true);
        const data = await getLearningContexts();
        setLearningContexts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando contextos:", error);
        setLearningContexts([]);

        showFeedback({
          type: "error",
          icon: "❌",
          label: "Contextos no disponibles",
          title: "No se pudieron cargar los contextos",
          message:
            error.response?.data?.message ||
            "Revisa la conexión con el backend.",
        });
      } finally {
        setLoadingContexts(false);
      }
    };

    loadContexts();
  }, []);

  useEffect(() => {
    if (!templateId || loadingContexts) {
      return;
    }

    const loadTemplate = async () => {
      try {
        setLoadingTemplate(true);

        const response = await getExperienceTemplate(templateId);
        const template = response?.template || response;

        if (!template?.id) {
          throw new Error("La plantilla no contiene datos válidos.");
        }

        const selectedContext =
          learningContexts.find(
            (context) =>
              Number(context.id) === Number(template.learning_context_id),
          ) || null;

        const rawSteps = Array.isArray(template.steps)
          ? template.steps
          : [];

        const templateDraft = {
          id: template.id,
          experienceType: template.experience_type || "routine",
          name: template.name || "",
          description: template.description || "",
          icon: template.icon || "✨",
          start_time: template.default_start_time
            ? String(template.default_start_time).slice(0, 5)
            : "",
          end_time: template.default_end_time
            ? String(template.default_end_time).slice(0, 5)
            : "",
          days_of_week:
            Array.isArray(template.days_of_week) &&
            template.days_of_week.length > 0
              ? template.days_of_week
              : ALL_DAYS,
          learning_context_id: template.learning_context_id || null,
          learningContext: selectedContext,
          steps: rawSteps.map((step, index) => ({
            clientId:
              step.clientId ||
              `template-${template.id}-step-${step.id || index + 1}`,
            title: step.title || "",
            description: step.description || "",
            icon: step.icon || "✨",
            position: Number(step.position || index + 1),
            estimated_minutes: step.estimated_minutes ?? null,
            is_optional: Boolean(step.is_optional),
          })),
        };

        setLoadedTemplateDraft(templateDraft);
        resetDraft(templateDraft);

        if (selectedContext) {
          setLearningContext(selectedContext);
        }
      } catch (error) {
        console.error("Error cargando plantilla:", error);
        setLoadedTemplateDraft(null);

        showFeedback({
          type: "error",
          icon: "❌",
          label: "No se pudo cargar",
          title: "Error al abrir la experiencia",
          message:
            error.response?.data?.message ||
            error.message ||
            "Intenta nuevamente.",
        });
      } finally {
        setLoadingTemplate(false);
      }
    };

    loadTemplate();
  }, [templateId, loadingContexts, learningContexts]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || over.id !== "experience-learning-context") {
      return;
    }

    const draggedData = active.data.current;

    if (
      draggedData?.type !== "learning-context" ||
      !draggedData?.context
    ) {
      return;
    }

    setLearningContext(draggedData.context);
  };

  const handleSave = async () => {
    if (!validation.isValid || saving || loadingTemplate) {
      return;
    }

    if (!user) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Sesión requerida",
        title: "Debes iniciar sesión",
        message: "Inicia sesión para crear esta experiencia.",
      });
      return;
    }

    if (isParent && !selectedChildId) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta niño/a activo",
        title: "Selecciona un niño/a",
        message: "Debes seleccionar para quién crearás esta experiencia.",
      });
      return;
    }

    try {
      setSaving(true);

      const payload = toRoutinePayload();

      const routinePayload = {
        name: payload.name,
        description: payload.description,
        start_time: payload.start_time,
        end_time: payload.end_time,
        days_of_week: payload.days_of_week,
        learning_context_id: payload.learning_context_id,
        steps: payload.steps,
        experience_template_id: Number(templateId),
      };

      console.log("PAYLOAD EXPERIENCE BUILDER:", routinePayload);

      const response = isParentMode
        ? await createChildRoutine(selectedChildId, routinePayload)
        : await createRoutine(routinePayload);

      showFeedback({
        type: "success",
        icon: draft.icon || "✨",
        label: "Experiencia creada",
        title: `${payload.name} guardada`,
        message: isParentMode
          ? `La experiencia fue creada para ${childName}.`
          : "La experiencia fue creada correctamente.",
      });

      if (typeof onCreated === "function") {
        await onCreated({
          response,
          routine: response?.routine || response,
          steps: payload.steps,
        });
      }
    } catch (error) {
      console.error("Error creando experiencia:", error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "No se pudo guardar",
        title: "Ocurrió un error al crear la experiencia",
        message:
          error.response?.data?.message ||
          "Revisa los datos e intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingTemplate || loadingContexts) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center font-bold text-[#6B5A95]">
        Cargando experiencia...
      </div>
    );
  }

  if (!loadedTemplateDraft) {
    return (
      <div className="space-y-4">
        {typeof onCancel === "function" && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border-2 border-[#DCCCF8] bg-white px-5 py-3 font-extrabold text-[#5F4A8B] transition hover:bg-[#F7F3FF]"
          >
            ← Volver a biblioteca
          </button>
        )}

        <div className="rounded-3xl bg-white p-10 text-center font-bold text-[#6B5A95]">
          No se pudo cargar esta experiencia.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {typeof onCancel === "function" && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border-2 border-[#DCCCF8] bg-white px-5 py-3 font-extrabold text-[#5F4A8B] transition hover:bg-[#F7F3FF]"
        >
          ← Volver a biblioteca
        </button>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <ExperienceBuilder
          draft={draft}
          validation={validation}
          learningContexts={learningContexts}
          loadingContexts={loadingContexts}
          onUpdateDraft={updateDraft}
          onSelectContext={setLearningContext}
          onToggleDay={toggleDay}
          onAddStep={addStep}
          onUpdateStep={updateStep}
          onRemoveStep={removeStep}
          onSave={handleSave}
          saving={saving}
        />
      </DndContext>
    </div>
  );
};

export default RoutineExperienceBuilder;