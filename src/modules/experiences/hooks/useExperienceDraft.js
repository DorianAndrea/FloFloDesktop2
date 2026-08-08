import { useCallback, useMemo, useState } from "react";

const createClientId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `step-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
};

const normalizeStepPositions = (steps) => {
  return steps.map((step, index) => ({
    ...step,
    position: index + 1,
  }));
};

const createEmptyDraft = () => ({
  experienceType: "routine",

  name: "",
  description: "",
  icon: "✨",

  start_time: "",
  end_time: "",

  days_of_week: [],

  learning_context_id: null,
  learningContext: null,

  steps: [],
});

const useExperienceDraft = (initialDraft = null) => {
  const [draft, setDraft] = useState(() =>
    initialDraft
      ? {
          ...createEmptyDraft(),
          ...initialDraft,
          days_of_week: [
            ...(initialDraft.days_of_week || []),
          ],
          steps: normalizeStepPositions(
            initialDraft.steps || [],
          ),
        }
      : createEmptyDraft(),
  );

  const updateDraft = useCallback((changes) => {
    setDraft((current) => ({
      ...current,
      ...changes,
    }));
  }, []);

  const setLearningContext = useCallback((context) => {
    setDraft((current) => ({
      ...current,
      learning_context_id: context?.id || null,
      learningContext: context || null,
    }));
  }, []);

  const toggleDay = useCallback((dayKey) => {
    setDraft((current) => {
      const selectedDays = current.days_of_week.includes(dayKey)
        ? current.days_of_week.filter(
            (day) => day !== dayKey,
          )
        : [...current.days_of_week, dayKey];

      return {
        ...current,
        days_of_week: selectedDays,
      };
    });
  }, []);

  const addStep = useCallback((step = {}) => {
    setDraft((current) => {
      const nextSteps = [
        ...current.steps,
        {
          clientId: createClientId(),
          title: step.title || "Nuevo paso",
          description: step.description || "",
          icon: step.icon || "✨",
          estimated_minutes:
            step.estimated_minutes || null,
          is_optional: Boolean(step.is_optional),
          ...step,
        },
      ];

      return {
        ...current,
        steps: normalizeStepPositions(nextSteps),
      };
    });
  }, []);

  const updateStep = useCallback((clientId, changes) => {
    setDraft((current) => ({
      ...current,
      steps: current.steps.map((step) =>
        step.clientId === clientId
          ? {
              ...step,
              ...changes,
            }
          : step,
      ),
    }));
  }, []);

  const removeStep = useCallback((clientId) => {
    setDraft((current) => ({
      ...current,
      steps: normalizeStepPositions(
        current.steps.filter(
          (step) => step.clientId !== clientId,
        ),
      ),
    }));
  }, []);

  const reorderSteps = useCallback(
    (activeClientId, overClientId) => {
      if (
        !activeClientId ||
        !overClientId ||
        activeClientId === overClientId
      ) {
        return;
      }

      setDraft((current) => {
        const oldIndex = current.steps.findIndex(
          (step) => step.clientId === activeClientId,
        );

        const newIndex = current.steps.findIndex(
          (step) => step.clientId === overClientId,
        );

        if (oldIndex < 0 || newIndex < 0) {
          return current;
        }

        const nextSteps = [...current.steps];
        const [movedStep] = nextSteps.splice(oldIndex, 1);

        nextSteps.splice(newIndex, 0, movedStep);

        return {
          ...current,
          steps: normalizeStepPositions(nextSteps),
        };
      });
    },
    [],
  );

  const resetDraft = useCallback((nextDraft = null) => {
    setDraft(
      nextDraft
        ? {
            ...createEmptyDraft(),
            ...nextDraft,
            days_of_week: [
              ...(nextDraft.days_of_week || []),
            ],
            steps: normalizeStepPositions(
              nextDraft.steps || [],
            ),
          }
        : createEmptyDraft(),
    );
  }, []);

  const validation = useMemo(() => {
    const errors = {};

    if (!draft.name.trim()) {
      errors.name = "La experiencia necesita un nombre.";
    }

    if (!draft.learning_context_id) {
      errors.learning_context_id =
        "Selecciona un contexto de aprendizaje.";
    }

    if (!draft.start_time || !draft.end_time) {
      errors.schedule = "Selecciona un horario.";
    } else if (draft.end_time <= draft.start_time) {
      errors.schedule =
        "La hora de término debe ser posterior.";
    }

    if (draft.days_of_week.length === 0) {
      errors.days_of_week =
        "Selecciona al menos un día.";
    }

    if (draft.steps.length === 0) {
      errors.steps =
        "Agrega al menos un paso a la experiencia.";
    }

    draft.steps.forEach((step) => {
      if (!String(step.title || "").trim()) {
        errors.steps =
          "Todos los pasos deben tener un nombre.";
      }
    });

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
    };
  }, [draft]);

  const toRoutinePayload = useCallback(() => {
    return {
      name: draft.name.trim(),
      description: draft.description.trim(),
      start_time: draft.start_time,
      end_time: draft.end_time,
      days_of_week: draft.days_of_week,
      learning_context_id:
        draft.learning_context_id,

      steps: draft.steps.map((step, index) => ({
        title: step.title.trim(),
        description:
          String(step.description || "").trim(),
        icon: step.icon || "✨",
        position: index + 1,
        estimated_minutes:
          step.estimated_minutes || null,
        is_optional: Boolean(step.is_optional),
      })),
    };
  }, [draft]);

  return {
    draft,
    validation,

    updateDraft,
    setLearningContext,
    toggleDay,

    addStep,
    updateStep,
    removeStep,
    reorderSteps,

    resetDraft,
    toRoutinePayload,
  };
};

export default useExperienceDraft;