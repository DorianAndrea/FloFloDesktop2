import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaUser,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";

import { useFloFlo } from "../context/FloFloContext";

import {
  getChildDashboardOverview,
  getChildSupport,
} from "../services/dashboardService";

import SupportChart from "../components/dashboard/SupportChart";
import RoutineAnalytics from "../components/dashboard/RoutineAnalytics";

const formatCount = (value) =>
  Number.isInteger(value) && value >= 0
    ? new Intl.NumberFormat("es-CL").format(value)
    : "—";

const ChildDashboard = () => {
  const { childId } = useParams();
  const { user } = useFloFlo();

  const userId = user?.id;

  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setResult(null);

    if (!userId || !childId) return;

    const loadDashboard = async () => {
      try {
        const [overview, support] = await Promise.all([
          getChildDashboardOverview(childId),
          getChildSupport(childId),
        ]);

        if (cancelled) return;

        if (
          Number(overview?.child_id) !== Number(childId) ||
          Number(support?.child_id) !== Number(childId)
        ) {
          throw new Error("Perfil recibido incorrecto");
        }

        setResult({
          userId,
          childId,
          overview,
          support,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;

        setResult({
          userId,
          childId,
          error:
            error.response?.status === 403
              ? "No tienes permiso para consultar este perfil."
              : "No pudimos cargar el Dashboard individual.",
        });
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [childId, userId]);

  const currentResult =
    result?.childId === childId && result?.userId === userId ? result : null;

  const overview = currentResult?.overview;
  const support = currentResult?.support;

  const childName =
    [overview?.first_name, overview?.last_name].filter(Boolean).join(" ") ||
    "Perfil infantil";

  const indicators = [
    {
      title: "Rutinas activas",
      value: overview?.routines?.active,
      background: "#E8DDFF",
      color: "#6245A0",
    },
    {
      title: "Rutinas realizadas",
      value: overview?.routines?.completed_total,
      background: "#DCECFB",
      color: "#285D91",
    },
    {
      title: "Evidencias cognitivas",
      value: overview?.cognitive?.evidence_count,
      background: "#DDF2E7",
      color: "#28694F",
    },
    {
      title: "Conceptos en seguimiento",
      value: overview?.cognitive?.tracked_concepts,
      background: "#FBEAD8",
      color: "#925B24",
    },
  ];

  return (
    <section
      className="min-h-screen bg-[#F3ECFF]
        px-4 sm:px-6 py-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* VOLVER AL DASHBOARD */}

        <Link
          to="/dashboard"
          className="inline-flex items-center
            gap-2 text-[#7955B8] font-bold
            hover:text-[#6245A0]"
        >
          <FaArrowLeft aria-hidden="true" />
          Volver al Dashboard
        </Link>

        {/* CARGANDO */}

        {!currentResult && (
          <div
            role="status"
            className="bg-white rounded-3xl
              p-12 text-center shadow-sm"
          >
            <FaSpinner
              className="animate-spin text-4xl
                text-[#7955B8] mx-auto mb-4"
              aria-hidden="true"
            />

            <p className="text-[#6B5B92]">Cargando seguimiento individual...</p>
          </div>
        )}

        {/* ERROR */}

        {currentResult?.error && (
          <div
            role="alert"
            className="bg-white rounded-3xl
              p-10 text-center shadow-sm"
          >
            <FaExclamationCircle
              className="text-4xl text-[#925B24]
                mx-auto mb-4"
              aria-hidden="true"
            />

            <p className="text-[#4B367C] font-bold">{currentResult.error}</p>
          </div>
        )}

        {/* DASHBOARD INDIVIDUAL */}

        {overview && support && (
          <>
            {/* PERFIL INFANTIL */}

            <header
              className="bg-white rounded-[2rem]
                p-6 sm:p-8 shadow-sm
                flex items-center gap-5"
            >
              <div
                className="w-20 h-20 rounded-full
                  bg-[#E8DDFF] flex items-center
                  justify-center shrink-0"
              >
                {overview.avatar_url ? (
                  <img
                    src={overview.avatar_url}
                    alt=""
                    className="w-full h-full
                      object-cover rounded-full"
                  />
                ) : (
                  <FaUser
                    className="text-3xl text-[#7955B8]"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="min-w-0">
                <p
                  className="text-sm font-bold
                    text-[#7955B8]"
                >
                  Seguimiento individual
                </p>

                <h1
                  className="text-3xl sm:text-4xl
                    font-extrabold text-[#4B367C]
                    break-words"
                >
                  {childName}
                </h1>

                <p className="text-[#6B5B92] mt-2">
                  Aprendizajes, experiencias y acompañamiento.
                </p>
              </div>
            </header>

            {/* INDICADORES */}

            <div
              className="grid grid-cols-1
                sm:grid-cols-2 xl:grid-cols-4 gap-4"
            >
              {indicators.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl p-6 shadow-sm"
                  style={{
                    backgroundColor: item.background,
                    color: item.color,
                  }}
                >
                  <p className="text-sm font-bold">{item.title}</p>

                  <p
                    className="text-4xl
                      font-extrabold mt-3"
                  >
                    {formatCount(item.value)}
                  </p>
                </article>
              ))}
            </div>

            {/* GRÁFICO DE NIVELES DE APOYO */}

            <RoutineAnalytics
              key={`${userId}:${childId}`}
              childId={childId}
              actorUserId={userId}
            />

            <SupportChart support={support} />
          </>
        )}
      </div>
    </section>
  );
};

export default ChildDashboard;
