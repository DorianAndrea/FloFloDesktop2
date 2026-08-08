import { forwardRef } from "react";

const FloCard = forwardRef(
  (
    {
      title,
      subtitle = "",
      icon = null,
      imageUrl = null,
      tags = [],
      selected = false,
      disabled = false,
      draggable = false,
      dragging = false,
      compact = false,
      actionLabel = "",
      secondaryActionLabel = "",
      onClick,
      onAction,
      onSecondaryAction,
      dragAttributes = {},
      dragListeners = {},
      style = {},
      className = "",
    },
    ref,
  ) => {
    const handleCardClick = () => {
      if (disabled || typeof onClick !== "function") return;
      onClick();
    };

    const handleAction = (event) => {
      event.stopPropagation();

      if (disabled || typeof onAction !== "function") return;
      onAction();
    };

    const handleSecondaryAction = (event) => {
      event.stopPropagation();

      if (
        disabled ||
        typeof onSecondaryAction !== "function"
      ) {
        return;
      }

      onSecondaryAction();
    };

    return (
      <article
        ref={ref}
        style={style}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-disabled={disabled}
        aria-pressed={selected}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (
            disabled ||
            typeof onClick !== "function"
          ) {
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }}
        {...dragAttributes}
        {...dragListeners}
        className={`
          group relative overflow-hidden rounded-[1.75rem] border-2
          bg-white text-left shadow-sm outline-none
          transition-all duration-300

          ${
            compact
              ? "min-h-[180px] p-4"
              : "min-h-[240px] p-5"
          }

          ${
            selected
              ? "border-[#9B7BE8] ring-4 ring-[#E9E0FF]"
              : "border-[#E4D8FF] hover:border-[#B89EF0]"
          }

          ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : draggable
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-pointer"
          }

          ${
            dragging
              ? "scale-105 rotate-1 opacity-80 shadow-2xl"
              : "hover:-translate-y-1 hover:shadow-xl"
          }

          focus-visible:ring-4 focus-visible:ring-[#E9E0FF]
          ${className}
        `}
      >
        <div
          className={`
            absolute inset-x-0 top-0 h-1.5
            transition-all duration-300
            ${
              selected
                ? "bg-[#9B7BE8]"
                : "bg-gradient-to-r from-[#CDBCF7] via-[#9B7BE8] to-[#8FD6B4]"
            }
          `}
        />

        {selected && (
          <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#9B7BE8] text-sm font-black text-white shadow-md">
            ✓
          </div>
        )}

        <div
          className={`
            flex items-center justify-center rounded-[1.5rem]
            bg-[#F7F3FF] transition duration-300
            group-hover:scale-[1.03]

            ${compact ? "h-24" : "h-32"}
          `}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-contain p-4"
            />
          ) : (
            <span
              aria-hidden="true"
              className={compact ? "text-5xl" : "text-6xl"}
            >
              {icon || "✨"}
            </span>
          )}
        </div>

        <div className="mt-5">
          <h3 className="line-clamp-2 text-lg font-extrabold text-[#4B367C]">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#7A689F]">
              {subtitle}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-bold text-[#6B5A95]"
                >
                  {tag}
                </span>
              ))}

              {tags.length > 3 && (
                <span className="rounded-full bg-[#EDF8F1] px-3 py-1 text-xs font-bold text-[#397158]">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {(actionLabel || secondaryActionLabel) && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-[#EEE7FA] pt-4">
            {actionLabel && (
              <button
                type="button"
                disabled={disabled}
                onClick={handleAction}
                className="flex-1 rounded-2xl bg-[#9B7BE8] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#8768D6] disabled:cursor-not-allowed"
              >
                {actionLabel}
              </button>
            )}

            {secondaryActionLabel && (
              <button
                type="button"
                disabled={disabled}
                onClick={handleSecondaryAction}
                className="rounded-2xl border-2 border-[#DCCCF8] bg-white px-4 py-2.5 text-sm font-extrabold text-[#5F4A8B] transition hover:bg-[#F7F3FF] disabled:cursor-not-allowed"
              >
                {secondaryActionLabel}
              </button>
            )}
          </div>
        )}

        {draggable && (
          <div className="pointer-events-none absolute bottom-3 right-4 text-lg font-black tracking-[-4px] text-[#C7B7EA] opacity-0 transition group-hover:opacity-100">
            ⋮⋮
          </div>
        )}
      </article>
    );
  },
);

FloCard.displayName = "FloCard";

export default FloCard;