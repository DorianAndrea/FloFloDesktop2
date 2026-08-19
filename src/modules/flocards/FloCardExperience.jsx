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

const ChoiceExperience = ({ options = [], helperText, onSelected }) => {
  const [selectedValue, setSelectedValue] = useState(null);

  const handleSelect = (option) => {
    setSelectedValue(option.value);

    if (typeof onSelected === "function") {
      onSelected(option);
    }
  };

  return (
    <>
      <div className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-3">
        {options.map((option) => {
          const pictogramAsset = getFloCardAsset(option.floCardCode);

          const isSelected = selectedValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              aria-pressed={isSelected}
              className={`flex min-h-44 flex-col items-center justify-center rounded-3xl border-2 p-4 transition ${
                isSelected
                  ? "border-[#7C5CE6] bg-[#F3ECFF] ring-4 ring-[#E4D8FF]"
                  : "border-[#E4D8FF] bg-white hover:border-[#BCA6F0] hover:bg-[#FAF8FF]"
              }`}
            >
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-[#F7F3FF]">
                {pictogramAsset ? (
                  <img
                    src={pictogramAsset}
                    alt={option.label}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <span className="text-sm font-bold text-[#9B7BE8]">
                    Sin pictograma
                  </span>
                )}
              </div>

              <span className="mt-3 text-base font-extrabold text-[#4B367C]">
                {option.label}
              </span>

              {isSelected && (
                <span className="mt-2 rounded-full bg-[#7C5CE6] px-3 py-1 text-xs font-black text-white">
                  ✓ Elegido
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-sm font-bold text-[#9B7BE8]">{helperText}</p>
    </>
  );
};

const SequenceExperience = ({
  steps = [],
  helperText,
  onFinished,
  completing = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!Array.isArray(steps) || steps.length === 0) {
    return (
      <p className="mt-8 font-bold text-[#9B7BE8]">No hay pasos disponibles.</p>
    );
  }

  const currentStep = steps[currentStepIndex];

  const pictogramAsset = getFloCardAsset(currentStep.floCardCode);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      if (typeof onFinished === "function") {
        onFinished({
          completed: true,
          totalSteps: steps.length,
        });
      }

      return;
    }

    setCurrentStepIndex((current) => current + 1);
  };

  const handlePrevious = () => {
    if (isFirstStep) {
      return;
    }

    setCurrentStepIndex((current) => current - 1);
  };

  return (
    <>
      <div className="mx-auto mt-6 max-w-md">
        <p className="text-sm font-black uppercase tracking-wide text-[#9B7BE8]">
          Paso {currentStepIndex + 1} de {steps.length}
        </p>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#EEE7FA]">
          <div
            className="h-full rounded-full bg-[#7C5CE6] transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <h3 className="mt-6 text-2xl font-black text-[#4B367C]">
        {currentStep.title}
      </h3>

      {currentStep.instruction && (
        <p className="mx-auto mt-2 max-w-md text-base font-medium text-[#756596]">
          {currentStep.instruction}
        </p>
      )}

      <div className="mx-auto mt-6 flex h-64 w-64 items-center justify-center overflow-hidden rounded-[2rem] bg-[#F7F3FF] p-4">
        {pictogramAsset ? (
          <img
            src={pictogramAsset}
            alt={currentStep.title}
            className="h-full w-full object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-sm font-bold text-red-500">
            FloCard no encontrada
          </span>
        )}
      </div>

      <div className="mx-auto mt-6 flex max-w-md gap-3">
        {!isFirstStep && (
          <button
            type="button"
            onClick={handlePrevious}
            className="flex-1 rounded-2xl bg-[#F3ECFF] px-5 py-3 font-extrabold text-[#5F4A8B] transition hover:bg-[#E8DDFF]"
          >
            ← Anterior
          </button>
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={completing}
          className="rounded-2xl bg-[#7C5CE6] px-6 py-3 font-extrabold text-white transition hover:bg-[#6949D8] disabled:cursor-wait disabled:opacity-60"
        >
          {completing ? "Guardando..." : isLastStep ? "✓ Listo" : "Siguiente →"}
        </button>
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
  onFinished,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || secondsLeft <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [started, secondsLeft]);

  useEffect(() => {
    if (!started || secondsLeft !== 0) {
      return;
    }

    if (typeof onFinished === "function") {
      onFinished();
    }
  }, [started, secondsLeft, onFinished]);

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
  const [interactionCompleted, setInteractionCompleted] = useState(false);
  const [interactionResult, setInteractionResult] = useState(null);

  if (!floCard?.code || !step) {
    return null;
  }

  const pictogramAsset = getFloCardAsset(floCard.code);
  const interaction = getFloCardInteraction(floCard.code);
  const interactionType = interaction?.interactionType || "simple";

  const requiresInteractionCompletion = [
    "timer",
    "choice",
    "sequence",
  ].includes(interactionType);
  const canComplete = !requiresInteractionCompletion || interactionCompleted;

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
            onFinished={() => setInteractionCompleted(true)}
          />
        );

      case "choice":
        return (
          <ChoiceExperience
            options={interaction?.options || []}
            helperText={helperText}
            onSelected={(option) => {
              setInteractionResult({
                value: option.value,
                label: option.label,
                floCardCode: option.floCardCode,
              });

              setInteractionCompleted(true);
            }}
          />
        );
        return (
          <ChoiceExperience
            options={interaction?.options || []}
            helperText={helperText}
            onSelected={(option) => {
              setInteractionResult(option);
              setInteractionCompleted(true);
            }}
          />
        );
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
          <SequenceExperience
            steps={interaction?.steps || []}
            helperText={helperText}
            completing={completing}
            onFinished={(result) => {
              setInteractionResult(result);
              setInteractionCompleted(true);

              if (typeof onComplete === "function") {
                onComplete(result);
              }
            }}
          />
        );
        return (
          <SequenceExperience
            steps={interaction?.steps || []}
            helperText={helperText}
            onFinished={(result) => {
              setInteractionResult(result);
              setInteractionCompleted(true);
            }}
          />
        );
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
  const incompleteButtonLabel =
    interactionType === "choice"
      ? "Elige una FloCard"
      : interactionType === "sequence"
        ? "Completa todos los pasos"
        : "⏳ Espera hasta terminar";

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

          {interactionType !== "sequence" && (
            <button
              type="button"
              disabled={completing || !canComplete}
              onClick={() => onComplete(interactionResult)}
              className="mt-8 w-full rounded-2xl bg-[#7C5CE6] px-6 py-4 text-lg font-black text-white transition hover:bg-[#6949D8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {completing
                ? "Guardando..."
                : !canComplete
                  ? incompleteButtonLabel
                  : `✓ ${completionLabel}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloCardExperience;
