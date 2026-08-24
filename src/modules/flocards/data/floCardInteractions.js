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
        type: "pictogram",
        title: "Mojar las manos",
        instruction: "Moja ambas manos con agua.",
        floCardCode: "WASH_HANDS_WET",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Usar jabón",
        instruction: "Aplica jabón en tus manos.",
        floCardCode: "WASH_HANDS_SOAP",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Frotar",
        instruction: "Frota las palmas, dorsos y entre los dedos.",
        floCardCode: "WASH_HANDS_RUB",
      },
      {
        position: 4,
        type: "pictogram",
        title: "Enjuagar",
        instruction: "Retira todo el jabón con agua.",
        floCardCode: "WASH_HANDS_RINSE",
      },
      {
        position: 5,
        type: "pictogram",
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
        type: "pictogram",
        title: "Tomar el cepillo",
        instruction: "Toma tu cepillo de dientes.",
        floCardCode: "BRUSH_TEETH_TAKE_BRUSH",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Poner pasta dental",
        instruction: "Pon pasta dental en el cepillo.",
        floCardCode: "BRUSH_TEETH_TOOTHPASTE",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Cepillar los dientes",
        instruction: "Cepilla todas las zonas de tus dientes.",
        floCardCode: "BRUSH_TEETH_ACTION",
      },
      {
        position: 4,
        type: "pictogram",
        title: "Enjuagar o escupir",
        instruction: "Escupe o enjuaga según tu rutina.",
        floCardCode: "BRUSH_TEETH_RINSE",
      },
      {
        position: 5,
        type: "pictogram",
        title: "Guardar el cepillo",
        instruction: "Guarda el cepillo en su lugar.",
        floCardCode: "BRUSH_TEETH_PUT_AWAY",
      },
    ],
  },
  SLEEP_PREPARATION_SEQUENCE: {
    interactionType: "sequence",

    title: "Prepararse para dormir",

    instruction: "Sigue cada paso para prepararte para dormir.",

    helperText: "Avanza paso a paso siguiendo los pictogramas.",

    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        type: "pictogram",
        title: "Bañarse",
        instruction: "Es momento de bañarse.",
        floCardCode: "SLEEP_PREPARATION_BATH",
      },

      {
        position: 2,
        type: "sequence",
        title: "Lavarse los dientes",
        instruction: "Lava tus dientes antes de dormir.",
        floCardCode: "BRUSH_TEETH_SEQUENCE",
      },

      {
        position: 3,
        type: "pictogram",
        title: "Ponerse pijama",
        instruction: "Ponte tu pijama para dormir.",
        floCardCode: "SLEEP_PREPARATION_PAJAMAS",
      },

      {
        position: 4,
        type: "pictogram",
        title: "Leer un cuento",
        instruction: "Lee o escucha un cuento tranquilo.",
        floCardCode: "SLEEP_PREPARATION_STORY",
      },

      {
        position: 5,
        type: "pictogram",
        title: "Dormir",
        instruction: "Es momento de descansar.",
        floCardCode: "SLEEP_PREPARATION_SLEEP",
      },
    ],
  },
  DRESSING_SEQUENCE: {
    interactionType: "sequence",
    title: "Vestirse",
    instruction: "Sigue cada paso para vestirte.",
    helperText: "Avanza paso a paso siguiendo los pictogramas.",
    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        type: "pictogram",
        title: "Elegir o revisar la ropa",
        instruction: "Elige o revisa la ropa que vas a usar.",
        floCardCode: "DRESSING_CHOOSE_CLOTHES",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Ponerse ropa interior",
        instruction: "Ponte tu ropa interior.",
        floCardCode: "DRESSING_UNDERWEAR",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Ponerse la parte inferior",
        instruction: "Ponte tu pantalón o prenda inferior.",
        floCardCode: "DRESSING_PANTS",
      },
      {
        position: 4,
        type: "pictogram",
        title: "Ponerse la parte superior",
        instruction: "Ponte tu polera o prenda superior.",
        floCardCode: "DRESSING_SHIRT",
      },
      {
        position: 5,
        type: "pictogram",
        title: "Ponerse calcetines",
        instruction: "Ponte ambos calcetines.",
        floCardCode: "DRESSING_SOCKS",
      },
      {
        position: 6,
        type: "pictogram",
        title: "Ponerse zapatos",
        instruction: "Ponte y ajusta tus zapatos.",
        floCardCode: "DRESSING_SHOES",
      },
    ],
  },
  PREPARE_FOR_SCHOOL_SEQUENCE: {
  interactionType: "sequence",
  title: "Prepararse para ir al colegio",
  instruction: "Sigue cada paso para prepararte para ir al colegio.",
  helperText: "Avanza paso a paso siguiendo los pictogramas.",
  completionLabel: "Terminé",

  steps: [
    {
      position: 1,
      type: "sequence",
      title: "Vestirse",
      instruction: "Ponte la ropa o uniforme correspondiente.",
      floCardCode: "DRESSING_SEQUENCE",
    },
    {
      position: 2,
      type: "pictogram",
      title: "Desayunar",
      instruction: "Realiza tu desayuno habitual.",
      floCardCode: "PREPARE_SCHOOL_BREAKFAST",
    },
    {
      position: 3,
      type: "sequence",
      title: "Lavarse los dientes",
      instruction: "Realiza el cepillado dental.",
      floCardCode: "BRUSH_TEETH_SEQUENCE",
    },
    {
      position: 4,
      type: "pictogram",
      title: "Revisar la mochila",
      instruction: "Comprueba que estén los materiales necesarios.",
      floCardCode: "PREPARE_SCHOOL_BACKPACK",
    },
    {
      position: 5,
      type: "pictogram",
      title: "Ponerse el uniforme",
      instruction: "Prepárate para salir según el clima.",
      floCardCode: "PREPARE_SCHOOL_OUTERWEAR",
    },
    {
      position: 6,
      type: "pictogram",
      title: "Despedirse y salir",
      instruction: "Inicia el trayecto hacia el colegio.",
      floCardCode: "PREPARE_SCHOOL_LEAVE",
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
