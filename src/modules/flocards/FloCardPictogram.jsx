import { getFloCardAsset } from "./data/floCardAssets";

const FloCardPictogram = ({
  floCard,
  fallbackIcon = "✨",
  compact = false,
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

  console.log("🖼️ FLOCARD ASSET:", {
    code: floCard.code,
    pictogramAsset,
  });

  if (!pictogramAsset) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-2xl border-2 border-[#CDBEF5] bg-[#F8F5FF] ${
          compact ? "h-14 w-14 text-3xl" : "h-20 w-20 text-4xl"
        }`}
        title={floCard.name}
      >
        {floCard.icon || fallbackIcon || "✨"}
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-2xl border-2 border-[#CDBEF5] bg-white shadow-sm ${
        compact ? "h-14 w-14" : "h-20 w-20"
      }`}
      title={floCard.name}
    >
      <img
        src={pictogramAsset}
        alt={floCard.name || "Pictograma FloFlo"}
        className="h-full w-full object-contain p-1"
        draggable={false}
      />
    </div>
  );
};

export default FloCardPictogram;