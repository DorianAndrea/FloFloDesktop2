import { useEffect, useState } from "react";

import {
  FaInfoCircle,
  FaSyncAlt,
  FaCalendarAlt,
} from "react-icons/fa";

import {
  getChildRoutineAnalytics,
} from "../../services/dashboardService";

import RoutineExperienceChart from "./RoutineExperienceChart";

const RoutineAnalytics = ({ childId, actorUserId }) => {
  const [result, setResult] = useState(null);

  const [selectedGroupKey, setSelectedGroupKey] =
    useState(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    setResult(null);
    setSelectedGroupKey(null);

    if (!childId || !actorUserId) return;

    const loadAnalytics = async () => {
      try {
        const data =
          await getChildRoutineAnalytics(childId);

        if (cancelled) return;

        if (
          Number(data?.child_id) !== Number(childId) ||
          !Array.isArray(data?.routines)
        ) {
          throw new Error(
            "Respuesta de rutinas incorrecta"
          );
        }

        setResult({
          childId,
          actorUserId,
          refreshKey,
          data,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;

        setResult({
          childId,
          actorUserId,
          refreshKey,
          data: null,

          error:
            error.response?.status === 403
              ? "No tienes permiso para consultar estas rutinas."
              : "No pudimos cargar el análisis de rutinas.",
        });
      }
    };

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [childId, actorUserId, refreshKey]);

  /*
   * Evitar mostrar datos de otro niño
   * al cambiar de perfil o sesión.
   */

  const currentResult =
    result?.childId === childId &&
    result?.actorUserId === actorUserId &&
    result?.refreshKey === refreshKey
      ? result
      : null;

  const analytics = currentResult?.data;

  const routines = analytics?.routines || [];

  /*
   * Recuperar todas las implementaciones
   * históricas de la experiencia seleccionada.
   */

  const selectedRoutines = routines.filter(
    (routine) =>
      routine.experience_group_key ===
      selectedGroupKey
  );

  const formatTime = (time) =>
    typeof time === "string"
      ? time.slice(0, 5)
      : "Sin horario";

  if (!currentResult) {
    return (
      <div
        className="bg-white rounded-3xl
          border border-[#E3D9FF]
          p-8 text-center"
      >
        <FaSyncAlt
          className="animate-spin text-2xl
            text-[#7955B8] mx-auto mb-3"
        />

        <p className="text-[#6B5B92]">
          Cargando análisis de rutinas...
        </p>
      </div>
    );
  }

  if (currentResult.error) {
    return (
      <div
        className="bg-white rounded-3xl
          border border-[#E3D9FF]
          p-8 text-center"
      >
        <FaInfoCircle
          className="text-2xl text-[#9676D6]
            mx-auto mb-3"
        />

        <p className="text-[#4B367C]">
          {currentResult.error}
        </p>

        <button
          type="button"
          onClick={() =>
            setRefreshKey((value) => value + 1)
          }
          className="mt-4 px-5 py-2
            rounded-xl bg-[#E8DDFF]
            text-[#7955B8] font-semibold"
        >
          Volver a intentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* GRÁFICO PRINCIPAL */}

      <RoutineExperienceChart
        routines={routines}
        selectedGroupKey={selectedGroupKey}
        onSelectExperience={setSelectedGroupKey}
      />

      {/* EXPERIENCIA SELECCIONADA */}

      {selectedRoutines.length > 0 && (
        <section
          className="bg-white rounded-3xl
            border border-[#E3D9FF]
            shadow-sm p-5 sm:p-7 space-y-5"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl
                bg-[#DDF2E7] flex items-center
                justify-center shrink-0"
            >
              <FaCalendarAlt
                className="text-2xl text-[#28694F]"
              />
            </div>

            <div>
              <h2
                className="text-2xl font-bold
                  text-[#4B367C]"
              >
                {selectedRoutines[0].routine_name}
              </h2>

              <p className="text-sm text-[#6B5B92]">
                Historial completo de implementaciones
                de esta experiencia, independientemente
                del filtro del gráfico superior.
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-1
              md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {selectedRoutines.map((routine) => (
              <div
                key={routine.routine_id}
                className="rounded-2xl
                  bg-[#F7F3FC]
                  border border-[#E3D9FF]
                  p-4 space-y-3"
              >
                <div
                  className="flex items-center
                    justify-between gap-2"
                >
                  <p
                    className="font-bold
                      text-[#4B367C]"
                  >
                    {formatTime(routine.start_time)}
                    {" – "}
                    {formatTime(routine.end_time)}
                  </p>

                  <span
                    className={`text-xs px-3 py-1
                      rounded-full font-medium ${
                        routine.is_active
                          ? "bg-[#DDF2E7] text-[#28694F]"
                          : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {routine.is_active
                      ? "Activa"
                      : "Inactiva"}
                  </span>
                </div>

                <p className="text-xs text-[#79699B]">
                  Implementación #{routine.routine_id}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p
                      className="text-xl font-bold
                        text-[#4B367C]"
                    >
                      {routine.completed_total}
                    </p>

                    <p className="text-xs text-[#6B5B92]">
                      Realizaciones completas
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-xl font-bold
                        text-[#4B367C]"
                    >
                      {routine.total_completed_steps}
                    </p>

                    <p className="text-xs text-[#6B5B92]">
                      Acciones completadas
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-xl font-bold
                        text-[#28694F]"
                    >
                      {routine.support_distribution
                        ?.independent ?? 0}
                    </p>

                    <p className="text-xs text-[#6B5B92]">
                      Registros independientes
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-xl font-bold
                        text-[#7955B8]"
                    >
                      {routine.configured_steps}
                    </p>

                    <p className="text-xs text-[#6B5B92]">
                      Acciones configuradas
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default RoutineAnalytics;