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
    instruction: "Elige lo que necesitas en este momento.",
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
    instruction: "Sigue cada paso para terminar el recreo y volver a la sala.",
    helperText: "Avanza paso a paso siguiendo los pictogramas.",
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
  ASK_FOR_BREAK_SEQUENCE: {
    interactionType: "sequence",
    title: "Pedir un descanso",
    instruction: "Sigue los pasos para pedir y tomar un descanso.",
    helperText: "Avanza paso a paso y vuelve cuando te sientas preparado/a.",
    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        type: "pictogram",
        title: "Notar que necesito una pausa",
        instruction: "Observa cómo te sientes y si necesitas descansar.",
        floCardCode: "ASK_FOR_BREAK_NOTICE",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Comunicarlo",
        instruction: "Cuenta que necesitas tomar un descanso.",
        floCardCode: "ASK_FOR_BREAK_COMMUNICATE",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Ir al lugar acordado",
        instruction: "Ve al lugar acordado para descansar.",
        floCardCode: "ASK_FOR_BREAK_GO_TO_PLACE",
      },
      {
        position: 4,
        type: "pictogram",
        title: "Tomar el descanso",
        instruction: "Tómate el tiempo que necesitas para descansar.",
        floCardCode: "ASK_FOR_BREAK_REST",
      },
      {
        position: 5,
        type: "pictogram",
        title: "Revisar si puedo volver",
        instruction: "Comprueba si te sientes preparado/a para volver.",
        floCardCode: "ASK_FOR_BREAK_CHECK_RETURN",
      },
    ],
  },

  ASK_FOR_HELP_SEQUENCE: {
    interactionType: "sequence",
    title: "Pedir ayuda",
    instruction: "Sigue los pasos para pedir ayuda cuando la necesites.",
    helperText: "Avanza paso a paso siguiendo los pictogramas.",
    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        type: "pictogram",
        title: "Identificar una dificultad",
        instruction:
          "Piensa qué es lo que te está costando o necesitas resolver.",
        floCardCode: "ASK_FOR_HELP_IDENTIFY_DIFFICULTY",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Elegir a quién pedir ayuda",
        instruction: "Piensa en una persona de confianza que pueda ayudarte.",
        floCardCode: "ASK_FOR_HELP_CHOOSE_PERSON",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Comunicar que necesito ayuda",
        instruction: "Dile o muéstrale a esa persona que necesitas ayuda.",
        floCardCode: "ASK_FOR_HELP_COMMUNICATE",
      },
      {
        position: 4,
        type: "pictogram",
        title: "Mostrar o explicar",
        instruction:
          "Muestra o explica qué necesitas que te ayuden a resolver.",
        floCardCode: "ASK_FOR_HELP_SHOW_EXPLAIN",
      },
    ],
  },
  USE_TOILET_SEQUENCE: {
    interactionType: "sequence",
    title: "Ir al baño",
    instruction: "Sigue cada paso para ir al baño.",
    helperText: "Avanza paso a paso siguiendo los pictogramas.",
    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        type: "pictogram",
        title: "Ir al baño",
        instruction: "Ve al baño cuando lo necesites.",
        floCardCode: "USE_TOILET_GO",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Bajar la ropa necesaria",
        instruction: "Baja la ropa necesaria para usar el inodoro.",
        floCardCode: "USE_TOILET_LOWER_CLOTHES",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Usar el inodoro",
        instruction: "Siéntate y usa el inodoro.",
        floCardCode: "USE_TOILET_USE",
      },
      {
        position: 4,
        type: "pictogram",
        title: "Limpiarse",
        instruction: "Límpiate cuando termines.",
        floCardCode: "USE_TOILET_CLEAN",
      },
      {
        position: 5,
        type: "pictogram",
        title: "Subir la ropa",
        instruction: "Sube y acomoda tu ropa.",
        floCardCode: "USE_TOILET_PULL_UP_CLOTHES",
      },
      {
        position: 6,
        type: "pictogram",
        title: "Lavarse las manos",
        instruction: "Lava tus manos antes de salir del baño.",
        floCardCode: "USE_TOILET_WASH_HANDS",
      },
    ],
  },
  EAT_WITH_UTENSILS_SEQUENCE: {
    interactionType: "sequence",
    title: "Comer con cubiertos",
    instruction: "Sigue cada paso para comer usando tus cubiertos.",
    helperText: "Avanza paso a paso siguiendo los pictogramas.",
    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        type: "pictogram",
        title: "Preparar cubiertos",
        instruction: "Identifica y prepara los cubiertos que vas a usar.",
        floCardCode: "EAT_WITH_UTENSILS_PREPARE",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Tomar una porción",
        instruction: "Toma una porción de comida con el cubierto.",
        floCardCode: "EAT_WITH_UTENSILS_TAKE_PORTION",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Comer a ritmo propio",
        instruction: "Come tranquilamente a tu propio ritmo.",
        floCardCode: "EAT_WITH_UTENSILS_EAT",
      },
      {
        position: 4,
        type: "pictogram",
        title: "Dejar cubiertos al terminar",
        instruction:
          "Cuando termines, deja los cubiertos en el plato o lugar correspondiente.",
        floCardCode: "EAT_WITH_UTENSILS_FINISH",
      },
    ],
  },
  PUT_AWAY_TOYS_SEQUENCE: {
    interactionType: "sequence",
    title: "Guardar juguetes",
    instruction: "Sigue cada paso para guardar tus juguetes.",
    helperText: "Avanza paso a paso siguiendo los pictogramas.",
    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        type: "pictogram",
        title: "Juntar los juguetes",
        instruction: "Reúne los juguetes que están fuera de su lugar.",
        floCardCode: "PUT_AWAY_TOYS_GATHER",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Separar por lugar",
        instruction: "Ordena los juguetes según dónde corresponde guardarlos.",
        floCardCode: "PUT_AWAY_TOYS_SORT",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Guardar",
        instruction: "Guarda cada juguete en su lugar.",
        floCardCode: "PUT_AWAY_TOYS_STORE",
      },
    ],
  },
  ORGANIZE_BEDROOM_SEQUENCE: {
    interactionType: "sequence",
    title: "Ordenar la habitación",
    instruction: "Sigue cada paso para ordenar tu habitación.",
    helperText: "Avanza paso a paso siguiendo los pictogramas.",
    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        type: "pictogram",
        title: "Recoger ropa",
        instruction: "Recoge la ropa que está fuera de su lugar.",
        floCardCode: "ORGANIZE_BEDROOM_CLOTHES",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Guardar juguetes",
        instruction: "Ordena y guarda los juguetes en su lugar.",
        floCardCode: "ORGANIZE_BEDROOM_TOYS",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Ordenar superficies",
        instruction: "Ordena los objetos que están sobre las superficies.",
        floCardCode: "ORGANIZE_BEDROOM_SURFACES",
      },
      {
        position: 4,
        type: "pictogram",
        title: "Arreglar la cama",
        instruction: "Ordena y deja lista tu cama.",
        floCardCode: "ORGANIZE_BEDROOM_BED",
      },
      {
        position: 5,
        type: "pictogram",
        title: "Revisar",
        instruction: "Mira tu habitación y revisa si todo quedó en su lugar.",
        floCardCode: "ORGANIZE_BEDROOM_REVIEW",
      },
    ],
  },
  EXPRESS_FEELINGS_SEQUENCE: {
    interactionType: "sequence",
    title: "Contar cómo me siento",
    instruction: "Sigue los pasos para reconocer y comunicar cómo te sientes.",
    helperText: "Avanza paso a paso siguiendo los pictogramas.",
    completionLabel: "Terminé",

    steps: [
      {
        position: 1,
        type: "pictogram",
        title: "Notar cómo estoy",
        instruction: "Observa cómo te sientes en este momento.",
        floCardCode: "EXPRESS_FEELINGS_NOTICE",
      },
      {
        position: 2,
        type: "pictogram",
        title: "Elegir una forma de comunicarlo",
        instruction: "Piensa cómo quieres contar o mostrar cómo te sientes.",
        floCardCode: "EXPRESS_FEELINGS_METHOD",
      },
      {
        position: 3,
        type: "pictogram",
        title: "Comunicarlo",
        instruction: "Comunica a una persona cómo te estás sintiendo.",
        floCardCode: "EXPRESS_FEELINGS_COMMUNICATE",
      },
      {
        position: 4,
        type: "pictogram",
        title: "Pedir algo si lo necesito",
        instruction: "Si necesitas algo, comunícalo o pide apoyo.",
        floCardCode: "EXPRESS_FEELINGS_REQUEST",
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
