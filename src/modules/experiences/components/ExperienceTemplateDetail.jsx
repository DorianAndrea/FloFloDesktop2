import FavoriteButton from "./FavoriteButton";
import FloCardPictogram from "../../flocards/FloCardPictogram";

const ExperienceTemplateDetail = ({
  template,
  onBack,
  onBackToRoutines,
  onUse,
  onStepClick,
}) => {
  if (!template) return null;

  console.log("EXPERIENCIA RECIBIDA:", template);
  console.log("PASOS RECIBIDOS:", template.steps);

  const steps = Array.isArray(template.steps) ? template.steps : [];

  const formatTime = (value) => (value ? String(value).slice(0, 5) : null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border-2 border-[#DCCCF8] bg-white px-5 py-3 font-extrabold text-[#5F4A8B] transition hover:bg-[#F7F3FF]"
        >
          ← Volver a biblioteca
        </button>

        <button
          type="button"
          onClick={onBackToRoutines}
          className="rounded-2xl bg-[#6F56A6] px-5 py-3 font-extrabold text-white transition hover:bg-[#5F4A8B]"
        >
          ← Volver a rutinas activas
        </button>
      </div>

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
        <div
          className="p-7 md:p-10"
          style={{
            background: template.category_color
              ? `linear-gradient(135deg, ${template.category_color}33, #FFFFFF)`
              : "linear-gradient(135deg, #F3ECFF, #FFFFFF)",
          }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] bg-white text-6xl shadow-md">
              {template.icon || "✨"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {template.category_name && (
                    <span
                      className="rounded-full px-4 py-2 text-sm font-extrabold"
                      style={{
                        backgroundColor: template.category_color || "#EEE7FA",
                      }}
                    >
                      {template.category_icon || "🧩"} {template.category_name}
                    </span>
                  )}
                </div>

                <FavoriteButton
                  templateId={template.id}
                  initialFavorite={template.is_favorite}
                />
              </div>

              <h1 className="mt-4 text-3xl font-black text-[#4B367C] md:text-5xl">
                {template.name}
              </h1>

              {template.description && (
                <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-[#6B5A95] md:text-lg">
                  {template.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {template.estimated_minutes && (
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#5F4A8B] shadow-sm">
                    ⏱ {template.estimated_minutes} min
                  </span>
                )}

                <span className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#5F4A8B] shadow-sm">
                  📋 {steps.length} pasos
                </span>

                {template.learning_context_name && (
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#5F4A8B] shadow-sm">
                    {template.learning_context_icon || "📍"}{" "}
                    {template.learning_context_name}
                  </span>
                )}

                {template.default_start_time && template.default_end_time && (
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#5F4A8B] shadow-sm">
                    🕒 {formatTime(template.default_start_time)} -{" "}
                    {formatTime(template.default_end_time)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-7 md:p-10">
          <div className="rounded-3xl border-2 border-[#E9E0FF] bg-[#FBF9FF] p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#9B7BE8]">
              Qué trabajará esta experiencia
            </p>

            <p className="mt-3 text-lg font-bold leading-relaxed text-[#4B367C]">
              {template.description ||
                "Secuencia visual para anticipar, comprender y realizar esta actividad paso a paso."}
            </p>
          </div>

          <div className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#9B7BE8]">
                  Vista previa
                </p>

                <h2 className="mt-1 text-3xl font-black text-[#4B367C]">
                  Pasos incluidos
                </h2>
              </div>

              <span className="rounded-full bg-[#F3ECFF] px-4 py-2 text-sm font-extrabold text-[#6B5A95]">
                {steps.length} pasos
              </span>
            </div>

            {steps.length === 0 ? (
              <div className="mt-6 rounded-3xl border-2 border-dashed border-[#DCCCF8] p-8 text-center font-semibold text-[#6B5A95]">
                Esta experiencia todavía no tiene pasos configurados.
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id || `${template.id}-${index}`}
                    onClick={() => {
                      console.log("CLICK EN PASO:", step);

                      if (step.flocard && onStepClick) {
                        onStepClick(step.flocard);
                      }
                    }}
                    className="cursor-pointer rounded-3xl border-2 border-[#E8DEFF] bg-white p-4 transition hover:border-[#BFAAF1] hover:shadow-md sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEE7FA] text-lg font-black text-[#5F4A8B]">
                        {step.position || index + 1}
                      </div>

                      <FloCardPictogram
                        floCard={step.flocard}
                        fallbackIcon={step.icon}
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-extrabold leading-snug text-[#4B367C] md:text-lg">
                          {step.title}
                        </h3>

                        {step.description && (
                          <p className="mt-1 break-words text-sm leading-relaxed text-[#756596]">
                            {step.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {step.estimated_minutes && (
                            <span className="rounded-full bg-[#F3ECFF] px-3 py-1.5 text-xs font-extrabold text-[#6B5A95]">
                              {step.estimated_minutes} min
                            </span>
                          )}

                          {step.is_required === false && (
                            <span className="rounded-full bg-[#EEE7FA] px-3 py-1.5 text-xs font-extrabold text-[#756596]">
                              Opcional
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 rounded-[2rem] bg-[#F7F3FF] p-6">
            <p className="font-bold text-[#4B367C]">
              Podrás personalizar horario, días, contexto y pasos antes de
              guardarla.
            </p>

            <button
              type="button"
              onClick={onUse}
              className="mt-5 w-full rounded-3xl bg-[#9B7BE8] py-4 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#8768D6]"
            >
              ✨ Usar esta experiencia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceTemplateDetail;
