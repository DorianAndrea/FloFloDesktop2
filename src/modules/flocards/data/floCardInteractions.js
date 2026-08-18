const FLO_CARD_INTERACTIONS = Object.freeze({
  BRUSH_TEETH_ACTION: {
    interactionType: "animation",

    title: "Cepillar los dientes",

    instruction: "Cepilla todas las zonas de tus dientes.",

    helperText: "Sigue el movimiento del pictograma.",

    completionLabel: "Listo",
  },
});

export const getFloCardInteraction = (floCardCode) => {
  if (!floCardCode) {
    return null;
  }

  return FLO_CARD_INTERACTIONS[floCardCode] || null;
};

export default FLO_CARD_INTERACTIONS;