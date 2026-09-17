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
  CHOOSE_COMMUNICATION_METHOD_CHOICE: {
    interactionType: "choice",
    title: "¿Cómo quiero comunicarlo?",
    instruction:
      "Elige la forma que te resulte más cómoda para contar cómo te sientes.",
    helperText:
      "Puedes elegir cualquier forma de comunicarte. No hay una opción correcta.",
    completionLabel: "Listo",

    options: [
      {
        value: "words",
        label: "Con palabras",
        icon: "💬",
      },
      {
        value: "scale",
        label: "Con una escala",
        icon: "📊",
      },
      {
        value: "pictogram",
        label: "Con un pictograma",
        icon: "🖼️",
      },
      {
        value: "gesture",
        label: "Con un gesto",
        icon: "👋",
      },
      {
        value: "device",
        label: "Con un dispositivo",
        icon: "📱",
      },
    ],
  },
  REQUEST_NEED_CHOICE: {
  interactionType: "choice",
  title: "¿Necesito pedir algo?",
  instruction:
    "Elige lo que necesitas en este momento.",
  helperText:
    "Puedes pedir lo que necesites o elegir que no necesitas nada ahora.",
  completionLabel: "Listo",

  options: [
    {
      value: "space",
      label: "Necesito espacio",
      icon: "↔️",
    },
    {
      value: "support",
      label: "Necesito apoyo",
      icon: "🤝",
    },
    {
      value: "company",
      label: "Quiero compañía",
      icon: "🫂",
    },
    {
      value: "other",
      label: "Necesito otra cosa",
      icon: "💭",
    },
    {
      value: "nothing",
      label: "No necesito nada ahora",
      icon: "👍",
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

  PREPARE_BACKPACK_SEQUENCE: {
    interactionType: "sequence",
    title: "Preparar la mochila",
    instruction: "Sigue cada paso para preparar tu mochila.",
    helperText: "Avanza paso a paso siguiendo los pictogramas.",
    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        type: "pictogram",
        title: "Revisar qué necesito",
        instruction: "Revisa qué materiales necesitas para el día.",
        floCardCode: "PREPARE_BACKPACK_PREPARE",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Guardar cuadernos o libros",
        instruction: "Guarda los cuadernos o libros que necesitas.",
        floCardCode: "PREPARE_BACKPACK_STORE",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Guardar el estuche",
        instruction: "Guarda el estuche dentro de la mochila.",
        floCardCode: "PREPARE_BACKPACK_PENCIL_CASE",
      },
      {
        position: 4,
        type: "pictogram",
        title: "Guardar colación o botella",
        instruction: "Guarda la colación o la botella.",
        floCardCode: "PREPARE_BACKPACK_SNACK_BOTTLE",
      },
      {
        position: 5,
        type: "pictogram",
        title: "Cerrar y dejar lista",
        instruction: "Cierra la mochila y déjala lista.",
        floCardCode: "PREPARE_BACKPACK_CLOSE",
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
        type: "sequence",
        title: "Revisar la mochila",
        instruction: "Comprueba que estén los materiales necesarios.",
        floCardCode: "PREPARE_BACKPACK_SEQUENCE",
      },
      {
        position: 5,
        type: "pictogram",
        title: "Ponerse zapatos y abrigo",
        instruction: "Prepárate para salir según el clima.",
        floCardCode: "PREPARE_SCHOOL_OUTERWEAR",
      },
      {
        position: 6,
        type: "pictogram",
        title: "Salir",
        instruction: "Inicia el trayecto hacia el colegio.",
        floCardCode: "PREPARE_SCHOOL_LEAVE",
      },
    ],
  },
  TAKE_SHOWER_SEQUENCE: {
    interactionType: "sequence",
    title: "Ducharse",
    instruction: "Sigue cada paso para ducharte.",
    helperText: "Avanza paso a paso siguiendo los pictogramas.",
    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        type: "pictogram",
        title: "Preparar toalla y ropa",
        instruction: "Deja a mano lo necesario para después de la ducha.",
        floCardCode: "TAKE_SHOWER_PREPARE",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Entrar a la ducha",
        instruction: "Entra y ajusta el agua de manera segura.",
        floCardCode: "TAKE_SHOWER_ENTER",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Lavar el cuerpo",
        instruction: "Lava las zonas del cuerpo según tu rutina.",
        floCardCode: "TAKE_SHOWER_WASH_BODY",
      },
      {
        position: 4,
        type: "pictogram",
        title: "Lavar el cabello",
        instruction: "Lava el cabello si corresponde ese día.",
        floCardCode: "TAKE_SHOWER_WASH_HAIR",
      },
      {
        position: 5,
        type: "pictogram",
        title: "Enjuagar",
        instruction: "Retira el jabón y shampoo con agua.",
        floCardCode: "TAKE_SHOWER_RINSE",
      },
      {
        position: 6,
        type: "pictogram",
        title: "Secarse y vestirse",
        instruction: "Sécate y ponte ropa limpia.",
        floCardCode: "TAKE_SHOWER_DRY_DRESS",
      },
    ],
  },
  RETURN_FROM_RECESS_SEQUENCE: {
  interactionType: "sequence",
  title: "Volver a clases después del recreo",
  instruction:
    "Sigue cada paso para terminar el recreo y volver a la sala.",
  helperText:
    "Avanza paso a paso siguiendo los pictogramas.",
  completionLabel: "Terminé",

  steps: [
    {
      position: 1,
      type: "pictogram",
      title: "Escuchar o mirar la señal",
      instruction: "Identifica que el recreo terminó.",
      floCardCode: "RETURN_FROM_RECESS_SIGNAL",
    },
    {
      position: 2,
      type: "pictogram",
      title: "Terminar la actividad actual",
      instruction: "Termina el juego o actividad que estabas realizando.",
      floCardCode: "RETURN_FROM_RECESS_FINISH_ACTIVITY",
    },
    {
      position: 3,
      type: "pictogram",
      title: "Volver a la sala",
      instruction: "Camina hacia la sala o espacio indicado.",
      floCardCode: "RETURN_FROM_RECESS_RETURN_CLASSROOM",
    },
    {
      position: 4,
      type: "pictogram",
      title: "Prepararse para continuar",
      instruction: "Revisa qué actividad viene ahora.",
      floCardCode: "RETURN_FROM_RECESS_PREPARE",
    },
  ],
},
COMB_HAIR_SEQUENCE: {
  interactionType: "sequence",
  title: "Peinarse",
  instruction: "Sigue cada paso para peinarte.",
  helperText: "Avanza paso a paso siguiendo los pictogramas.",
  completionLabel: "Terminé",

  steps: [
    {
      position: 1,
      type: "pictogram",
      title: "Tomar el cepillo o peine",
      instruction: "Prepara el elemento que usas habitualmente.",
      floCardCode: "COMB_HAIR_TAKE_BRUSH",
    },
    {
      position: 2,
      type: "pictogram",
      title: "Desenredar",
      instruction: "Peina con la estrategia habitual y tolerable.",
      floCardCode: "COMB_HAIR_DETANGLE",
    },
    {
      position: 3,
      type: "pictogram",
      title: "Revisar",
      instruction: "Comprueba si tu cabello quedó cómodo.",
      floCardCode: "COMB_HAIR_REVIEW",
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
