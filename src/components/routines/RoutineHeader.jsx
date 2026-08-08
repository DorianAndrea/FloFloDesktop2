const RoutineHeader = ({
  isParentMode,
  childName,
  canCreateOrEditRoutines,
  isParent,
  supportModeLabel,
  selectedChild,
}) => {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="mb-3 text-lg font-bold text-[#9B7BE8]">
          Rutinas de FloFlo
        </p>

        <h1 className="text-4xl font-extrabold text-[#4B367C] md:text-6xl">
          {isParentMode ? `Rutinas de ${childName}` : "Organiza tu día"}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-[#6B5A95]">
          {isParentMode
            ? canCreateOrEditRoutines
              ? `Gestiona las rutinas de ${childName} desde tu perfil de apoyo.`
              : `Consulta las rutinas de ${childName} y revisa su avance.`
            : "Crea rutinas por día, marca las actividades realizadas y revisa tu avance diario."}
        </p>
      </div>

      {isParent && (
        <div className="mb-8 rounded-[2rem] border-2 border-[#9ED5B3] bg-[#EAF8EF] p-5 text-center shadow-sm">
          <p className="font-bold text-[#2F6B4F]">
            {supportModeLabel} activo
          </p>

          <p className="mt-1 text-[#2F6B4F]">
            {selectedChild
              ? canCreateOrEditRoutines
                ? `Estás viendo y gestionando rutinas de ${childName}.`
                : `Estás consultando las rutinas de ${childName}.`
              : "No hay un niño/a activo seleccionado."}
          </p>
        </div>
      )}
    </>
  );
};

export default RoutineHeader;
