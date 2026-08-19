const FLO_CARD_INTERACTIONS = Object.freeze({
  BRUSH_TEETH_ACTION: {
    interactionType: "animation",
    title: "Cepillar los dientes",
    instruction: "Cepilla todas las zonas de tus dientes.",
    helperText: "Sigue el movimiento del pictograma.",
    completionLabel: "Listo",
  },

  WAIT_FOR_TURN_ACTION: {
    interactionType: "timer",

    title: "Esperar un turno",

    instruction: "Espera tranquilamente hasta que llegue tu turno.",

    helperText: "Mira cómo avanza el tiempo mientras esperas.",

    completionLabel: "Terminé",

    durationSeconds: 20,
  },
  IDENTIFY_FEELING_CHOICE: {
    interactionType: "choice",

    title: "¿Cómo me siento?",

    instruction:
      "Mira las FloCards y elige la que más se parece a cómo te sientes ahora.",

    helperText:
      "No hay respuestas buenas o malas. Elige la que mejor te represente.",

    completionLabel: "Listo",

    options: [
      {
        value: "happy",
        label: "Feliz",
        floCardCode: "FEELING_HAPPY",
      },
      {
        value: "sad",
        label: "Triste",
        floCardCode: "FEELING_SAD",
      },
      {
        value: "angry",
        label: "Enojado/a",
        floCardCode: "FEELING_ANGRY",
      },
      {
        value: "nervous",
        label: "Nervioso/a",
        floCardCode: "FEELING_NERVOUS",
      },
      {
        value: "tired",
        label: "Cansado/a",
        floCardCode: "FEELING_TIRED",
      },
      {
        value: "unsure",
        label: "No lo sé",
        floCardCode: "FEELING_UNSURE",
      },
    ],
  },
  WASH_HANDS_SEQUENCE: {
    interactionType: "sequence",

    title: "Lavarse las manos",

    instruction: "Sigue cada paso para lavar tus manos.",

    helperText: "Avanza paso a paso siguiendo los pictogramas.",

    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        title: "Mojar las manos",
        instruction: "Moja ambas manos con agua.",
        floCardCode: "WASH_HANDS_WET",
      },
      {
        position: 2,
        title: "Usar jabón",
        instruction: "Aplica jabón en tus manos.",
        floCardCode: "WASH_HANDS_SOAP",
      },
      {
        position: 3,
        title: "Frotar",
        instruction: "Frota las palmas, dorsos y entre los dedos.",
        floCardCode: "WASH_HANDS_RUB",
      },
      {
        position: 4,
        title: "Enjuagar",
        instruction: "Retira todo el jabón con agua.",
        floCardCode: "WASH_HANDS_RINSE",
      },
      {
        position: 5,
        title: "Secar",
        instruction: "Seca bien tus manos.",
        floCardCode: "WASH_HANDS_DRY",
      },
    ],
  },
  BRUSH_TEETH_SEQUENCE: {
    interactionType: "sequence",

    title: "Lavarse los dientes",

    instruction: "Sigue cada paso para lavarte los dientes.",

    helperText: "Avanza paso a paso siguiendo los pictogramas.",

    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        title: "Tomar el cepillo",
        instruction: "Toma tu cepillo de dientes.",
        floCardCode: "BRUSH_TEETH_TAKE_BRUSH",
      },
      {
        position: 2,
        title: "Poner pasta dental",
        instruction: "Pon pasta dental en el cepillo.",
        floCardCode: "BRUSH_TEETH_TOOTHPASTE",
      },
      {
        position: 3,
        title: "Cepillar los dientes",
        instruction: "Cepilla todas las zonas de tus dientes.",
        floCardCode: "BRUSH_TEETH_ACTION",
      },
      {
        position: 4,
        title: "Enjuagar o escupir",
        instruction: "Escupe o enjuaga según tu rutina.",
        floCardCode: "BRUSH_TEETH_RINSE",
      },
      {
        position: 5,
        title: "Guardar el cepillo",
        instruction: "Guarda el cepillo en su lugar.",
        floCardCode: "BRUSH_TEETH_PUT_AWAY",
      },
    ],
  },
});

export const getFloCardInteraction = (floCardCode) => {
  if (!floCardCode) {
    return null;
  }

  return FLO_CARD_INTERACTIONS[floCardCode] || null;
};

export default FLO_CARD_INTERACTIONS;
