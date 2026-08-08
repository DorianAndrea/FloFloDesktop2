import ContextPicker from "../../../components/routines/ContextPicker";
import DroppableFloPanel from "../../../components/design-system/cards/DroppableFloPanel";
import FloCard from "../../../components/design-system/cards/FloCard";

const DAYS = [
  { key: "monday", label: "L" },
  { key: "tuesday", label: "M" },
  { key: "wednesday", label: "M" },
  { key: "thursday", label: "J" },
  { key: "friday", label: "V" },
  { key: "saturday", label: "S" },
  { key: "sunday", label: "D" },
];

const ExperienceBuilder = ({
  draft,
  validation,

  learningContexts = [],
  loadingContexts = false,

  onUpdateDraft,
  onSelectContext,
  onToggleDay,
  onAddStep,
  onUpdateStep,
  onRemoveStep,

  onSave,
  saving = false,
}) => {
  return (
    <section className="rounded-[2.5rem] bg-white p-6 shadow-xl md:p-8">
      <header className="border-b border-[#EEE7FA] pb-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#9B7BE8]">
          Experience Builder
        </p>

        <div className="mt-4 flex items-start gap-4">
          <button
            type="button"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-[#F3ECFF] text-4xl"
            aria-label="Ícono de la experiencia"
          >
            {draft.icon || "✨"}
          </button>

          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={draft.name}
              onChange={(event) =>
                onUpdateDraft({
                  name: event.target.value,
                })
              }
              placeholder="Nombre de la experiencia"
              className="w-full border-none bg-transparent text-3xl font-extrabold text-[#4B367C] outline-none placeholder:text-[#C3B6DF]"
            />

            <textarea
              rows="2"
              value={draft.description}
              onChange={(event) =>
                onUpdateDraft({
                  description: event.target.value,
                })
              }
              placeholder="¿Qué aprenderá o anticipará el niño?"
              className="mt-2 w-full resize-none border-none bg-transparent text-[#756596] outline-none placeholder:text-[#B5A8CF]"
            />
          </div>
        </div>
      </header>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-xl font-extrabold text-[#4B367C]">
            ¿Dónde ocurre?
          </h2>

          <p className="mt-1 text-sm font-semibold text-[#756596]">
            Selecciona o arrastra un contexto.
          </p>

          <div className="mt-5">
            <ContextPicker
              contexts={learningContexts}
              selectedContext={draft.learningContext}
              loading={loadingContexts}
              disabled={saving}
              onSelect={onSelectContext}
            />
          </div>

          <div className="mt-5">
            <DroppableFloPanel
              id="experience-learning-context"
              title="Contexto seleccionado"
              hasContent={Boolean(
                draft.learningContext,
              )}
            >
              {draft.learningContext && (
                <FloCard
                  title={draft.learningContext.name}
                  subtitle={
                    draft.learningContext.description
                  }
                  icon={draft.learningContext.icon}
                  selected
                  compact
                  actionLabel="Quitar"
                  onAction={() =>
                    onSelectContext(null)
                  }
                />
              )}
            </DroppableFloPanel>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#4B367C]">
            ¿Cuándo ocurre?
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-3xl border-2 border-[#E4D8FF] bg-[#FAF8FF] p-5 text-left"
            >
              <span className="text-sm font-bold text-[#8C78B5]">
                Comienza
              </span>

              <input
                type="time"
                value={draft.start_time}
                onChange={(event) =>
                  onUpdateDraft({
                    start_time: event.target.value,
                  })
                }
                className="mt-2 block w-full bg-transparent text-2xl font-extrabold text-[#4B367C] outline-none"
              />
            </button>

            <button
              type="button"
              className="rounded-3xl border-2 border-[#E4D8FF] bg-[#FAF8FF] p-5 text-left"
            >
              <span className="text-sm font-bold text-[#8C78B5]">
                Termina
              </span>

              <input
                type="time"
                value={draft.end_time}
                onChange={(event) =>
                  onUpdateDraft({
                    end_time: event.target.value,
                  })
                }
                className="mt-2 block w-full bg-transparent text-2xl font-extrabold text-[#4B367C] outline-none"
              />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {DAYS.map((day) => {
              const selected =
                draft.days_of_week.includes(day.key);

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() =>
                    onToggleDay(day.key)
                  }
                  className={`aspect-square rounded-2xl border-2 font-extrabold transition ${
                    selected
                      ? "border-[#9B7BE8] bg-[#9B7BE8] text-white"
                      : "border-[#E4D8FF] bg-white text-[#756596]"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#4B367C]">
                Pasos de la experiencia
              </h2>

              <p className="mt-1 text-sm font-semibold text-[#756596]">
                Organiza la secuencia que verá el niño.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAddStep()}
              className="rounded-2xl bg-[#F3ECFF] px-4 py-2 font-extrabold text-[#5F4A8B]"
            >
              + Agregar paso
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {draft.steps.map((step, index) => (
              <article
                key={step.clientId}
                className="flex items-center gap-4 rounded-3xl border-2 border-[#E4D8FF] bg-white p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3ECFF] font-extrabold text-[#5F4A8B]">
                  {index + 1}
                </span>

                <input
                  type="text"
                  value={step.icon}
                  onChange={(event) =>
                    onUpdateStep(step.clientId, {
                      icon: event.target.value,
                    })
                  }
                  className="w-12 bg-transparent text-center text-3xl outline-none"
                  aria-label="Ícono del paso"
                />

                <input
                  type="text"
                  value={step.title}
                  onChange={(event) =>
                    onUpdateStep(step.clientId, {
                      title: event.target.value,
                    })
                  }
                  className="min-w-0 flex-1 bg-transparent font-extrabold text-[#4B367C] outline-none"
                  placeholder="Nombre del paso"
                />

                <button
                  type="button"
                  onClick={() =>
                    onRemoveStep(step.clientId)
                  }
                  className="rounded-xl px-3 py-2 font-bold text-red-500 hover:bg-red-50"
                  aria-label={`Eliminar ${step.title}`}
                >
                  Eliminar
                </button>
              </article>
            ))}

            {draft.steps.length === 0 && (
              <div className="rounded-3xl border-2 border-dashed border-[#DCCCF8] bg-[#FAF8FF] p-8 text-center">
                <p className="text-4xl">🧩</p>

                <p className="mt-3 font-extrabold text-[#4B367C]">
                  Todavía no hay pasos
                </p>

                <p className="mt-1 text-sm font-semibold text-[#756596]">
                  Agrega una FloCard para comenzar la
                  secuencia.
                </p>
              </div>
            )}
          </div>
        </section>

        {!validation.isValid && (
          <div className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5">
            <p className="font-extrabold text-amber-800">
              Antes de guardar:
            </p>

            <div className="mt-2 space-y-1 text-sm font-semibold text-amber-700">
              {Object.values(validation.errors).map(
                (message) => (
                  <p key={message}>• {message}</p>
                ),
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={saving || !validation.isValid}
          onClick={onSave}
          className="w-full rounded-3xl bg-[#9B7BE8] py-4 text-lg font-extrabold text-white transition hover:bg-[#8768D6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Guardando experiencia..."
            : "Crear experiencia"}
        </button>
      </div>
    </section>
  );
};

export default ExperienceBuilder;