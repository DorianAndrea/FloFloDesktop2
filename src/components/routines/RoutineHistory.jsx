const RoutineHistory = ({
  history,
  isParentMode,
  childName,
  formatTime,
  getFullName,
  getSupportProfileLabel,
}) => {
  return (
    <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-lg md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#4B367C]">Historial reciente</h2>
          <p className="mt-2 text-[#6B5A95]">
            {isParentMode
              ? `Aquí aparecen las rutinas que ${childName} ya realizó.`
              : "Aquí aparecen las rutinas que ya marcaste como realizadas."}
          </p>
        </div>
        <p className="text-sm font-bold text-[#9B7BE8]">
          El historial se mantiene aunque la rutina ya no esté en la lista activa.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-[#DCCCF8] p-6 text-center">
          <p className="font-bold text-[#4B367C]">Aún no hay historial de rutinas.</p>
          <p className="mt-2 text-[#6B5A95]">
            Cuando marques una rutina como realizada, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {history.map((item) => (
            <div
              key={`${item.routine_id}-${item.completion_date}-${item.id}`}
              className="rounded-3xl border-2 border-[#DCCCF8] p-5"
            >
              <p className="text-lg font-extrabold text-[#4B367C]">{item.name}</p>
              <p className="mt-1 text-[#6B5A95]">
                {formatTime(item.start_time)} - {formatTime(item.end_time)}
              </p>
              <p className="mt-2 text-sm font-bold text-green-700">
                Realizada el {new Date(item.completion_date).toLocaleDateString("es-CL")}
              </p>

              {item.completer_first_name ? (
                <div className="mt-3 rounded-xl bg-[#F3ECFF] px-3 py-2">
                  <p className="text-sm font-bold text-[#4B367C]">
                    Marcada como realizada por {getFullName(item.completer_first_name, item.completer_last_name)}
                  </p>
                  <p className="text-sm text-[#6B5A95]">
                    {getSupportProfileLabel(item.completer_relationship_key, item.completer_access_profile)}
                  </p>
                </div>
              ) : (
                <div className="mt-3 rounded-xl bg-[#F7F3FF] px-3 py-2">
                  <p className="text-sm font-bold text-[#4B367C]">Realizada con apoyo del cuidador/a</p>
                  <p className="text-sm text-[#8A7BB0]">Registro anterior</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RoutineHistory;
