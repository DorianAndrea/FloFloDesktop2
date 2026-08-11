import brushTeethAction from "../svg/cepillo.svg";

const FLO_CARD_ASSETS = Object.freeze({
  BRUSH_TEETH_ACTION: brushTeethAction,
});

export const getFloCardAsset = (floCardCode) => {
  if (!floCardCode) {
    return null;
  }

  return FLO_CARD_ASSETS[floCardCode] || null;
};

export default FLO_CARD_ASSETS;