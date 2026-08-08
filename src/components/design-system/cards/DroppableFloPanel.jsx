import { useDroppable } from "@dnd-kit/core";

const DroppableFloPanel = ({
  id,
  data = {},
  title = "",
  description = "",
  emptyTitle = "Arrastra una FloCard aquí",
  emptyDescription = "También puedes seleccionar una tarjeta con un clic.",
  icon = "✨",
  disabled = false,
  hasContent = false,
  children,
  className = "",
}) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
    data,
    disabled,
  });

  const isDraggingSomething = Boolean(active);

  return (
    <section
      ref={setNodeRef}
      aria-disabled={disabled}
      className={`
        relative overflow-hidden rounded-[2rem] border-2 p-5
        transition-all duration-300

        ${
          disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
            : isOver
              ? "scale-[1.01] border-[#8FD6B4] bg-[#EEFAF3] shadow-xl ring-4 ring-[#DDF5E7]"
              : isDraggingSomething
                ? "border-dashed border-[#B9A4ED] bg-[#FAF8FF]"
                : "border-[#DED2F7] bg-white"
        }

        ${className}
      `}
    >
      <div
        className={`
          pointer-events-none absolute inset-x-0 top-0 h-1.5
          transition-all duration-300

          ${
            isOver
              ? "bg-[#65BD91]"
              : "bg-gradient-to-r from-[#CDBCF7] via-[#9B7BE8] to-[#8FD6B4]"
          }
        `}
      />

      {(title || description) && (
        <header className="mb-5">
          {title && (
            <h3 className="text-xl font-extrabold text-[#4B367C]">
              {title}
            </h3>
          )}

          {description && (
            <p className="mt-1 text-sm font-semibold text-[#756596]">
              {description}
            </p>
          )}
        </header>
      )}

      {hasContent ? (
        <div
          className={`
            rounded-[1.5rem] transition-all duration-300
            ${isOver ? "scale-[1.01]" : ""}
          `}
        >
          {children}
        </div>
      ) : (
        <div
          className={`
            flex min-h-[220px] flex-col items-center justify-center
            rounded-[1.5rem] border-2 border-dashed px-6 py-10
            text-center transition-all duration-300

            ${
              isOver
                ? "border-[#65BD91] bg-white"
                : isDraggingSomething
                  ? "border-[#B9A4ED] bg-white"
                  : "border-[#DCCCF8] bg-[#FAF8FF]"
            }
          `}
        >
          <div
            className={`
              flex h-20 w-20 items-center justify-center rounded-full
              text-4xl shadow-sm transition-all duration-300

              ${
                isOver
                  ? "scale-110 bg-[#DDF5E7]"
                  : "bg-[#F0E9FF]"
              }
            `}
          >
            {isOver ? "📥" : icon}
          </div>

          <h4 className="mt-5 text-lg font-extrabold text-[#4B367C]">
            {isOver ? "Suelta la FloCard aquí" : emptyTitle}
          </h4>

          <p className="mt-2 max-w-sm text-sm font-semibold text-[#786A98]">
            {isOver
              ? "El contexto quedará asociado a esta rutina."
              : emptyDescription}
          </p>
        </div>
      )}

      {isOver && (
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] border-4 border-[#65BD91] opacity-40" />
      )}
    </section>
  );
};

export default DroppableFloPanel;