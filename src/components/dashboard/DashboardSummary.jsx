import {
  FaUsers,
  FaCalendarAlt,
  FaCalendarCheck,
  FaTasks,
} from "react-icons/fa";

const formatCount = (value) => {
  if (!Number.isInteger(value) || value < 0) {
    return "—";
  }

  return new Intl.NumberFormat("es-CL").format(value);
};

const DashboardSummary = ({ summary }) => {
  const indicators = [
    {
      key: "total_children",
      label: "Niños asociados",
      value: summary?.total_children,
      icon: FaUsers,
      background: "#E8DFFA",
      foreground: "#6245A0",
      description: "Perfiles infantiles autorizados",
    },
    {
      key: "active_routines",
      label: "Rutinas activas",
      value: summary?.active_routines,
      icon: FaCalendarAlt,
      background: "#DCECFB",
      foreground: "#285D91",
      description: "Rutinas actualmente disponibles",
    },
    {
      key: "completed_routines_7d",
      label: "Rutinas completadas",
      value: summary?.completed_routines_7d,
      icon: FaCalendarCheck,
      background: "#DDF2E7",
      foreground: "#28694F",
      description: "Últimos 7 días",
    },
    {
      key: "completed_steps_7d",
      label: "Pasos completados",
      value: summary?.completed_steps_7d,
      icon: FaTasks,
      background: "#FBEAD8",
      foreground: "#925B24",
      description: "Últimos 7 días",
    },
  ];

  return (
    <section aria-labelledby="dashboard-summary-title">
      <div className="mb-5">
        <h2
          id="dashboard-summary-title"
          className="text-2xl font-bold text-[#4B367C]"
        >
          Resumen general
        </h2>

        <p className="mt-1 text-sm text-[#6B5B92]">
          Actividad de los niños que acompañas.
        </p>
      </div>

      <div
        className="grid grid-cols-1
          sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {indicators.map((indicator) => {
          const Icon = indicator.icon;

          return (
            <article
              key={indicator.key}
              className="rounded-3xl p-5 shadow-sm
                flex flex-col gap-3"
              style={{
                backgroundColor:
                  indicator.background,
                color: indicator.foreground,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl
                  bg-white/60 flex items-center
                  justify-center"
              >
                <Icon
                  className="text-2xl"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {indicator.label}
                </p>

                <p className="text-4xl font-bold mt-1">
                  {formatCount(indicator.value)}
                </p>
              </div>

              <p className="text-xs font-medium">
                {indicator.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default DashboardSummary;