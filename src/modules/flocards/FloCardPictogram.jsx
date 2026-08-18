import { getFloCardAsset } from "./data/floCardAssets";

const FloCardPictogram = ({
  floCard,
  fallbackIcon = "✨",
  compact = false,
  state = "idle",
  onClick,
}) => {
  const hasFloCard = Boolean(floCard?.code);
  if (!hasFloCard) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#F8F5FF] ${
          compact ? "h-11 w-11 text-2xl" : "h-14 w-14 text-3xl"
        }`}
        aria-hidden="true"
      >
        {fallbackIcon || "✨"}
      </div>
    );
  }

  const pictogramAsset = getFloCardAsset(floCard.code);

  const stateClasses = {
    idle:
      "border-[#CDBEF5] bg-white",
    ready:
      "border-[#A78BFA] bg-[#F7F3FF]",
    active:
      "border-[#7C5CE6] bg-[#F3ECFF] ring-4 ring-[#E4D8FF]",
    completed:
      "border-green-400 bg-green-50 opacity-80",
  };

  const currentStateClass =
    stateClasses[state] || stateClasses.idle;

  if (!pictogramAsset) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex shrink-0 items-center justify-center rounded-2xl border-2 transition ${currentStateClass} ${
          compact ? "h-14 w-14 text-3xl" : "h-20 w-20 text-4xl"
        }`}
        title={floCard.name}
      >
        {floCard.icon || fallbackIcon || "✨"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 overflow-hidden rounded-2xl border-2 shadow-sm transition ${currentStateClass} ${
        compact ? "h-14 w-14" : "h-20 w-20"
      }`}
      title={floCard.name}
      aria-label={floCard.name || "FloCard"}
    >
      <img
        src={pictogramAsset}
        alt={floCard.name || "Pictograma FloFlo"}
        className="h-full w-full object-contain p-1"
        draggable={false}
      />

      {state === "active" && (
        <span className="absolute bottom-1 right-1 rounded-full bg-[#7C5CE6] px-1.5 py-0.5 text-[9px] font-black text-white">
          ACTIVO
        </span>
      )}

      {state === "completed" && (
        <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-black text-white">
          ✓
        </span>
      )}
    </button>
  );
};

export default FloCardPictogram;