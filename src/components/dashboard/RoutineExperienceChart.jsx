import { useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  FaChartBar,
  FaInfoCircle,
} from "react-icons/fa";

const SUPPORT_LEVELS = [
  {
    key: "independent",
    name: "Independiente",
    color: "#89CCAF",
  },
  {
    key: "verbal",
    name: "Apoyo verbal",
    color: "#AC96E0",
  },
  {
    key: "visual",
    name: "Apoyo visual",
    color: "#86B9E5",
  },
  {
    key: "gestural",
    name: "Apoyo gestual",
    color: "#F3CD83",
  },
  {
    key: "physical_partial",
    name: "Apoyo físico parcial",
    color: "#E9AC91",
  },
  {
    key: "physical_total",
    name: "Apoyo físico total",
    color: "#CF9CB8",
  },
];

const CHART_LEVELS = [
  ...SUPPORT_LEVELS,
  {
    key: "unspecified",
    name: "Apoyo no informado",
    color: "#C8D8CC",
  },
  {
    key: "unknown",
    name: "Apoyo no reconocido",
    color: "#9CA3AF",
  },
];

const formatCount = (value) =>
  new Intl.NumberFormat("es-CL").format(value ?? 0);

const formatPercentage = (value) =>
  value === null
    ? "Sin datos"
    : `${new Intl.NumberFormat("es-CL", {
        maximumFractionDigits: 1,
      }).format(value)}%`;

/*
 * AGRUPACIÓN DE EXPERIENCIAS
 *
 * Las rutinas con plantilla se consolidan
 * utilizando experience_group_key.
 *
 * Las rutinas sin plantilla mantienen
 * su identidad individual.
 */

const groupExperiences = (routines) => {
  const groups = new Map();

  for (const routine of routines) {
    const key =
      routine.experience_group_key ||
      `routine:${routine.routine_id}`;

    if (!groups.has(key)) {
      groups.set(key, {
        group_key: key,
        name: routine.routine_name,

        template_id:
          routine.experience_template_id ?? null,

        implementations: 0,
        active_implementations: 0,
        completed_routines: 0,

        total_records: 0,
        documented_records: 0,

        ...Object.fromEntries(
          CHART_LEVELS.map((level) => [
            level.key,
            0,
          ])
        ),

        routines: [],
      });
    }

    const group = groups.get(key);

    group.implementations += 1;

    if (routine.is_active) {
      group.active_implementations += 1;
    }

    group.completed_routines += Number(
      routine.completed_total || 0
    );

    group.total_records += Number(
      routine.total_completed_steps || 0
    );

    group.documented_records += Number(
      routine.documented_support_steps || 0
    );

    for (const level of SUPPORT_LEVELS) {
      group[level.key] += Number(
        routine.support_distribution?.[
          level.key
        ] || 0
      );
    }

    group.unspecified += Number(
      routine.unspecified_support_steps || 0
    );

    group.unknown += Number(
      routine.unknown_support_steps || 0
    );

    group.routines.push(routine);
  }

  const experiences = Array.from(
    groups.values()
  ).map((group) => ({
    ...group,

    supported_records:
      group.documented_records -
      group.independent,

    independent_percentage:
      group.documented_records > 0
        ? (
            group.independent /
            group.documented_records
          ) * 100
        : null,
  }));

  /*
   * Diferenciar visualmente experiencias
   * que comparten nombre, pero no identidad.
   */

  const nameCounts = new Map();

  for (const experience of experiences) {
    nameCounts.set(
      experience.name,
      (nameCounts.get(experience.name) || 0) + 1
    );
  }

  return experiences.map((experience) => ({
    ...experience,

    chart_label:
      nameCounts.get(experience.name) > 1
        ? experience.template_id
          ? `${experience.name} · Plantilla`
          : `${experience.name} · #${experience.routines[0].routine_id}`
        : experience.name,
  }));
};

/*
 * TOOLTIP DETALLADO
 */

