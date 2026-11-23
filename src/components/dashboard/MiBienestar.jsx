
import { useEffect, useState } from "react";
import { FaHeart, FaSpinner } from "react-icons/fa";
import { getChildMoods } from "../../services/moodService";

const MiBienestar = ({ childId }) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setResult(null);

    if (!childId) return;

    const loadMoods = async () => {
      try {
        const data = await getChildMoods(childId);

        if (cancelled) return;

        setResult({
          childId: String(childId),
          moods: Array.isArray(data) ? data : [],
          error: false,
        });
      } catch (error) {
        console.error("Error cargando bienestar:", error);

        if (cancelled) return;

        setResult({
          childId: String(childId),
          moods: [],
          error: true,
        });
      }
    };

    loadMoods();

    return () => {
      cancelled = true;
    };
  }, [childId]);

  const current =
    result?.childId === String(childId)
      ? result
      : null;

  const getSummary = (moods) => {
    const now = Date.now();
    const start = now - 7 * 24 * 60 * 60 * 1000;

    const validMoods = moods
      .filter((mood) => {
        const date = new Date(mood.created_at).getTime();

        return (
          Number.isFinite(date) &&
          date <= now
        );
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

    const recent = validMoods.filter(
      (mood) =>
        new Date(mood.created_at).getTime() >= start
    );

    const counts = {};

    recent.forEach((mood) => {
      const name = mood.mood_name || "Sin identificar";

      counts[name] = (counts[name] || 0) + 1;
    });

    const frequencies = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const childCount = recent.filter(
      (mood) => mood.source === "child"
    ).length;

    const adultCount = recent.filter(
      (mood) =>
        mood.source === "adult" ||
        mood.source === "parent"
    ).length;

    return {
      latest: validMoods[0] || null,
      recent,
      frequencies,
      childCount,
      adultCount,
    };
  };

  const summary =
    current && !current.error
      ? getSummary(current.moods)
      : null;

  return (
    <section
      aria-labelledby="bienestar-title"
      className="bg-white rounded-[2rem]
        p-6 sm:p-8 shadow-sm
        border border-[#E3D9FF]"
    >
      {/* ENCABEZADO */}

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#FCE7F1] rounded-2xl p-4">
          <FaHeart
            className="text-2xl text-[#B34F83]"
            aria-hidden="true"
          />
        </div>

        <div>
          <h2
            id="bienestar-title"
            className="text-2xl font-extrabold
              text-[#4B367C]"
          >
            Mi Bienestar
          </h2>

          <p className="text-sm text-[#6B5B92]">
            Acompañamiento emocional · Últimos 7 días
          </p>
        </div>
      </div>

      {/* CARGANDO */}

      {!current ? (
        <div
          role="status"
          className="flex items-center gap-3
            text-[#6B5B92]"
        >
          <FaSpinner
            className="animate-spin"
            aria-hidden="true"
          />

          Cargando registros emocionales...
        </div>
      ) : current.error ? (
        <p
          role="alert"
          className="text-[#963E65]"
        >
          No pudimos consultar los registros emocionales.
          Verifica que tengas acceso autorizado al perfil.
        </p>
      ) : (
        <>
          {/* INDICADORES */}

          <div
            className="grid grid-cols-1
              sm:grid-cols-2 gap-4 mb-7"
          >
            <div
              className="bg-[#F7F3FC]
                rounded-2xl p-5"
            >
              <p className="text-sm text-[#6B5B92]">
                Última emoción registrada
              </p>

              <p
                className="text-2xl font-bold
                  text-[#4B367C] mt-2"
              >
                {summary.latest?.mood_name ||
                  "Sin registros"}
              </p>

              {summary.latest && (
                <p
                  className="text-xs text-[#79699B] mt-2"
                >
                  {summary.latest.source === "child"
                    ? "Expresada por el niño/a"
                    : "Observación de adulto/a"}
                </p>
              )}
            </div>

            <div
              className="bg-[#F7F3FC]
                rounded-2xl p-5"
            >
              <p className="text-sm text-[#6B5B92]">
                Registros de los últimos 7 días
              </p>

              <p
                className="text-3xl font-bold
                  text-[#4B367C] mt-2"
              >
                {summary.recent.length}
              </p>

              <p
                className="text-xs text-[#79699B] mt-2"
              >
                {summary.childCount} del niño/a ·{" "}
                {summary.adultCount} observaciones
                de adultos
              </p>
            </div>
          </div>

          {/* GRÁFICO EMOCIONAL */}

          <h3
            className="font-bold text-[#4B367C] mb-4"
          >
            Emociones registradas
          </h3>

          {summary.frequencies.length === 0 ? (
            <p className="text-sm text-[#6B5B92]">
              Todavía no hay registros emocionales
              durante los últimos 7 días.
            </p>
          ) : (
            <div className="space-y-4">
              {summary.frequencies.map(
                ({ name, count }) => (
                  <div key={name}>
                    <div
                      className="flex justify-between
                        text-sm mb-2"
                    >
                      <span
                        className="font-semibold
                          text-[#4B367C]"
                      >
                        {name}
                      </span>

                      <span className="text-[#6B5B92]">
                        {count}
                      </span>
                    </div>

                    <div
                      className="h-3 rounded-full
                        bg-[#EDE5FC] overflow-hidden"
                    >
                      <div
                        className="h-full rounded-full
                          bg-[#9676D6]"
                        style={{
                          width: `${
                            (count /
                              summary.recent.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* ACLARACIÓN */}

          <p
            className="text-xs text-[#79699B] mt-7"
          >
            Este resumen incluye emociones expresadas
            por el niño/a y observaciones registradas
            por adultos autorizados. No constituye
            una evaluación diagnóstica.
          </p>
        </>
      )}
    </section>
  );
};

export default MiBienestar;
