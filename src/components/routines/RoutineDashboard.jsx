const RoutineDashboard = ({
  todayCount,
  pendingCount,
  completedCount,
  dayLabel,
}) => {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      <div className="rounded-[2rem] bg-white p-6 shadow-lg">
        <p className="text-sm font-bold uppercase tracking-wide text-[#9B7BE8]">Hoy</p>
        <p className="mt-2 text-4xl font-extrabold text-[#4B367C]">{todayCount}</p>
        <p className="mt-1 text-[#6B5A95]">rutinas para {dayLabel}</p>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-lg">
        <p className="text-sm font-bold uppercase tracking-wide text-yellow-600">Pendientes</p>
        <p className="mt-2 text-4xl font-extrabold text-[#4B367C]">{pendingCount}</p>
        <p className="mt-1 text-[#6B5A95]">por completar hoy</p>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-lg">
        <p className="text-sm font-bold uppercase tracking-wide text-green-600">Completadas</p>
        <p className="mt-2 text-4xl font-extrabold text-[#4B367C]">{completedCount}</p>
        <p className="mt-1 text-[#6B5A95]">realizadas hoy</p>
      </div>
    </div>
  );
};

export default RoutineDashboard;
