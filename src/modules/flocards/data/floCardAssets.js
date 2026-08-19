import brushTeethTakeBrush from "../svg/tomar_cepillo.svg";
import brushTeethToothpaste from "../svg/pasta_dientes.svg";
import brushTeethAction from "../svg/cepillo.svg";
import brushTeethRinse from "../svg/enjuagar.svg";
import brushTeethPutAway from "../svg/dejar_cepillo.svg";


import waitForTurnAction from "../svg/reloj_azul_floflo_oficial.svg";

import feelingHappy from "../svg/feeling_happy.svg";

import feelingSad from "../svg/feeling_sad.svg";

import feelingAngry from "../svg/feeling_angry.svg";

import feelingNervous from "../svg/feeling_nervous.svg";

import feelingTired from "../svg/feeling_tired.svg";

//import feelingUnsure from "../svg/feeling_unsure.svg";

import washHandsWet from "../svg/mojar_manos.svg";

import washHandsSoap from "../svg/jabon_manos.svg";

import washHandsRub from "../svg/frotar_manos.svg";

import washHandsRinse from "../svg/enjuagar_manos.svg";

import washHandsDry from "../svg/secar_manos.svg";


const FLO_CARD_ASSETS = Object.freeze({

  BRUSH_TEETH_TAKE_BRUSH: brushTeethTakeBrush,

  BRUSH_TEETH_TOOTHPASTE: brushTeethToothpaste,

  BRUSH_TEETH_ACTION: brushTeethAction,

  BRUSH_TEETH_RINSE: brushTeethRinse,

  BRUSH_TEETH_PUT_AWAY: brushTeethPutAway,


  WAIT_FOR_TURN_ACTION: waitForTurnAction,

  FEELING_HAPPY: feelingHappy,

  FEELING_SAD: feelingSad,

  FEELING_ANGRY: feelingAngry,

  FEELING_NERVOUS: feelingNervous,

  FEELING_TIRED: feelingTired,

  //FEELING_UNSURE: feelingUnsure,


  WASH_HANDS_WET: washHandsWet,

  WASH_HANDS_SOAP: washHandsSoap,

  WASH_HANDS_RUB: washHandsRub,

  WASH_HANDS_RINSE: washHandsRinse,

  WASH_HANDS_DRY: washHandsDry,

});


export const getFloCardAsset = (floCardCode) => {

  if (!floCardCode) {
    return null;
  }

  return FLO_CARD_ASSETS[floCardCode] || null;
};


export default FLO_CARD_ASSETS;