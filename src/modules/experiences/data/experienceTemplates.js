export const EXPERIENCE_TYPES = Object.freeze({
  ROUTINE: "routine",
  SOCIAL_STORY: "social_story",
  CONVERSATION: "conversation",
  VISUAL_SEQUENCE: "visual_sequence",
});

export const SLEEP_HYGIENE_TEMPLATE = Object.freeze({
  id: "sleep-hygiene",
  experienceType: EXPERIENCE_TYPES.ROUTINE,

  name: "Prepararse para dormir",
  description:
    "Secuencia visual para anticipar y organizar los pasos previos al descanso.",

  icon: "🌙",

  start_time: "20:00",
  end_time: "21:00",

  days_of_week: [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ],

  learning_context_id: null,

  steps: [
    {
      clientId: "sleep-step-bath",
      title: "Bañarse",
      description: "Tomar un baño antes de dormir.",
      icon: "🛁",
      position: 1,
      estimated_minutes: 15,
      is_optional: false,
    },
    {
      clientId: "sleep-step-teeth",
      title: "Lavarse los dientes",
      description: "Cepillar los dientes antes de acostarse.",
      icon: "🪥",
      position: 2,
      estimated_minutes: 5,
      is_optional: false,
    },
    {
      clientId: "sleep-step-pajamas",
      title: "Ponerse el pijama",
      description: "Cambiarse de ropa y ponerse el pijama.",
      icon: "👕",
      position: 3,
      estimated_minutes: 5,
      is_optional: false,
    },
    {
      clientId: "sleep-step-story",
      title: "Leer un cuento",
      description: "Compartir un momento tranquilo antes de dormir.",
      icon: "📖",
      position: 4,
      estimated_minutes: 15,
      is_optional: true,
    },
    {
      clientId: "sleep-step-bed",
      title: "Acostarse",
      description: "Ir a la cama y prepararse para descansar.",
      icon: "🛏️",
      position: 5,
      estimated_minutes: 5,
      is_optional: false,
    },
  ],
});

export const EXPERIENCE_TEMPLATES = Object.freeze([
  SLEEP_HYGIENE_TEMPLATE,
]);

export const cloneExperienceTemplate = (template) => {
  return {
    ...template,
    days_of_week: [...template.days_of_week],
    steps: template.steps.map((step) => ({
      ...step,
    })),
  };
};