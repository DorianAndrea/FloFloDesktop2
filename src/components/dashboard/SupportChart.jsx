import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  FaHandsHelping,
  FaInfoCircle,
} from "react-icons/fa";

/*
 * Niveles de apoyo registrados en las rutinas.
 *
 * Las descripciones y ejemplos son explicativos,
 * no observaciones clínicas del niño.
 */

const SUPPORT_LEVELS = [
  {
    key: "independent",
    name: "Independiente",
    color: "#89CCAF",
    description:
      "En estos registros, el niño completó un paso de una rutina de forma independiente.",
    example:
      "Mojar las manos sin recibir ayuda durante la rutina de lavarse las manos.",
  },
  {
    key: "verbal",
    name: "Apoyo verbal",
    color: "#AC96E0",
    description:
      "En estos registros, el niño completó un paso de una rutina con indicaciones, recordatorios u orientación verbal.",
    example:
      "Recibir una indicación para aplicar jabón durante la rutina de lavarse las manos.",
  },
  {
    key: "visual",
    name: "Apoyo visual",
    color: "#86B9E5",
    description:
      "En estos registros, el niño completó un paso de una rutina utilizando imágenes, pictogramas u otras referencias visuales.",
    example:
      "Consultar un pictograma para identificar que es momento de enjuagarse las manos.",
  },
  {
    key: "gestural",
    name: "Apoyo gestual",
    color: "#F3CD83",
    description:
      "En estos registros, el niño completó un paso de una rutina con ayuda de gestos o señales corporales.",
    example:
      "El adulto señala la toalla para indicar que es momento de secarse las manos.",
  },
  {
    key: "physical_partial",
    name: "Apoyo físico parcial",
    color: "#E9AC91",
    description:
      "En estos registros, el niño completó un paso de una rutina con asistencia física durante una parte de la acción.",
    example:
      "Recibir ayuda física para accionar el dispensador de jabón.",
  },
  {
    key: "physical_total",
    name: "Apoyo físico total",
    color: "#CF9CB8",
    description:
      "En estos registros, el paso de la rutina se completó con asistencia física durante toda la acción.",
    example:
      "Recibir asistencia física durante toda la acción de secarse las manos.",
  },
];

/*
 * FORMATEADORES
 */

const formatCount = (value) =>
  Number.isInteger(value) && value >= 0
    ? new Intl.NumberFormat("es-CL").format(value)
    : "—";

const formatPercentage = (value) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 100
    ? `${new Intl.NumberFormat("es-CL", {
        maximumFractionDigits: 1,
      }).format(value)}%`
    : "—";

/*
 * TOOLTIP PERSONALIZADO
 */

