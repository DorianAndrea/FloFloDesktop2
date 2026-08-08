const RoutineCard = ({
  routine,
  showCompleteButton = false,
  compact = false,
  updatingStepKey,
  isScheduledToday,
  onToggleStep,
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

  return (
    <div
      className={`rounded-3xl border-2 p-5 transition ${
        routine.completed_today
          ? "border-green-200 bg-green-50"
          : "border-[#DCCCF8] bg-white"
      }`}
    ><div className="flex flex-col gap-4">
      
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold text-[#4B367C]">
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

          <p className="mt-2 text-[#6B5A95]">
            {formatTime(routine.start_time)} - {formatTime(routine.end_time)}
          </p>

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
            <p className="mt-3 text-[#6B5A95]">{routine.description}</p>
          )}

          {Array.isArray(routine.steps) &&
            routine.steps.length > 0 &&
            !compact && (
              <div className="mt-6 w-full">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="mt-4">
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

                    return (
                      <button
                        key={step.id || `${routine.id}-${index}`}
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onToggleStep(routine, step)}
                        aria-pressed={isChecked}
                        className={`grid w-full grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border-2 px-5 py-4 text-left transition ${
                          isChecked
                            ? "border-green-300 bg-green-50 hover:bg-green-100"
                            : "border-[#E4D8FF] bg-[#FAF8FF] hover:border-[#BCA6F0] hover:bg-white"
                        } ${
                          isUpdating
                            ? "cursor-wait opacity-60"
                            : "cursor-pointer"
                        }`}
                      >
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

                        <span
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm"
                          aria-hidden="true"
                        >
                          {step.icon || "✨"}
                        </span>

                        <div className="min-w-0">
                          <p
                            className={`break-words text-base font-extrabold sm:text-lg ${
                              isChecked
                                ? "text-green-700 line-through"
                                : "text-[#4B367C]"
                            }`}
                          >
                            {step.title}
                          </p>

                          {step.description && (
                            <p className="mt-1 hidden text-sm font-medium text-[#756596] sm:block">
                              {step.description}
                            </p>
                          )}

                          {step.is_optional && (
                            <span className="mt-2 inline-flex rounded-full bg-[#EEE7FA] px-3 py-1 text-xs font-extrabold text-[#756596]">
                              Opcional
                            </span>
                          )}
                        </div>

                        {step.estimated_minutes && (
                          <span className="whitespace-nowrap rounded-full bg-white px-3 py-2 text-xs font-extrabold text-[#6B5A95] shadow-sm">
                            {step.estimated_minutes} min
                          </span>
                        )}
                      </button>
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

        <div className="flex w-full flex-wrap gap-2">
          {showCompleteButton && (
            <button
              type="button"
              onClick={() => onComplete(routine)}
              disabled={routine.completed_today}
              className={`rounded-2xl px-4 py-2 font-bold text-white transition ${
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
              className="rounded-2xl bg-[#9B7BE8] px-4 py-2 font-bold text-white transition hover:bg-[#8B6FD6]"
            >
              Editar
            </button>
          )}

          {canDeleteRoutines && (
            <button
              type="button"
              onClick={() => onDelete(routine)}
              className="rounded-2xl bg-red-400 px-4 py-2 font-bold text-white transition hover:bg-red-500"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineCard;
