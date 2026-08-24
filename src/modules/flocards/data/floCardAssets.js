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

import sleepPreparationBath from "../svg/banarse.svg";
import sleepPreparationPajamas from "../svg/pijama.svg";
import sleepPreparationStory from "../svg/cuento.svg";
import sleepPreparationSleep from "../svg/dormido.svg";

import dressingChooseClothes from "../svg/elegir_ropa.svg";
import dressingUnderwear from "../svg/ropa_interior.svg";
import dressingPants from "../svg/ponerse_pantalon.svg";
import dressingShirt from "../svg/ponerse_polera.svg";
import dressingSocks from "../svg/ponerse_calcetines.svg";
import dressingShoes from "../svg/ponerse_zapatos.svg";

import prepareSchoolBreakfast from "../svg/desayunando.svg";
import prepareSchoolBackpack from "../svg/revisar_mochila.svg";
import prepareSchoolOuterwear from "../svg/zapatos_abrigo.svg";
import prepareSchoolLeave from "../svg/salir_al_colegio.svg";

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

  SLEEP_PREPARATION_BATH: sleepPreparationBath,

  SLEEP_PREPARATION_SEQUENCE: sleepPreparationBath,

  SLEEP_PREPARATION_PAJAMAS: sleepPreparationPajamas,

  SLEEP_PREPARATION_STORY: sleepPreparationStory,

  SLEEP_PREPARATION_SLEEP: sleepPreparationSleep,

  DRESSING_SEQUENCE: dressingChooseClothes,

  DRESSING_CHOOSE_CLOTHES: dressingChooseClothes,

  DRESSING_UNDERWEAR: dressingUnderwear,

  DRESSING_SHIRT: dressingShirt,

  DRESSING_PANTS: dressingPants,

  DRESSING_SOCKS: dressingSocks,

  DRESSING_SHOES: dressingShoes,

  PREPARE_FOR_SCHOOL_SEQUENCE: dressingChooseClothes,

  PREPARE_SCHOOL_BREAKFAST: prepareSchoolBreakfast,

  PREPARE_SCHOOL_BACKPACK: prepareSchoolBackpack,

  PREPARE_SCHOOL_OUTERWEAR: prepareSchoolOuterwear,
  
  PREPARE_SCHOOL_LEAVE: prepareSchoolLeave,
});

export const getFloCardAsset = (floCardCode) => {
  if (!floCardCode) {
    return null;
  }

  return FLO_CARD_ASSETS[floCardCode] || null;
};

export default FLO_CARD_ASSETS;
