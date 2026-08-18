import { useEffect, useState } from "react";
import { getFloCardAsset } from "./data/floCardAssets";
import { getFloCardInteraction } from "./data/floCardInteractions";

const AnimationExperience = ({ pictogramAsset, floCard, step, helperText }) => {
  return (
    <>
      <div className="mx-auto mt-8 flex h-64 w-64 items-center justify-center overflow-hidden rounded-[2rem] bg-[#F7F3FF] p-4">
        {pictogramAsset ? (
          <img
            src={pictogramAsset}
            alt={floCard.name || step.title}
            className="h-full w-full object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-8xl">{floCard.icon || step.icon || "✨"}</span>
        )}
      </div>

      <p className="mt-6 text-sm font-bold text-[#9B7BE8]">{helperText}</p>
    </>
  );
};

const SimpleExperience = ({ pictogramAsset, floCard, step, helperText }) => {
  return (
    <>
      <div className="mx-auto mt-8 flex h-56 w-56 items-center justify-center overflow-hidden rounded-[2rem] bg-[#F7F3FF] p-4">
        {pictogramAsset ? (
          <img
            src={pictogramAsset}
            alt={floCard.name || step.title}
            className="h-full w-full object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-8xl">{floCard.icon || step.icon || "✨"}</span>
        )}
      </div>

      <p className="mt-6 text-sm font-bold text-[#9B7BE8]">{helperText}</p>
    </>
  );
};

const TimerExperience = ({
  pictogramAsset,
  floCard,
  step,
  helperText,
  durationSeconds = 30,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || secondsLeft <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [started, secondsLeft]);

  const progress =
    durationSeconds <= 0
      ? 100
      : ((durationSeconds - secondsLeft) / durationSeconds) * 100;

  return (
    <>
      <div className="mx-auto mt-8 flex h-52 w-52 items-center justify-center overflow-hidden rounded-[2rem] bg-[#F7F3FF] p-4">
        {pictogramAsset ? (
          <img
            src={pictogramAsset}
            alt={floCard.name || step.title}
            className="h-full w-full object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-8xl">{floCard.icon || step.icon || "⏳"}</span>
        )}
      </div>

      <div className="mx-auto mt-6 max-w-sm">
        <p className="text-5xl font-black text-[#4B367C]">{secondsLeft}</p>

        <p className="mt-1 text-sm font-bold text-[#9B7BE8]">segundos</p>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#EEE7FA]">
          <div
            className="h-full rounded-full bg-[#7C5CE6] transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
            }}
          />
        </div>

        {secondsLeft > 0 ? (
          <button
            type="button"
            onClick={() => setStarted(true)}
            disabled={started}
            className="mt-5 rounded-2xl bg-[#F3ECFF] px-6 py-3 font-extrabold text-[#5F4A8B] transition hover:bg-[#E8DDFF] disabled:cursor-default disabled:opacity-70"
          >
            {started ? "⏳ Esperando..." : "▶ Comenzar"}
          </button>
        ) : (
          <div className="mt-5 rounded-2xl bg-green-50 px-5 py-3 font-extrabold text-green-700">
            ✓ ¡Terminaste la espera!
          </div>
        )}
      </div>

      <p className="mt-6 text-sm font-bold text-[#9B7BE8]">{helperText}</p>
    </>
  );
};

const FloCardExperience = ({
  floCard,
  step,
  onClose,
  onComplete,
  completing = false,
}) => {
  if (!floCard?.code || !step) {
    return null;
  }

  const pictogramAsset = getFloCardAsset(floCard.code);
  const interaction = getFloCardInteraction(floCard.code);

  const interactionType = interaction?.interactionType || "simple";

  const experienceTitle = interaction?.title || step.title || floCard.name;

  const instruction = interaction?.instruction || step.description || "";

  const helperText = interaction?.helperText || "Sigue el pictograma.";

  const completionLabel = interaction?.completionLabel || "Listo";

  const renderInteraction = () => {
    switch (interactionType) {
      case "animation":
        return (
          <AnimationExperience
            pictogramAsset={pictogramAsset}
            floCard={floCard}
            step={step}
            helperText={helperText}
          />
        );

      case "timer":
        return (
          <TimerExperience
            pictogramAsset={pictogramAsset}
            floCard={floCard}
            step={step}
            helperText={helperText}
            durationSeconds={interaction?.durationSeconds || 30}
          />
        );

      case "choice":
        return (
          <SimpleExperience
            pictogramAsset={pictogramAsset}
            floCard={floCard}
            step={step}
            helperText="Selección interactiva próximamente."
          />
        );

      case "sequence":
        return (
          <SimpleExperience
            pictogramAsset={pictogramAsset}
            floCard={floCard}
            step={step}
            helperText="Secuencia interactiva próximamente."
          />
        );

      default:
        return (
          <SimpleExperience
            pictogramAsset={pictogramAsset}
            floCard={floCard}
            step={step}
            helperText={helperText}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F3ECFF] text-xl font-black text-[#5F4A8B]"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-wide text-[#9B7BE8]">
            FloCard
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#4B367C]">
            {experienceTitle}
          </h2>

          {instruction && (
            <p className="mx-auto mt-3 max-w-md text-lg font-medium text-[#756596]">
              {instruction}
            </p>
          )}

          {renderInteraction()}

          <button
            type="button"
            disabled={completing}
            onClick={onComplete}
            className="mt-8 w-full rounded-2xl bg-[#7C5CE6] px-6 py-4 text-lg font-black text-white transition hover:bg-[#6949D8] disabled:cursor-wait disabled:opacity-60"
          >
            {completing ? "Guardando..." : `✓ ${completionLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloCardExperience;
