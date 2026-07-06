import { useEffect, useState } from "react";
import {
  getAchievements,
  getChildAchievements,
} from "../services/achievementService";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import { getCachedData, setCachedData } from "../utils/cache";

const normalizeBoolean = (value) => {
  return value === true || value === "true" || value === 1 || value === "1";
};

const Logros = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useFloFlo();

  const {
    isParent,
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,
  } = useSelectedChild();

  const { showFeedback } = useFeedback();

  const isParentMode = isParent && Boolean(selectedChildId);
  const isParentWithoutChild = isParent && !selectedChildId;

  const displayName = isParentMode
    ? getChildDisplayName(selectedChild)
    : user?.firstName || user?.first_name || user?.name || "el usuario";

  const loadAchievements = async () => {
    try {
      if (!user?.id) return;

      if (isParent && loadingChildren) {
        return;
      }

      if (isParentWithoutChild) {
        setAchievements([]);
        setLoading(false);
        return;
      }

      const ownerId = isParentMode ? selectedChildId : user.id;
      const cacheKey = `floflo_achievements_${ownerId}`;

      const cachedAchievements = getCachedData(cacheKey);

      if (Array.isArray(cachedAchievements)) {
        setAchievements(cachedAchievements);
        setLoading(false);
      } else {
        setLoading(true);
      }

      const data = isParentMode
        ? await getChildAchievements(selectedChildId)
        : await getAchievements();

      const safeAchievements = Array.isArray(data) ? data : [];

      setAchievements(safeAchievements);
      setCachedData(cacheKey, safeAchievements);
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudieron cargar los logros",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, [user?.id, user?.role, selectedChildId, loadingChildren]);

  const unlockedAchievements = achievements.filter((achievement) =>
    normalizeBoolean(achievement.unlocked),
  );

  const lockedAchievements = achievements.filter(
    (achievement) => !normalizeBoolean(achievement.unlocked),
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
        <section className="mx-auto max-w-6xl">
          <p className="text-2xl font-bold text-[#4B367C]">
            Cargando logros...
          </p>
        </section>
      </main>
    );
  }

  if (isParentWithoutChild) {
    return (
      <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
        <section className="mx-auto max-w-6xl rounded-[2rem] bg-white p-8 text-center shadow-md">
          <h1 className="text-3xl font-extrabold text-[#4B367C]">
            No hay niño/a seleccionado
          </h1>

          <p className="mt-3 text-lg text-[#6B5A95]">
            Para ver logros como cuidador, primero debes seleccionar un niño/a.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="mb-4 text-4xl font-extrabold text-[#4B367C] md:text-6xl">
            Logros
          </h1>

          <p className="text-xl text-[#6B5A95]">
            Mira los logros que {displayName} ha desbloqueado.
          </p>
        </div>

        {isParentMode && (
          <div className="mb-8 rounded-[2rem] border-2 border-[#9ED5B3] bg-[#EAF8EF] p-5 text-center shadow-sm">
            <p className="font-bold text-[#2F6B4F]">Modo cuidador activo</p>

            <p className="mt-1 text-[#2F6B4F]">
              Estás viendo los logros de {displayName}.
            </p>
          </div>
        )}

        <div className="mb-10 rounded-[2rem] border-2 border-[#E4D8FF] bg-white p-6 shadow-md">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 font-bold text-[#9B7BE8]">
                Progreso de logros
              </p>

              <h2 className="text-3xl font-extrabold text-[#4B367C]">
                ⭐ {unlockedAchievements.length} desbloqueados
              </h2>
            </div>

            <div className="rounded-full bg-[#FFF3C4] px-6 py-4 text-xl font-bold text-[#5C4A00]">
              Total: {achievements.length}
            </div>
          </div>
        </div>

        {achievements.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-[#E4D8FF] bg-white p-8 text-center shadow-md">
            <div className="mb-4 text-6xl">⭐</div>

            <h2 className="mb-3 text-3xl font-bold text-[#4B367C]">
              Aún no hay logros para mostrar
            </h2>

            <p className="text-lg text-[#6B5A95]">
              Completa emociones, rutinas, conversaciones o lugares para que{" "}
              {displayName} desbloquee nuevos logros.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-6 text-3xl font-bold text-[#4B367C]">
              Logros desbloqueados
            </h2>

            {unlockedAchievements.length === 0 ? (
              <div className="mb-10 rounded-[2rem] border-2 border-[#E4D8FF] bg-white p-6 shadow-md">
                <p className="text-lg text-[#6B5A95]">
                  Todavía no hay logros desbloqueados.
                </p>
              </div>
            ) : (
              <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    unlocked
                  />
                ))}
              </div>
            )}

            {lockedAchievements.length > 0 && (
              <>
                <h2 className="mb-6 text-3xl font-bold text-[#4B367C]">
                  Próximos logros
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {lockedAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={false}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
};

const AchievementCard = ({ achievement, unlocked }) => {
  return (
    <article
      className={`
        rounded-[2rem] border-2 p-6 shadow-md transition
        ${
          unlocked
            ? "border-[#9B7BE8] bg-white"
            : "border-[#E4D8FF] bg-[#FDFBFF] opacity-70"
        }
      `}
    >
      <div className="flex items-start gap-5">
        <div
          className={`
            flex h-20 min-w-20 items-center justify-center rounded-3xl text-5xl
            ${unlocked ? "bg-[#FFF3C4]" : "bg-[#E8DDFF]"}
          `}
        >
          {unlocked ? achievement.icon || "⭐" : "🔒"}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-[#4B367C]">
            {achievement.name}
          </h3>

          <p className="mt-2 text-[#6B5A95]">{achievement.description}</p>

          <p
            className={`
              mt-4 w-fit rounded-full px-4 py-2 text-sm font-bold
              ${
                unlocked
                  ? "bg-green-100 text-green-700"
                  : "bg-[#E8DDFF] text-[#6B5A95]"
              }
            `}
          >
            {unlocked ? "Logro desbloqueado" : "Aún bloqueado"}
          </p>
        </div>
      </div>
    </article>
  );
};

export default Logros;
