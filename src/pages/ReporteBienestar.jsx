
import { Link } from "react-router-dom";

import { useSelectedChild } from "../context/SelectedChildContext";

import MiBienestar from "../components/dashboard/MiBienestar";

const ReporteBienestar = () => {
  const {
    selectedChildId,
    loadingChildren,
  } = useSelectedChild();

  if (loadingChildren) {
    return (
      <main
        className="min-h-screen bg-[#F3ECFF]
          flex items-center justify-center"
      >
        <p className="text-[#4B367C] font-semibold">
          Cargando perfil infantil...
        </p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#F3ECFF]
        px-4 sm:px-6 py-8"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* VOLVER AL INICIO */}

        <Link
          to="/"
          className="inline-flex items-center
            text-[#7955B8] font-semibold
            hover:text-[#6245A0]"
        >
          ← Volver al inicio
        </Link>

        {/* TÍTULO */}

        <header>
          <h1
            className="text-3xl font-bold
              text-[#4B367C]"
          >
            Reporte de bienestar emocional
          </h1>

          <p
            className="mt-2 text-[#6B5B92]"
          >
            Consulta los registros emocionales
            del niño/a que acompañas.
          </p>
        </header>

        {/* CONTENIDO */}

        {!selectedChildId ? (
          <div
            className="bg-white rounded-2xl
              p-6 shadow-sm
              border border-[#E3D9FF]"
          >
            <p className="text-[#6B5B92]">
              Selecciona un niño/a para consultar
              su bienestar emocional.
            </p>
          </div>
        ) : (
          <MiBienestar
            key={selectedChildId}
            childId={selectedChildId}
          />
        )}
      </div>
    </main>
  );
};

export default ReporteBienestar;
