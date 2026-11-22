import { useState } from "react";

import FloCardPictogram from "../../modules/flocards/FloCardPictogram";

import FloCardExperience from "../../modules/flocards/FloCardExperience";

const SUPPORT_OPTIONS = [
  { code: "independent", label: "🌟 Realizado sin apoyo" },
  { code: "verbal", label: "💬 Apoyo verbal" },
  { code: "visual", label: "👁️ Apoyo visual" },
  { code: "gestural", label: "👋 Apoyo gestual" },
  { code: "physical_partial", label: "🤝 Apoyo físico parcial" },
  { code: "physical_total", label: "🫶 Apoyo físico total" },
];

const RoutineCard = ({

  routine,

  showCompleteButton = false,

  compact = false,

  isNext = false,

  expanded = true,

  readOnly = false,

  onToggleExpanded = null,

  updatingStepKey,

  isScheduledToday,

  onToggleStep,

  onCompleteStepSequence,

  onStartFloCard,

  onComplete,

  onEdit,

  onDelete,

  canCreateOrEditRoutines,

  canDeleteRoutines,

  formatTime,

  formatDays,

  getFullName,

  getSupportProfileLabel,

}) => {

  const [activeFloCardStepId, setActiveFloCardStepId] = useState(null);

  const [supportSelections, setSupportSelections] = useState({});

  const [activeFloCardExperience, setActiveFloCardExperience] = useState(null);

  const [completingFloCard, setCompletingFloCard] = useState(false);

  const [sequencePreviewStepIds, setSequencePreviewStepIds] = useState([]);

  const creatorName = getFullName(

    routine.creator_first_name,

    routine.creator_last_name,

  );

  const creatorProfile = getSupportProfileLabel(

    routine.creator_relationship_key,

    routine.creator_access_profile,

  );

  const completerName = getFullName(

    routine.today_completer_first_name,

    routine.today_completer_last_name,

  );

  const completerProfile = getSupportProfileLabel(

    routine.today_completer_relationship_key,

    routine.today_completer_access_profile,

  );

  const hasCreatorInformation = Boolean(

    routine.created_by ||

    routine.creator_first_name ||

    routine.creator_access_profile ||

    routine.creator_relationship_key,

  );

  const hasCompleterInformation = Boolean(

    routine.today_completed_by ||

    routine.today_completer_first_name ||

    routine.today_completer_access_profile ||

    routine.today_completer_relationship_key,

  );

  const totalSteps = Array.isArray(routine.steps) ? routine.steps.length : 0;

  const completedSteps = Array.isArray(routine.steps)

    ? routine.steps.filter(

        (step) =>

          Boolean(step.completed_today) ||

          sequencePreviewStepIds.includes(step.id),

      ).length

    : 0;

  const progress = totalSteps === 0 ? 0 : (completedSteps / totalSteps) * 100;

  const isCollapsible = typeof onToggleExpanded === "function";

  const handleCloseFloCardExperience = () => {

    setActiveFloCardExperience(null);

    setActiveFloCardStepId(null);

    setSequencePreviewStepIds([]);

  };

  const handleSequenceStepComplete = ({ stepIndex }) => {

    if (!activeFloCardExperience) {

      return;

    }

    const { routine: activeRoutine } = activeFloCardExperience;

    const orderedSteps = Array.isArray(activeRoutine.steps)

      ? [...activeRoutine.steps].sort(

          (a, b) => Number(a.position) - Number(b.position),

        )

      : [];

    const routineStep = orderedSteps[stepIndex];

    if (!routineStep?.id) {

      return;

    }

    /*

     * Solo actualización visual.

     *

     * NO llamamos al backend aquí porque eso recargaría

     * RoutineCard y cerraría el modal.

     */

    setSequencePreviewStepIds((current) => {

      if (current.includes(routineStep.id)) {

        return current;

      }

      return [...current, routineStep.id];

    });

  };

  const handleCompleteFloCardExperience = async (interactionResult = null) => {

    if (!activeFloCardExperience || completingFloCard) {

      return;

    }

    const { routine: activeRoutine, step: activeStep } =

      activeFloCardExperience;

    const selectedCodes = Array.isArray(interactionResult?.supportCodes)
      ? interactionResult.supportCodes
      : (supportSelections[activeStep.id] ?? []);
    const selectedSupportLevel = selectedCodes.length === 1 ? selectedCodes[0] : null;

    try {

      setCompletingFloCard(true);

      const isSequence =

        interactionResult?.completed === true &&

        Number(interactionResult?.totalSteps || 0) > 1;

      if (isSequence && typeof onCompleteStepSequence === "function") {

        const orderedSteps = Array.isArray(activeRoutine.steps)

          ? [...activeRoutine.steps].sort(

              (a, b) => Number(a.position) - Number(b.position),

            )

          : [];

        const sequenceStepIds = orderedSteps

          .map((step) => step.id)

          .filter(Boolean);

        const sequenceResponse = await onCompleteStepSequence(

          activeRoutine,

          activeStep,

          sequenceStepIds,

          selectedSupportLevel,

          interactionResult,

          interactionResult?.supportSelections ?? {},

        );

        /*

         * Si el backend confirma que todos los pasos requeridos

         * quedaron completos, marcamos automáticamente

         * la rutina completa como realizada.

         */

        if (

          sequenceResponse?.allRequiredStepsCompleted === true &&

          !activeRoutine.completed_today &&

          typeof onComplete === "function"

        ) {

          await onComplete(activeRoutine);

        }

      } else {

        await onToggleStep(

          activeRoutine,

          activeStep,

          selectedSupportLevel,

          interactionResult,

          selectedCodes,

        );

      }

      setActiveFloCardExperience(null);

      setActiveFloCardStepId(null);

      setSequencePreviewStepIds([]);

    } finally {

      setCompletingFloCard(false);

    }

  };

  return (

    <div

      className={`rounded-3xl border-2 p-5 transition ${

        routine.completed_today

          ? "border-green-200 bg-green-50"

          : "border-[#DCCCF8] bg-white"

      }`}

    >

      {isCollapsible && !expanded && (

        <button

          type="button"

          onClick={onToggleExpanded}

          className="flex w-full items-center gap-4 text-left"

          aria-expanded="false"

        >

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="min-w-0 truncate text-lg font-extrabold text-[#4B367C]">

                {routine.name}

              </h3>

              {isNext && !routine.completed_today && (

                <span className="rounded-full bg-[#EEE7FF] px-3 py-1 text-xs font-extrabold text-[#6F56A6]">

                  Próxima

                </span>

              )}

              {!routine.completed_today && isScheduledToday(routine) && (

                <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-700">

                  Pendiente

                </span>

              )}

            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-[#756596]">

              {routine.start_time && routine.end_time && (

                <span>

                  {formatTime(routine.start_time)} -{" "}

                  {formatTime(routine.end_time)}

                </span>

              )}

              {totalSteps > 0 && (

                <span>

                  {completedSteps}/{totalSteps} pasos

                </span>

              )}

            </div>

            {totalSteps > 0 && (

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#EEE7FA]">

                <div

                  className="h-full rounded-full bg-[#7C5CE6] transition-all duration-500"

                  style={{

                    width: `${progress}%`,

                  }}

                />

              </div>

            )}

          </div>

          <span

            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3ECFF] text-xl font-black text-[#5F4A8B]"

            aria-hidden="true"

          >

            ▼

          </span>

        </button>

      )}

      {(!isCollapsible || expanded) && (

        <div className="flex w-full flex-col gap-5">

          {isCollapsible && (

            <div className="flex justify-end">

              <button

                type="button"

                onClick={onToggleExpanded}

                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3ECFF] text-lg font-black text-[#5F4A8B] transition hover:bg-[#E8DDFF]"

                aria-label={`Colapsar ${routine.name}`}

                aria-expanded="true"

              >

                ▲

              </button>

            </div>

          )}

          <div className="w-full min-w-0">

            <div className="flex w-full flex-wrap items-center gap-2">

              <h3 className="min-w-0 break-words text-xl font-bold leading-snug text-[#4B367C]">

                {routine.name}

              </h3>

              {routine.completed_today && (

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">

                  Hecha hoy

                </span>

              )}

              {!routine.completed_today && isScheduledToday(routine) && (

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">

                  Pendiente hoy

                </span>

              )}

              {!isScheduledToday(routine) && (

                <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-bold text-[#6B5A95]">

                  No toca hoy

                </span>

              )}

            </div>

            {routine.start_time && routine.end_time && (

              <p className="mt-2 text-[#6B5A95]">

                {formatTime(routine.start_time)} -{" "}

                {formatTime(routine.end_time)}

              </p>

            )}

            <p className="mt-1 text-sm font-semibold text-[#9B7BE8]">

              {formatDays(routine.days_of_week)}

            </p>

            {routine.learning_context_key &&

              routine.learning_context_key !== "unspecified" && (

                <div

                  className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"

                  style={{

                    borderColor: routine.learning_context_color || "#DCCCF8",

                    backgroundColor:

                      routine.learning_context_color || "#F7F3FF",

                  }}

                >

                  <span aria-hidden="true">

                    {routine.learning_context_icon || "📍"}

                  </span>

                  <span className="text-sm font-bold text-[#5F4A8B]">

                    {routine.learning_context_name}

                  </span>

                </div>

              )}

            {routine.description && !compact && (

              <p className="mt-3 w-full max-w-none break-words leading-relaxed text-[#6B5A95]">

                {routine.description}

              </p>

            )}

            {Array.isArray(routine.steps) && routine.steps.length > 0 && (

              <div className="mt-6 w-full">

                <div className="grid w-full gap-4 lg:grid-cols-[minmax(180px,1fr)_minmax(220px,1fr)_auto] lg:items-center">

                  <div className="w-full">

                    <div className="h-3 w-full overflow-hidden rounded-full bg-[#EEE7FA]">

                      <div

                        className="h-full rounded-full bg-[#7C5CE6] transition-all duration-500 ease-out"

                        style={{ width: `${progress}%` }}

                      />

                    </div>

                    <div className="mt-2 flex justify-between text-sm font-semibold text-[#756596]">

                      <span>

                        {completedSteps} de {totalSteps} pasos

                      </span>

                      <span>{Math.round(progress)}%</span>

                    </div>

                  </div>

                  <div>

                    <p className="text-sm font-extrabold uppercase tracking-wide text-[#9B7BE8]">

                      Pasos de la experiencia

                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#756596]">

                      Completa cada paso en orden.

                    </p>

                  </div>

                  <span className="rounded-full bg-[#F3ECFF] px-4 py-2 text-sm font-extrabold text-[#5F4A8B]">

                    {completedSteps}/{totalSteps}

                  </span>

                </div>

                <div className="mt-4 grid w-full gap-3">

                  {routine.steps.map((step, index) => {

                    const isPersistedChecked = Boolean(step.completed_today);

                    const isSequencePreviewChecked =

                      sequencePreviewStepIds.includes(step.id);

                    const isChecked =

                      isPersistedChecked || isSequencePreviewChecked;

                    const stepKey = `${routine.id}:${step.id}`;

                    const isUpdating = updatingStepKey === stepKey;

                    const selectedSupportCodes =

                      supportSelections[step.id] ?? [];

                  const selectedSupportLevel =
                    selectedSupportCodes.length === 1 ? selectedSupportCodes[0] : null;

                    const handleSupportChange = (supportCode) => {

                      setSupportSelections((current) => {

                        const previous = current[step.id] ?? [];

                        let next;

                        if (previous.includes(supportCode)) {

                          next = previous.filter(

                            (code) => code !== supportCode,

                          );

                        } else if (supportCode === "independent") {

                          next = ["independent"];

                        } else {

                          next = [

                            ...previous.filter(

                              (code) => code !== "independent",

                            ),

                            supportCode,

                          ];

                        }

                        return {

                          ...current,

                          [step.id]: next,

                        };

                      });

                    };

                    const isFloCardActive =

                      Number(activeFloCardStepId) === Number(step.id);

                    const floCardState = isChecked

                      ? "completed"

                      : isFloCardActive

                        ? "active"

                        : "idle";

                    return (

                      <div

                        key={step.id || `${routine.id}-${index}`}

                        role="button"

                        tabIndex={0}

                        aria-pressed={isChecked}

                        onClick={async () => {

                          if (readOnly || isUpdating) return;

                          await onToggleStep(

                            routine,

                            step,

                            selectedSupportLevel,

                          );

                          if (!isChecked) {

                            setActiveFloCardStepId(null);

                          }

                        }}

                        onKeyDown={async (event) => {

                          if (

                            readOnly ||

                            isUpdating ||

                            (event.key !== "Enter" && event.key !== " ")

                          ) {

                            return;

                          }

                          event.preventDefault();

                          await onToggleStep(

                            routine,

                            step,

                            selectedSupportLevel,

                          );

                          if (!isChecked) {

                            setActiveFloCardStepId(null);

                          }

                        }}

                        className={`w-full rounded-3xl border-2 px-4 py-4 text-left transition sm:px-5 ${

                          isChecked

                            ? "border-green-300 bg-green-50 hover:bg-green-100"

                            : "border-[#E4D8FF] bg-[#FAF8FF] hover:border-[#BCA6F0] hover:bg-white"

                        } ${

                          readOnly

                            ? "cursor-default"

                            : isUpdating

                              ? "cursor-wait opacity-60"

                              : "cursor-pointer"

                        }`}

                      >

                        <div className="flex w-full items-start gap-3">

                          {/* Número / check */}

                          <span

                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-lg font-extrabold ${

                              isChecked

                                ? "border-green-500 bg-green-500 text-white"

                                : "border-[#DCCCF8] bg-white text-[#5F4A8B]"

                            }`}

                            aria-hidden="true"

                          >

                            {isUpdating ? "…" : isChecked ? "✓" : index + 1}

                          </span>

                          {/* Contenido principal */}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start gap-3">

                              <FloCardPictogram

                                floCard={

                                  step.flocard_code

                                    ? {

                                        code: step.flocard_code,

                                        name: step.title,

                                        icon: step.icon,

                                      }

                                    : null

                                }

                                fallbackIcon={step.icon}

                                compact

                                state={floCardState}

                                onClick={async (event) => {

                                  event.stopPropagation();

                                  if (

                                    readOnly ||

                                    !step.flocard_code ||

                                    isChecked ||

                                    isUpdating

                                  ) {

                                    return;

                                  }

                                  const isAlreadyActive =

                                    Number(activeFloCardStepId) ===

                                    Number(step.id);

                                  if (isAlreadyActive) {

                                    setActiveFloCardStepId(null);

                                    return;

                                  }

                                  setActiveFloCardStepId(step.id);

                                  if (typeof onStartFloCard === "function") {

                                    await onStartFloCard(routine, step);

                                  }

                                  setActiveFloCardExperience({

                                    routine,

                                    step,

                                    floCard: {

                                      code: step.flocard_code,

                                      name: step.title,

                                      icon: step.icon,

                                    },

                                  });

                                }}

                              />

                              <div className="min-w-0 flex-1">

                                <p

                                  className={`text-base font-extrabold leading-snug sm:text-lg ${

                                    isChecked

                                      ? "text-green-700 line-through"

                                      : "text-[#4B367C]"

                                  }`}

                                >

                                  {step.title}

                                </p>

                                {step.description && (

                                  <p className="mt-1 text-sm font-medium leading-relaxed text-[#756596]">

                                    {step.description}

                                  </p>

                                )}

                              </div>

                            </div>

                            {!readOnly && !isChecked && !step.flocard_code && (

                              <div

                                className="mt-4"

                                onClick={(event) => event.stopPropagation()}

                                onKeyDown={(event) => event.stopPropagation()}

                              >

                                <fieldset disabled={isUpdating} className="max-w-md">
                                  <legend className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#9B7BE8]">
                                    Tipos de apoyo observados (opcional)
                                  </legend>
                                  <div className="grid gap-2">
                                    {SUPPORT_OPTIONS.map((support) => (
                                      <label
                                        key={support.code}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                                          selectedSupportCodes.includes(support.code)
                                            ? "border-[#9B7BE8] bg-[#EEE7FF] text-[#4B367C]"
                                            : "border-[#E4D8FF] bg-white text-[#756596]"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedSupportCodes.includes(support.code)}
                                          onChange={() => handleSupportChange(support.code)}
                                          className="h-4 w-4 accent-[#7C5CE6]"
                                        />
                                        {support.label}
                                      </label>
                                    ))}
                                  </div>
                                  {selectedSupportCodes.length === 0 && (
                                    <p className="mt-2 text-xs font-medium text-[#8A7BB0]">
                                      Apoyo no informado
                                    </p>
                                  )}
                                </fieldset>

                              </div>

                            )}

                            {/* Metadata debajo, nunca compite con el título */}

                            {(step.estimated_minutes || step.is_optional) && (

                              <div className="mt-3 flex flex-wrap items-center gap-2">

                                {step.estimated_minutes && (

                                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[#6B5A95] shadow-sm">

                                    {step.estimated_minutes} min

                                  </span>

                                )}

                                {step.is_optional && (

                                  <span className="rounded-full bg-[#EEE7FA] px-3 py-1.5 text-xs font-extrabold text-[#756596]">

                                    Opcional

                                  </span>

                                )}

                              </div>

                            )}

                          </div>

                        </div>

                      </div>

                    );

                  })}

                </div>

              </div>

            )}

            <div className="mt-3 rounded-2xl border border-[#E4D8FF] bg-[#F7F3FF] px-4 py-3">

              {hasCreatorInformation ? (

                <>

                  <p className="text-xs font-bold uppercase tracking-wide text-[#9B7BE8]">

                    Creada por

                  </p>

                  <p className="mt-1 font-bold text-[#4B367C]">{creatorName}</p>

                  <p className="text-sm font-semibold text-[#6B5A95]">

                    {creatorProfile}

                  </p>

                </>

              ) : (

                <div>

                  <p className="text-xs font-bold uppercase tracking-wide text-[#9B7BE8]">

                    Creada anteriormente

                  </p>

                  <p className="mt-1 font-bold text-[#4B367C]">

                    Por una cuenta cuidadora

                  </p>

                  <p className="text-sm font-semibold text-[#8A7BB0]">

                    Registro anterior

                  </p>

                </div>

              )}

            </div>

            {routine.today_completed_at && (

              <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">

                <p className="font-semibold text-green-700">

                  Completada hoy a las{" "}

                  {new Date(routine.today_completed_at).toLocaleTimeString(

                    "es-CL",

                    { hour: "2-digit", minute: "2-digit" },

                  )}

                </p>

                {hasCompleterInformation ? (

                  <>

                    <p className="mt-2 text-sm font-bold text-[#4B367C]">

                      Marcada como realizada por {completerName}

                    </p>

                    <p className="text-sm font-semibold text-[#6B5A95]">

                      {completerProfile}

                    </p>

                  </>

                ) : (

                  <div className="mt-2">

                    <p className="text-sm font-bold text-[#4B367C]">

                      Marcada como realizada desde una cuenta cuidadora

                    </p>

                    <p className="text-sm text-[#8A7BB0]">Registro anterior</p>

                  </div>

                )}

              </div>

            )}

          </div>

          <div className="flex w-full flex-wrap gap-2 border-t border-[#EEE7FA] pt-4">

            {showCompleteButton && (

              <button

                type="button"

                onClick={() => onComplete(routine)}

                disabled={routine.completed_today}

                className={`min-w-fit rounded-2xl px-4 py-2 font-bold text-white transition ${

                  routine.completed_today

                    ? "cursor-not-allowed bg-green-300"

                    : "bg-green-500 hover:bg-green-600"

                }`}

              >

                {routine.completed_today ? "✅ Lista" : "⭐ Realizada"}

              </button>

            )}

            {canCreateOrEditRoutines && (

              <button

                type="button"

                onClick={() => onEdit(routine)}

                className="min-w-fit rounded-2xl bg-[#9B7BE8] px-4 py-2 font-bold text-white transition hover:bg-[#8B6FD6]"

              >

                Editar

              </button>

            )}

            {canDeleteRoutines && (

              <button

                type="button"

                onClick={() => onDelete(routine)}

                className="min-w-fit rounded-2xl bg-red-400 px-4 py-2 font-bold text-white transition hover:bg-red-500"

              >

                Eliminar

              </button>

            )}

          </div>

        </div>

      )}

      {activeFloCardExperience && (

        <FloCardExperience

          floCard={activeFloCardExperience.floCard}

          step={activeFloCardExperience.step}

          completing={completingFloCard}

          onClose={handleCloseFloCardExperience}

          onComplete={handleCompleteFloCardExperience}

          onSequenceStepComplete={handleSequenceStepComplete}

        />

      )}

    </div>

  );

};

export default RoutineCard;
