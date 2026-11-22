import { useEffect, useState } from "react";

import {
  FaChartPie,
  FaSyncAlt,
  FaUsers,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";

import { useFloFlo } from "../context/FloFloContext";

import {
  getDashboardOverview,
} from "../services/dashboardService";

import DashboardSummary from "../components/dashboard/DashboardSummary";

import ChildDashboardCard from "../components/dashboard/ChildDashboardCard";

const Dashboard = () => {
  const { user } = useFloFlo();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /*
    CARGAR DASHBOARD GENERAL
  */

  const userId = user?.id;
  const userRole = user?.role;

  useEffect(() => {
    let cancelled = false;

    setDashboard(null);
    setError(null);

    if (!userId || userRole !== "parent") {
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadDashboard = async () => {
      try {
        const data = await getDashboardOverview();

        if (cancelled) {
          return;
        }

        if (
          !data?.summary ||
          !Array.isArray(data?.children)
        ) {
          throw new Error(
            "Respuesta del Dashboard inválida",
          );
        }

        setDashboard({
          ownerId: userId,
          data,
        });
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Error cargando Dashboard:",
          err,
        );

        const status = err.response?.status;

        if (status === 403) {
          setError(
            "No tienes permisos para acceder a este panel.",
          );
        } else if (status === 401) {
          setError(
            "Tu sesión no está disponible. Vuelve a iniciar sesión.",
          );
        } else {
          setError(
            "No pudimos cargar el panel. Inténtalo nuevamente.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [userId, userRole, refreshKey]);

  /*
    ACTUALIZAR INFORMACIÓN
  */

  const handleRefresh = () => {
    setRefreshKey((previous) => previous + 1);
  };

  /*
    DATOS VINCULADOS AL USUARIO ACTUAL
  */

  const data =
    dashboard?.ownerId === userId
      ? dashboard?.data
      : null;

  const children = data?.children || [];

  /*
    CONTROL DE ACCESO VISUAL
  */

  if (!userId || userRole !== "parent") {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div
          className="bg-white rounded-3xl
            border border-[#E3D9FF]
            p-8 text-center shadow-sm"
        >
          <FaExclamationCircle
            className="text-4xl text-[#7955B8]
              mx-auto mb-4"
            aria-hidden="true"
          />

          <h1 className="text-2xl font-bold text-[#4B367C]">
            Panel de acompañamiento
          </h1>

          <p className="mt-3 text-[#6B5B92]">
            Este panel está disponible para
            adultos de apoyo autorizados.
          </p>
        </div>
      </main>
    );
  }

  /*
    ESTRUCTURA PRINCIPAL
  */

  return (
    <main
      className="min-h-screen bg-[#F7F3FC]
        px-4 sm:px-6 lg:px-8 py-8"
      aria-busy={loading}
    >
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ENCABEZADO */}

        <header
          className="bg-white rounded-3xl
            border border-[#E3D9FF]
            shadow-sm p-6 sm:p-8"
        >
          <div
            className="flex flex-col sm:flex-row
              items-start sm:items-center
              justify-between gap-5"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 shrink-0
                  rounded-2xl bg-[#E8DDFF]
                  flex items-center justify-center"
              >
                <FaChartPie
                  className="text-3xl text-[#7955B8]"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h1
                  className="text-2xl sm:text-3xl
                    font-bold text-[#4B367C]"
                >
                  Panel de acompañamiento
                </h1>

                <p className="mt-2 text-sm text-[#6B5B92]">
                  Conoce las experiencias y los
                  avances registrados de los
                  niños que acompañas.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2
                bg-[#E8DDFF] hover:bg-[#DCCEF8]
                text-[#6245A0] font-semibold
                rounded-xl px-4 py-3
                transition-colors
                disabled:opacity-50"
            >
              <FaSyncAlt
                className={
                  loading ? "animate-spin" : ""
                }
                aria-hidden="true"
              />

              Actualizar
            </button>
          </div>
        </header>

        {/* ESTADO DE CARGA */}

        {loading && (
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

            <p className="font-semibold text-[#6245A0]">
              Cargando información...
            </p>
          </div>
        )}

        {/* ESTADO DE ERROR */}

        {!loading && error && (
          <div
            role="alert"
            className="bg-[#FFF1F2] border
              border-[#F3CDD2] rounded-3xl
              p-8 text-center"
          >
            <FaExclamationCircle
              className="text-3xl text-[#AD5263]
                mx-auto mb-4"
              aria-hidden="true"
            />

            <p className="font-semibold text-[#963E65]">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-5 rounded-xl
                bg-white px-5 py-3 font-semibold
                text-[#963E65] shadow-sm"
            >
              Volver a intentar
            </button>
          </div>
        )}

        {/* INFORMACIÓN DEL DASHBOARD */}

        {!loading && !error && data && (
          <>
            <DashboardSummary
              summary={data.summary}
            />

            <section
              aria-labelledby="children-dashboard-title"
            >
              <div className="mb-5">
                <h2
                  id="children-dashboard-title"
                  className="text-2xl font-bold
                    text-[#4B367C]"
                >
                  Seguimiento individual
                </h2>

                <p className="mt-1 text-sm text-[#6B5B92]">
                  Consulta la información de cada
                  niño de manera independiente.
                </p>
              </div>

              {children.length === 0 ? (
                <div
                  className="bg-white rounded-3xl
                    border border-[#E3D9FF]
                    p-10 text-center"
                >
                  <FaUsers
                    className="text-4xl text-[#9676D6]
                      mx-auto mb-4"
                    aria-hidden="true"
                  />

                  <h3
                    className="text-lg font-bold
                      text-[#4B367C]"
                  >
                    Sin perfiles infantiles asociados
                  </h3>

                  <p className="mt-2 text-sm text-[#6B5B92]">
                    Aquí aparecerán los niños
                    que estés autorizado a acompañar.
                  </p>
                </div>
              ) : (
                <div
                  className="grid grid-cols-1
                    md:grid-cols-2 xl:grid-cols-3
                    gap-5"
                >
                  {children.map((child) => (
                    <ChildDashboardCard
                      key={child.child_id}
                      child={child}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ACLARACIÓN SOBRE LOS INDICADORES */}

            <footer
              className="bg-[#EDE5FC]
                rounded-2xl p-5"
            >
              <p className="text-sm text-[#6245A0]">
                Los indicadores reflejan registros
                de actividad y aprendizaje.
                No constituyen una evaluación
                diagnóstica ni una comparación
                entre niños.
              </p>
            </footer>
          </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;