import { useState } from "react";
import FloCardPictogram from "../../modules/flocards/FloCardPictogram";
import FloCardExperience from "../../modules/flocards/FloCardExperience";

const RoutineCard = ({
  routine,
  showCompleteButton = false,
  compact = false,
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
  const [supportLevels, setSupportLevels] = useState({});
  const [activeFloCardExperience, setActiveFloCardExperience] = useState(null);
  const [completingFloCard, setCompletingFloCard] = useState(false);

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
    ? routine.steps.filter((step) => Boolean(step.completed_today)).length
    : 0;

  const progress = totalSteps === 0 ? 0 : (completedSteps / totalSteps) * 100;
  const handleCloseFloCardExperience = () => {
    setActiveFloCardExperience(null);
    setActiveFloCardStepId(null);
  };

  const handleCompleteFloCardExperience = async (interactionResult = null) => {
    if (!activeFloCardExperience || completingFloCard) {
      return;
    }

    const { routine: activeRoutine, step: activeStep } =
      activeFloCardExperience;

    const selectedSupportLevel = supportLevels[activeStep.id] || "independent";

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

        /*
         * Por ahora la FloCard sequence representa
         * todos los pasos activos de esta experiencia.
         */
        const sequenceStepIds = orderedSteps
          .map((step) => step.id)
          .filter(Boolean);

        await onCompleteStepSequence(
          activeRoutine,
          activeStep,
          sequenceStepIds,
          selectedSupportLevel,
          interactionResult,
        );
      } else {
        await onToggleStep(
          activeRoutine,
          activeStep,
          selectedSupportLevel,
          interactionResult,
        );
      }

      setActiveFloCardExperience(null);
      setActiveFloCardStepId(null);
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
      <div className="flex w-full flex-col gap-5">
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
              {formatTime(routine.start_time)} - {formatTime(routine.end_time)}
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
                  backgroundColor: routine.learning_context_color || "#F7F3FF",
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
                  const isChecked = Boolean(step.completed_today);
                  const stepKey = `${routine.id}:${step.id}`;
                  const isUpdating = updatingStepKey === stepKey;
                  const selectedSupportLevel =
                    supportLevels[step.id] || "independent";

                  const handleSupportLevelChange = (event) => {
                    event.stopPropagation();

                    const value = event.target.value;

                    setSupportLevels((current) => ({
                      ...current,
                      [step.id]: value,
                    }));
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
                        if (isUpdating) return;

                        await onToggleStep(routine, step, selectedSupportLevel);

                        if (!isChecked) {
                          setActiveFloCardStepId(null);
                        }
                      }}
                      onKeyDown={async (event) => {
                        if (
                          isUpdating ||
                          (event.key !== "Enter" && event.key !== " ")
                        ) {
                          return;
                        }

                        event.preventDefault();

                        await onToggleStep(routine, step, selectedSupportLevel);

                        if (!isChecked) {
                          setActiveFloCardStepId(null);
                        }
                      }}
                      className={`w-full rounded-3xl border-2 px-4 py-4 text-left transition sm:px-5 ${
                        isChecked
                          ? "border-green-300 bg-green-50 hover:bg-green-100"
                          : "border-[#E4D8FF] bg-[#FAF8FF] hover:border-[#BCA6F0] hover:bg-white"
                      } ${
                        isUpdating ? "cursor-wait opacity-60" : "cursor-pointer"
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

                          {!isChecked && (
                            <div
                              className="mt-4"
                              onClick={(event) => event.stopPropagation()}
                              onKeyDown={(event) => event.stopPropagation()}
                            >
                              <label
                                htmlFor={`support-level-${routine.id}-${step.id}`}
                                className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-[#9B7BE8]"
                              >
                                Nivel de apoyo
                              </label>

                              <select
                                id={`support-level-${routine.id}-${step.id}`}
                                value={selectedSupportLevel}
                                disabled={isUpdating}
                                onChange={handleSupportLevelChange}
                                className="w-full max-w-xs rounded-2xl border-2 border-[#DCCCF8] bg-white px-4 py-3 text-sm font-bold text-[#5F4A8B] outline-none transition focus:border-[#9B7BE8]"
                              >
                                <option value="independent">
                                  🌟 Sin apoyo
                                </option>

                                <option value="verbal">💬 Apoyo verbal</option>

                                <option value="visual">👁️ Apoyo visual</option>

                                <option value="gestural">
                                  👋 Apoyo gestual
                                </option>

                                <option value="physical_partial">
                                  🤝 Apoyo físico parcial
                                </option>

                                <option value="physical_total">
                                  🫶 Apoyo físico total
                                </option>
                              </select>
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
      {activeFloCardExperience && (
        <FloCardExperience
          floCard={activeFloCardExperience.floCard}
          step={activeFloCardExperience.step}
          completing={completingFloCard}
          onClose={handleCloseFloCardExperience}
          onComplete={handleCompleteFloCardExperience}
        />
      )}
    </div>
  );
};

export default RoutineCard;
