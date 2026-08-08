import DraggableFloCard from "../design-system/cards/DraggableFloCard";

const ContextPicker = ({
  contexts = [],
  selectedContext = null,
  loading = false,
  disabled = false,
  onSelect,
}) => {
  if (loading) {
    return (
      <div className="rounded-[2rem] border-2 border-[#E4D8FF] bg-white p-6">
        <p className="font-bold text-[#6B5A95]">
          Cargando contextos...
        </p>
      </div>
    );
  }

  if (!Array.isArray(contexts) || contexts.length === 0) {
    return (
      <div className="rounded-[2rem] border-2 border-dashed border-[#DCCCF8] bg-[#FAF8FF] p-6 text-center">
        <p className="text-lg font-extrabold text-[#4B367C]">
          No hay contextos disponibles
        </p>

        <p className="mt-2 text-sm font-semibold text-[#786A98]">
          Revisa que la API de contextos esté funcionando.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-xl font-extrabold text-[#4B367C]">
          Contextos disponibles
        </h3>

        <p className="mt-1 text-sm font-semibold text-[#756596]">
          Arrastra una FloCard hacia la rutina o tócala para seleccionarla.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contexts.map((context) => {
          const isSelected =
            Number(selectedContext?.id) === Number(context.id);

          return (
            <DraggableFloCard
              key={context.id}
              id={`learning-context-${context.id}`}
              data={{
                type: "learning-context",
                context,
              }}
              title={context.name}
              subtitle={context.description}
              icon={context.icon}
              selected={isSelected}
              disabled={disabled}
              compact
              onClick={() => {
                if (disabled) return;

                if (typeof onSelect === "function") {
                  onSelect(context);
                }
              }}
            />
          );
        })}
      </div>
    </section>
  );
};

export default ContextPicker;