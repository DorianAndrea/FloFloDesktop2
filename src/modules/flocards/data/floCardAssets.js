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

import prepareBackpackPrepare from "../svg/preparar.svg";
import prepareBackpackPencilCase from "../svg/guardando_estuche.svg";
import prepareBackpackSnackBottle from "../svg/guardando_colacion_botella.svg";
import prepareBackpackStore from "../svg/guardando.svg";
import prepareBackpackClose from "../svg/cerrando_mochila.svg";

import takeShowerPrepare from "../svg/preparando_ropa.svg";
import takeShowerEnter from "../svg/meterse_ducha.svg";
import takeShowerWashBody from "../svg/bañandose.svg";
import takeShowerWashHair from "../svg/lavarse_pelo.svg";
import takeShowerDress from "../svg/vistiendose.svg";

import returnFromRecessSignal from "../svg/senal.svg";
import returnFromRecessWalk from "../svg/caminando.svg";
import returnFromRecessPrepare from "../svg/prepararse.svg";

import combHairTakeBrush from "../svg/cepillo2.svg";
import combHairDetangle from "../svg/peinarse.svg";
import combHairReview from "../svg/espejo.svg";

import askForBreakNotice from "../svg/pedir_pausa.svg";
import askForBreakCommunicate from "../svg/comunicando.svg";
import askForBreakGoToPlace from "../svg/lugar_tranquilo.svg";
import askForBreakRest from "../svg/respirando.svg";
import askForBreakCheckReturn from "../svg/revisando.svg";

import askForHelpIdentifyDifficulty from "../svg/identificar_dificultad.svg";
import askForHelpChoosePerson from "../svg/elegir.svg";
import askForHelpCommunicate from "../svg/como_siento.svg";
import askForHelpShowExplain from "../svg/mostrar_emociones.svg";

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

  PREPARE_BACKPACK_SEQUENCE: prepareBackpackPrepare,

  PREPARE_BACKPACK_PREPARE: prepareBackpackPrepare,

  PREPARE_BACKPACK_PENCIL_CASE: prepareBackpackPencilCase,

  PREPARE_BACKPACK_SNACK_BOTTLE: prepareBackpackSnackBottle,

  PREPARE_BACKPACK_STORE: prepareBackpackStore,

  PREPARE_BACKPACK_CLOSE: prepareBackpackClose,

  TAKE_SHOWER_SEQUENCE: takeShowerPrepare,

  TAKE_SHOWER_PREPARE: takeShowerPrepare,

  TAKE_SHOWER_ENTER: takeShowerEnter,

  TAKE_SHOWER_WASH_BODY: takeShowerWashBody,

  TAKE_SHOWER_WASH_HAIR: takeShowerWashHair,

  TAKE_SHOWER_RINSE: takeShowerWashBody,

  TAKE_SHOWER_DRY_DRESS: takeShowerDress,

  RETURN_FROM_RECESS_SEQUENCE: returnFromRecessSignal,

  RETURN_FROM_RECESS_SIGNAL: returnFromRecessSignal,

  RETURN_FROM_RECESS_FINISH_ACTIVITY: returnFromRecessWalk,

  RETURN_FROM_RECESS_RETURN_CLASSROOM: returnFromRecessWalk,

  RETURN_FROM_RECESS_PREPARE: returnFromRecessPrepare,

  COMB_HAIR_SEQUENCE: combHairDetangle,

  COMB_HAIR_TAKE_BRUSH: combHairTakeBrush,

  COMB_HAIR_DETANGLE: combHairDetangle,

  COMB_HAIR_REVIEW: combHairReview,

  ASK_FOR_BREAK_SEQUENCE: askForBreakNotice,

  ASK_FOR_BREAK_NOTICE: askForBreakNotice,

  ASK_FOR_BREAK_COMMUNICATE: askForBreakCommunicate,

  ASK_FOR_BREAK_GO_TO_PLACE: askForBreakGoToPlace,

  ASK_FOR_BREAK_REST: askForBreakRest,

  ASK_FOR_BREAK_CHECK_RETURN: askForBreakCheckReturn,

  ASK_FOR_HELP_SEQUENCE: askForHelpIdentifyDifficulty,
 
  ASK_FOR_HELP_IDENTIFY_DIFFICULTY: askForHelpIdentifyDifficulty,
  
  ASK_FOR_HELP_CHOOSE_PERSON: askForHelpChoosePerson,
  
  ASK_FOR_HELP_COMMUNICATE: askForHelpCommunicate,
  
  ASK_FOR_HELP_SHOW_EXPLAIN: askForHelpShowExplain,
});

export const getFloCardAsset = (floCardCode) => {
  if (!floCardCode) {
    return null;
  }

  return FLO_CARD_ASSETS[floCardCode] || null;
};

export default FLO_CARD_ASSETS;
