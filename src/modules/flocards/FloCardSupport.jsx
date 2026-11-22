import { useState } from "react";
import { FaHandsHelping } from "react-icons/fa";

const FloCardSupport = ({
  instruction = "",
  onHelpRequested,
  disabled = false,
}) => {
  const [showSupport, setShowSupport] = useState(false);

  const handleRequestSupport = () => {
    if (disabled) return;

    const opening = !showSupport;

    setShowSupport(opening);

    if (
      opening &&
      typeof onHelpRequested === "function"
    ) {
      onHelpRequested();
    }
  };

  return (
    <div className="mx-auto mt-5 w-full max-w-md">
      <button
        type="button"
        onClick={handleRequestSupport}
        disabled={disabled}
        aria-expanded={showSupport}
        className="flex w-full items-center
          justify-center gap-3 rounded-2xl
          border-2 border-[#E4D8FF]
          bg-[#F7F3FF] px-5 py-3
          font-bold text-[#5F4A8B]
          transition hover:bg-[#EEE5FF]
          disabled:opacity-60"
      >
        <FaHandsHelping aria-hidden="true" />

        {showSupport
          ? "Cerrar apoyo"
          : "Necesito ayuda"}
      </button>

      {showSupport && (
        <div
          className="mt-3 rounded-2xl
            border border-[#E4D8FF]
            bg-[#FCFAFF] p-5 text-left"
        >
          <h4 className="font-extrabold text-[#4B367C]">
            Apoyo para esta acción
          </h4>

          {instruction && (
            <p className="mt-3 font-medium text-[#756596]">
              {instruction}
            </p>
          )}

          <p className="mt-3 text-sm text-[#756596]">
            Puedes revisar la acción nuevamente
            o solicitar apoyo a una persona de confianza.
          </p>
        </div>
      )}
    </div>
  );
};

export default FloCardSupport;