const ExperienceTooltip = ({
  active,
  payload,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  if (!item) return null;

  return (
    <div
      className="bg-white border
        border-[#E3D9FF] rounded-2xl
        shadow-xl p-4 w-[300px]
        max-w-[80vw] whitespace-normal"
    >
      <h3
        className="text-base font-bold
          text-[#4B367C]"
      >
        {item.chart_label}
      </h3>

      <div
        className="grid grid-cols-2 gap-3
          mt-3 text-sm text-[#6B5B92]"
      >
        <div>
          <p>Implementaciones</p>

          <p className="font-bold text-xl">
            {formatCount(item.implementations)}
          </p>
        </div>

        <div>
          <p>Rutinas completadas</p>

          <p className="font-bold text-xl">
            {formatCount(item.completed_routines)}
          </p>
        </div>
      </div>

      <div
        className="border-t border-[#E3D9FF]
          my-3"
      />

      <p
        className="text-sm font-semibold
          text-[#4B367C] mb-3"
      >
        {formatCount(item.total_records)} registros
        de acciones completadas
      </p>

      <div className="space-y-2">
        {CHART_LEVELS.map((level) => (
          <div
            key={level.key}
            className="flex items-center
              justify-between gap-3"
          >
            <div
              className="flex items-center
                gap-2"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: level.color,
                }}
              />

              <span
                className="text-xs
                  text-[#6B5B92]"
              >
                {level.name}
              </span>
            </div>

            <span
              className="text-sm font-bold
                text-[#4B367C]"
            >
              {formatCount(item[level.key])}
            </span>
          </div>
        ))}
      </div>

      <div
        className="bg-[#DDF2E7]
          rounded-xl p-3 mt-4"
      >
        <p
          className="text-xl font-bold
            text-[#28694F]"
        >
          {formatPercentage(
            item.independent_percentage
          )}
        </p>

        <p className="text-xs text-[#28694F]">
          Registros independientes entre aquellos
          con nivel de apoyo reconocido.
        </p>
      </div>

      <p
        className="text-xs text-[#79699B]
          mt-3"
      >
        Fuente: Rutinas de FloFlo.
      </p>

      <p
        className="text-xs text-[#79699B]
          mt-1"
      >
        Período: historial completo de las
        implementaciones incluidas.
      </p>
    </div>
  );
};

/*
 * COMPONENTE PRINCIPAL
 */

const RoutineExperienceChart = ({
  routines = [],
  selectedGroupKey,
  onSelectExperience,
}) => {
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [recordFilter, setRecordFilter] =
    useState("all");

  const [visibleCount, setVisibleCount] =
    useState(10);

  const filteredRoutines = useMemo(() => {
    return routines.filter((routine) => {
      if (statusFilter === "active") {
        return routine.is_active === true;
      }

      if (statusFilter === "inactive") {
        return routine.is_active === false;
      }

      return true;
    });
  }, [routines, statusFilter]);

  const experiences = useMemo(() => {
    return groupExperiences(
      filteredRoutines
    );
  }, [filteredRoutines]);

  const filteredExperiences = useMemo(() => {
    return experiences
      .filter((experience) => {
        if (recordFilter === "supported") {
          return experience.supported_records > 0;
        }

        if (recordFilter === "with_records") {
          return experience.total_records > 0;
        }

        if (recordFilter === "without_records") {
          return experience.total_records === 0;
        }

        return true;
      })
      .sort(
        (a, b) =>
          b.total_records - a.total_records ||
          a.name.localeCompare(b.name, "es")
      );
  }, [experiences, recordFilter]);

  const chartExperiences =
    filteredExperiences.filter(
      (experience) =>
        experience.total_records > 0
    );

  const chartData = chartExperiences.slice(
    0,
    visibleCount
  );

  const summary = experiences.reduce(
    (total, experience) => ({
      implementations:
        total.implementations +
        experience.implementations,

      records:
        total.records +
        experience.total_records,

      completed:
        total.completed +
        experience.completed_routines,

      supported:
        total.supported +
        experience.supported_records,
    }),
    {
      implementations: 0,
      records: 0,
      completed: 0,
      supported: 0,
    }
  );

  const handleSelection = (experience) => {
    onSelectExperience?.(
      experience.group_key
    );
  };

  return (
    <section
      className="bg-white rounded-3xl
        border border-[#E3D9FF]
        shadow-sm p-5 sm:p-7 space-y-6"
    >
      {/* ENCABEZADO */}

      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 bg-[#E8DDFF]
            rounded-2xl flex items-center
            justify-center shrink-0"
        >
          <FaChartBar
            className="text-2xl text-[#7955B8]"
          />
        </div>

        <div>
          <h2
            className="text-2xl font-bold
              text-[#4B367C]"
          >
            Experiencias implementadas
          </h2>

          <p className="text-sm text-[#6B5B92]">
            Identifica las rutinas realizadas
            y los apoyos utilizados en sus
            diferentes acciones.
          </p>
        </div>
      </div>

      {/* FILTROS */}

      <div
        className="grid grid-cols-1
          sm:grid-cols-3 gap-3"
      >
        <div>
          <label
            className="block text-sm
              font-medium text-[#4B367C] mb-2"
          >
            Estado de las rutinas
          </label>

          <select
            aria-label="Estado de las rutinas"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="w-full rounded-xl
              border border-[#E3D9FF]
              bg-[#F7F3FC] p-3
              text-sm text-[#4B367C]"
          >
            <option value="all">
              Historial completo
            </option>

            <option value="active">
              Rutinas activas
            </option>

            <option value="inactive">
              Rutinas inactivas
            </option>
          </select>
        </div>

        <div>
          <label
            className="block text-sm
              font-medium text-[#4B367C] mb-2"
          >
            Registros de acciones
          </label>

          <select
            aria-label="Registros de acciones"
            value={recordFilter}
            onChange={(event) =>
              setRecordFilter(event.target.value)
            }
            className="w-full rounded-xl
              border border-[#E3D9FF]
              bg-[#F7F3FC] p-3
              text-sm text-[#4B367C]"
          >
            <option value="all">
              Todas las experiencias
            </option>

            <option value="with_records">
              Con acciones registradas
            </option>

            <option value="supported">
              Con niveles de apoyo
            </option>

            <option value="without_records">
              Sin acciones registradas
            </option>
          </select>
        </div>

        <div>
          <label
            className="block text-sm
              font-medium text-[#4B367C] mb-2"
          >
            Cantidad de barras
          </label>

          <select
            aria-label="Cantidad de barras"
            value={visibleCount}
            onChange={(event) =>
              setVisibleCount(
                Number(event.target.value)
              )
            }
            className="w-full rounded-xl
              border border-[#E3D9FF]
              bg-[#F7F3FC] p-3
              text-sm text-[#4B367C]"
          >
            <option value={10}>10</option>

            <option value={20}>20</option>

            <option value={10000}>Todas</option>
          </select>
        </div>
      </div>

      {/* INDICADORES */}

      <div
        className="grid grid-cols-2
          xl:grid-cols-5 gap-3"
      >
        {[
          {
            label: "Experiencias agrupadas",
            value: experiences.length,
            color: "#E8DDFF",
            text: "#6245A0",
          },
          {
            label: "Rutinas implementadas",
            value: summary.implementations,
            color: "#DCECFB",
            text: "#285D91",
          },
          {
            label: "Rutinas completadas",
            value: summary.completed,
            color: "#DDF2E7",
            text: "#28694F",
          },
          {
            label: "Acciones completadas",
            value: summary.records,
            color: "#F7F3FC",
            text: "#6245A0",
          },
          {
            label: "Acciones con apoyo registrado",
            value: summary.supported,
            color: "#FBEAD8",
            text: "#925B24",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl p-4"
            style={{
              backgroundColor: item.color,
              color: item.text,
            }}
          >
            <p className="text-3xl font-bold">
              {formatCount(item.value)}
            </p>

            <p className="text-xs font-semibold mt-2">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#79699B]">
        Los indicadores superiores corresponden
        al filtro de estado de las rutinas.
      </p>

      {/* GRÁFICO COMPARATIVO */}

      <div>
        <h3
          className="text-lg font-bold
            text-[#4B367C]"
        >
          Acciones completadas por experiencia
        </h3>

        <p className="text-sm text-[#6B5B92] mt-1">
          Cada barra muestra cuántas acciones
          se han registrado y qué niveles de
          apoyo se utilizaron.
        </p>
      </div>

      {chartData.length > 0 ? (
        <div className="overflow-x-auto">
          <div
            className="min-w-[650px]"
            style={{
              height: Math.max(
                380,
                chartData.length * 52 + 130
              ),
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 15,
                  right: 25,
                  left: 15,
                  bottom: 20,
                }}
                barSize={25}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8E0F4"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{
                    fill: "#79699B",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="chart_label"
                  width={235}
                  interval={0}
                  tick={{
                    fill: "#4B367C",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  content={<ExperienceTooltip />}
                  cursor={{
                    fill: "#F7F3FC",
                  }}
                  wrapperStyle={{
                    zIndex: 50,
                  }}
                  isAnimationActive={false}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 12,
                    paddingTop: 20,
                  }}
                />

                {CHART_LEVELS.map((level) => (
                  <Bar
                    key={level.key}
                    dataKey={level.key}
                    name={level.name}
                    fill={level.color}
                    stackId="support"
                    isAnimationActive={false}
                    onClick={(entry) => {
                      if (entry?.payload) {
                        handleSelection(
                          entry.payload
                        );
                      }
                    }}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div
          className="bg-[#F7F3FC]
            rounded-xl p-7 text-center
            text-[#6B5B92] text-sm"
        >
          No existen acciones completadas
          para los filtros seleccionados.
        </div>
      )}

      <p className="text-xs text-[#79699B]">
        Mostrando {chartData.length} de{" "}
        {chartExperiences.length} experiencias
        con acciones registradas.
      </p>

      {/* TABLA DETALLADA */}

      <div>
        <h3
          className="text-lg font-bold
            text-[#4B367C] mb-3"
        >
          Detalle de las experiencias
        </h3>

        <div className="overflow-x-auto">
          <table
            className="w-full text-sm
              text-left min-w-[800px]"
          >
            <thead
              className="bg-[#F3ECFF]
                text-[#4B367C]"
            >
              <tr>
                <th className="p-3">
                  Experiencia
                </th>

                <th className="p-3">
                  Implementaciones
                </th>

                <th className="p-3">
                  Activas
                </th>

                <th className="p-3">
                  Completadas
                </th>

                <th className="p-3">
                  Acciones
                </th>

                <th className="p-3">
                  Independientes
                </th>

                <th className="p-3">
                  Con apoyo
                </th>

                <th className="p-3">
                  Independencia registrada
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredExperiences.map(
                (experience) => (
                  <tr
                    key={experience.group_key}
                    className={`border-b
                      border-[#E3D9FF]
                      hover:bg-[#F7F3FC]
                      ${
                        selectedGroupKey ===
                        experience.group_key
                          ? "bg-[#E8DDFF]"
                          : ""
                      }`}
                  >
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleSelection(experience)
                        }
                        className="text-left
                          font-semibold
                          text-[#7955B8]
                          hover:underline"
                      >
                        {experience.chart_label}
                      </button>

                      {experience.template_id ===
                        null && (
                        <p
                          className="text-xs
                            text-[#79699B] mt-1"
                        >
                          Sin plantilla asociada
                        </p>
                      )}
                    </td>

                    <td className="p-3">
                      {experience.implementations}
                    </td>

                    <td className="p-3">
                      {
                        experience.active_implementations
                      }
                    </td>

                    <td className="p-3">
                      {experience.completed_routines}
                    </td>

                    <td className="p-3 font-bold">
                      {experience.total_records}
                    </td>

                    <td
                      className="p-3
                        text-[#28694F] font-semibold"
                    >
                      {experience.independent}
                    </td>

                    <td
                      className="p-3
                        text-[#7955B8] font-semibold"
                    >
                      {experience.supported_records}
                    </td>

                    <td className="p-3">
                      {formatPercentage(
                        experience.independent_percentage
                      )}
                    </td>
                  </tr>
                )
              )}

              {filteredExperiences.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-6 text-center
                      text-[#79699B]"
                  >
                    No existen experiencias para
                    los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPLICACIÓN */}

      <div
        className="bg-[#F7F3FC]
          rounded-xl p-4 flex gap-3"
      >
        <FaInfoCircle
          className="text-[#7955B8]
            shrink-0 mt-1"
        />

        <div
          className="text-xs text-[#6B5B92]
            leading-relaxed space-y-2"
        >
          <p className="font-bold">
            ¿Cómo interpretar estos gráficos?
          </p>

          <p>
            Las experiencias agrupan rutinas
            que comparten una misma plantilla.
            Las rutinas sin plantilla mantienen
            un registro independiente.
          </p>

          <p>
            Una acción puede registrarse
            varias veces cuando se repite
            una rutina.
          </p>

          <p>
            Los porcentajes consideran solamente
            acciones con nivel de apoyo reconocido.
          </p>

          <p>
            Estos indicadores describen los
            registros de ejecución de rutinas
            y no representan una evaluación
            clínica ni el dominio cognitivo.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RoutineExperienceChart;