const SupportTooltip = ({
  active,
  payload,
  total,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  if (!item) return null;

  const level = SUPPORT_LEVELS.find(
    (entry) => entry.key === item.key
  );

  if (!level) return null;

  const percentage =
    total > 0
      ? (item.value / total) * 100
      : null;

  return (
    <div
      className="bg-white rounded-2xl
        border border-[#E3D9FF]
        shadow-xl p-5
        w-[280px] sm:w-[320px]
        max-w-[80vw]
        whitespace-normal break-words"
    >
      {/* IDENTIFICACIÓN DEL APOYO */}

      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{
            backgroundColor: level.color,
          }}
          aria-hidden="true"
        />

        <p className="font-bold text-lg text-[#4B367C]">
          {level.name}
        </p>
      </div>

      {/* CANTIDAD REAL */}

      <p className="text-2xl font-extrabold text-[#4B367C]">
        {formatCount(item.value)}{" "}
        {item.value === 1
          ? "paso de rutina"
          : "pasos de rutina"}
      </p>

      {/* SIGNIFICADO DEL INDICADOR */}

      <p className="text-sm text-[#6B5B92] mt-3 leading-relaxed">
        {level.description}
      </p>

      {/* PROPORCIÓN */}

      <div className="bg-[#F7F3FC] rounded-xl p-3 mt-3">
        <p className="text-sm font-bold text-[#7955B8]">
          {formatPercentage(percentage)}
        </p>

        <p className="text-xs text-[#6B5B92] mt-1">
          De los {formatCount(total)} registros de
          pasos de rutina con nivel de apoyo
          reconocido.
        </p>
      </div>

      {/* EJEMPLO COTIDIANO */}

      <div className="border-t border-[#E3D9FF] my-4" />

      <p className="text-sm font-bold text-[#4B367C]">
        Ejemplo de la vida cotidiana
      </p>

      <p className="text-sm text-[#6B5B92] mt-2 leading-relaxed">
        {level.example}
      </p>

      <p className="text-xs text-[#79699B] italic mt-2">
        Ejemplo ilustrativo, no corresponde
        necesariamente a una actividad registrada
        por este niño.
      </p>

      {/* ORIGEN Y PERÍODO */}

      <div className="border-t border-[#E3D9FF] my-4" />

      <p className="text-xs text-[#79699B]">
        Fuente: módulo de Rutinas de FloFlo.
      </p>

      <p className="text-xs text-[#79699B] mt-1">
        Período: historial completo.
      </p>
    </div>
  );
};

/*
 * COMPONENTE PRINCIPAL
 */

const SupportChart = ({ support }) => {
  const distribution =
    support?.support_distribution || {};

  const levels = SUPPORT_LEVELS.map((level) => ({
    ...level,
    value: distribution[level.key],
  }));

  const chartData = levels.filter(
    (level) =>
      Number.isInteger(level.value) &&
      level.value > 0
  );

  /*
   * Tener rutinas completadas no significa
   * necesariamente disponer de niveles de apoyo
   * reconocidos.
   */

  const hasDocumentedSupport =
    support?.documented_support_steps > 0 &&
    chartData.length > 0;

  return (
    <section
      className="bg-white rounded-3xl
        border border-[#E3D9FF]
        shadow-sm p-5 sm:p-7 space-y-6"
    >
      {/* ENCABEZADO */}

      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl
            bg-[#DDF2E7] flex items-center
            justify-center shrink-0"
        >
          <FaHandsHelping
            className="text-2xl text-[#28694F]"
            aria-hidden="true"
          />
        </div>

        <div>
          <h2
            className="text-xl sm:text-2xl
              font-bold text-[#4B367C]"
          >
            Autonomía en las rutinas
          </h2>

          <p className="text-sm text-[#6B5B92]">
            Conoce cómo realiza el niño los pasos
            de sus rutinas y qué apoyos utiliza.
          </p>
        </div>
      </div>

      {/* ESTADO SIN DATOS */}

      {!hasDocumentedSupport ? (
        <div
          className="rounded-2xl bg-[#F7F3FC]
            p-8 text-center"
        >
          <FaInfoCircle
            className="text-3xl text-[#9676D6]
              mx-auto mb-3"
            aria-hidden="true"
          />

          <h3 className="font-bold text-[#4B367C]">
            {!support
              ? "Información no disponible"
              : support.total_completed_steps === 0
              ? "Aún no hay pasos de rutina completados"
              : "Sin niveles de apoyo reconocidos"}
          </h3>

          <p className="text-sm text-[#6B5B92] mt-2">
            El gráfico estará disponible cuando
            existan pasos de rutina completados
            con información válida sobre el
            apoyo utilizado.
          </p>

          <p className="text-xs text-[#79699B] mt-3">
            La ausencia de registros no significa
            que el niño carezca de autonomía.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1
            lg:grid-cols-2 gap-6 items-center"
        >
          {/* GRÁFICO CIRCULAR */}

          <div className="relative h-[280px] min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="61%"
                  outerRadius="83%"
                  paddingAngle={0}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  content={
                    <SupportTooltip
                      total={
                        support.documented_support_steps
                      }
                    />
                  }
                  wrapperStyle={{
                    zIndex: 50,
                    outline: "none",
                  }}
                  isAnimationActive={false}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* INDICADOR CENTRAL */}

            <div
              className="absolute inset-0
                flex flex-col items-center
                justify-center pointer-events-none"
            >
              <p
                className="text-3xl sm:text-4xl
                  font-extrabold text-[#28694F]"
              >
                {formatPercentage(
                  support.independent_steps_percentage
                )}
              </p>

              <p
                className="text-xs text-[#28694F]
                  text-center mt-2
                  max-w-[115px] leading-snug"
              >
                Pasos de rutina realizados de
                forma independiente
              </p>
            </div>
          </div>

          {/* LEYENDA DE NIVELES DE APOYO */}

          <div className="space-y-3">
            {levels.map((level) => (
              <div
                key={level.key}
                className="flex items-center
                  justify-between gap-3
                  rounded-xl bg-[#F7F3FC]
                  px-4 py-3"
              >
                <div
                  className="flex items-center gap-3"
                >
                  <span
                    className="w-4 h-4 rounded-full
                      shrink-0"
                    style={{
                      backgroundColor: level.color,
                    }}
                    aria-hidden="true"
                  />

                  <span
                    className="text-sm font-medium
                      text-[#4B367C]"
                  >
                    {level.name}
                  </span>
                </div>

                <span
                  className="font-bold text-[#4B367C]"
                >
                  {formatCount(level.value)}
                </span>
              </div>
            ))}

            <p className="text-xs text-[#79699B]">
              Cada cantidad representa registros
              de pasos de rutina completados
              con ese nivel de apoyo.
            </p>
          </div>
        </div>
      )}

      {/* INDICADORES COMPLEMENTARIOS */}

      <div
        className="grid grid-cols-1
          sm:grid-cols-2 gap-3"
      >
        {[
          {
            label: "Pasos de rutina completados",
            description:
              "Total de acciones completadas dentro de las rutinas registradas.",
            value: support?.total_completed_steps,
            background: "#E8DDFF",
            foreground: "#6245A0",
          },
          {
            label: "Con nivel de apoyo reconocido",
            description:
              "Pasos de rutina con información válida sobre el nivel de apoyo utilizado.",
            value: support?.documented_support_steps,
            background: "#DCECFB",
            foreground: "#285D91",
          },
          {
            label: "Pasos de rutina independientes",
            description:
              "Acciones registradas como realizadas de forma independiente.",
            value: distribution.independent,
            background: "#DDF2E7",
            foreground: "#28694F",
          },
          {
            label: "Sin información sobre el apoyo utilizado",
            description:
              "Pasos completados cuyo nivel de apoyo no fue informado.",
            value: support?.unspecified_support_steps,
            background: "#FBEAD8",
            foreground: "#925B24",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl p-4"
            style={{
              backgroundColor: item.background,
              color: item.foreground,
            }}
          >
            <p className="text-3xl font-bold">
              {formatCount(item.value)}
            </p>

            <p className="text-sm font-semibold mt-1">
              {item.label}
            </p>

            <p className="text-xs mt-2 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* REGISTROS NO RECONOCIDOS */}

      {support?.unknown_support_steps > 0 && (
        <p
          className="text-sm text-[#925B24]
            bg-[#FBEAD8] rounded-xl p-4"
        >
          Existen{" "}
          {formatCount(support.unknown_support_steps)}{" "}
          registros de pasos de rutina con niveles
          de apoyo no reconocidos. Estos registros
          no se incluyen en el cálculo de
          porcentajes del gráfico.
        </p>
      )}

      {/* EXPLICACIÓN DEL INDICADOR */}

      <div
        className="bg-[#F7F3FC] rounded-xl
          p-4 flex items-start gap-3"
      >
        <FaInfoCircle
          className="text-[#7955B8] shrink-0 mt-1"
          aria-hidden="true"
        />

        <div className="space-y-2">
          <p className="text-sm font-bold text-[#4B367C]">
            ¿Qué estamos observando?
          </p>

          <p className="text-xs text-[#6B5B92] leading-relaxed">
            Cada rutina está formada por pequeñas
            acciones. Por ejemplo, lavarse las
            manos puede incluir mojar las manos,
            aplicar jabón, enjuagar y secar.
          </p>

          <p className="text-xs text-[#6B5B92] leading-relaxed">
            Cada paso completado puede generar un
            registro con información sobre el
            nivel de apoyo utilizado. Una misma
            acción puede contabilizarse nuevamente
            cuando se repite la rutina.
          </p>

          <p className="text-xs text-[#6B5B92] leading-relaxed">
            Los porcentajes se calculan únicamente
            sobre los registros con niveles de
            apoyo reconocidos.
          </p>

          <p className="text-xs text-[#6B5B92] leading-relaxed">
            Estos indicadores no representan la
            cantidad de habilidades diferentes
            adquiridas, el dominio cognitivo ni
            una evaluación de la autonomía
            general del niño.
          </p>
        </div>
      </div>

      {/* TRAZABILIDAD */}

      <div
        className="border-t border-[#E3D9FF]
          pt-4 flex flex-wrap justify-between gap-2"
      >
        <p className="text-xs text-[#79699B]">
          Fuente: módulo de Rutinas de FloFlo.
        </p>

        <p className="text-xs text-[#79699B]">
          Período: historial completo.
        </p>
      </div>
    </section>
  );
};

export default SupportChart;