import { Link } from "react-router-dom";

import {
  FaUser,
  FaCalendarAlt,
  FaCalendarCheck,
  FaBrain,
  FaBookOpen,
  FaArrowRight,
  FaInfoCircle,
} from "react-icons/fa";

const formatCount = (value) => {
  if (!Number.isInteger(value) || value < 0) {
    return "—";
  }

  return new Intl.NumberFormat("es-CL").format(value);
};

const ChildDashboardCard = ({ child }) => {
  if (!child) {
    return null;
  }

  const childId = child.child_id;

  const childName =
    [
      child.first_name,
      child.last_name,
    ]
      .filter(Boolean)
      .join(" ") || `Perfil infantil ${childId}`;

  const evidenceCount =
    child.cognitive?.evidence_count;

  const indicators = [
    {
      key: "active_routines",
      label: "Rutinas activas",
      value: child.routines?.active,
      icon: FaCalendarAlt,
      background: "#EDE5FC",
      foreground: "#6245A0",
    },
    {
      key: "completed_routines",
      label: "Rutinas realizadas",
      value: child.routines?.completed_total,
      icon: FaCalendarCheck,
      background: "#DCECFB",
      foreground: "#285D91",
    },
    {
      key: "cognitive_evidence",
      label: "Evidencias cognitivas",
      value: evidenceCount,
      icon: FaBrain,
      background: "#DDF2E7",
      foreground: "#28694F",
    },
    {
      key: "tracked_concepts",
      label: "Conceptos registrados",
      value: child.cognitive?.tracked_concepts,
      icon: FaBookOpen,
      background: "#FBEAD8",
      foreground: "#925B24",
    },
  ];

  return (
    <article
      className="bg-white rounded-3xl
        border border-[#E3D9FF]
        shadow-sm p-6 flex flex-col gap-5"
    >
      {/* IDENTIFICACIÓN DEL NIÑO/A */}

      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 shrink-0
            rounded-full bg-[#E8DDFF]
            flex items-center justify-center"
        >
          {child.avatar_url ? (
            <img
              src={child.avatar_url}
              alt=""
              className="w-full h-full
                rounded-full object-cover"
            />
          ) : (
            <FaUser
              className="text-2xl text-[#7955B8]"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="min-w-0">
          <h3
            className="text-xl font-bold
              text-[#4B367C] break-words"
          >
            {childName}
          </h3>

          <p className="text-sm text-[#79699B]">
            Seguimiento individual
          </p>
        </div>
      </div>

      <div className="border-t border-[#E8E1F4]" />

      {/* INDICADORES INDIVIDUALES */}

      <div className="grid grid-cols-2 gap-3">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;

          return (
            <div
              key={indicator.key}
              className="rounded-2xl p-4
                flex flex-col gap-2"
              style={{
                backgroundColor:
                  indicator.background,
                color: indicator.foreground,
              }}
            >
              <Icon
                className="text-xl"
                aria-hidden="true"
              />

              <p className="text-3xl font-bold">
                {formatCount(indicator.value)}
              </p>

              <p className="text-xs font-semibold">
                {indicator.label}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#79699B]">
        Las rutinas realizadas corresponden
        al historial registrado.
      </p>

      {/* DISPONIBILIDAD DE EVIDENCIA */}

      <div
        className="bg-[#F7F3FC] rounded-xl
          p-3 flex items-start gap-2"
      >
        <FaInfoCircle
          className="text-[#7955B8]
            shrink-0 mt-0.5"
          aria-hidden="true"
        />

        <p className="text-xs text-[#6B5B92]">
          {evidenceCount === 0
            ? "Sin evidencia cognitiva registrada."
            : Number.isInteger(evidenceCount) &&
                evidenceCount > 0
              ? "Cuenta con evidencias cognitivas registradas."
              : "Información cognitiva no disponible."}
        </p>
      </div>

      {/* ACCESO AL DASHBOARD INDIVIDUAL */}

      <Link
        to={`/dashboard/children/${childId}`}
        aria-label={`Ver seguimiento de ${childName}`}
        className="mt-auto bg-[#7955B8]
          hover:bg-[#6945A5]
          text-white font-semibold
          rounded-xl px-4 py-3
          flex items-center justify-center
          gap-3 transition-colors"
      >
        Ver seguimiento individual

        <FaArrowRight aria-hidden="true" />
      </Link>
    </article>
  );
};

export default ChildDashboardCard;