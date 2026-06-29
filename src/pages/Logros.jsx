import { useEffect, useState } from "react";
import { getAchievements } from "../services/achievementService";
import { useFloFlo } from "../context/FloFloContext";
import { useFeedback } from "../context/FeedbackContext";
import { getCachedData, setCachedData } from "../utils/cache";

const Logros = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useFloFlo();
  const { showFeedback } = useFeedback();

  const loadAchievements = async () => {
  try {
    if (!user?.id) return;

    const cacheKey = `floflo_achievements_${user.id}`;
    const cachedAchievements = getCachedData(cacheKey);

    if (Array.isArray(cachedAchievements)) {
      setAchievements(cachedAchievements);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const data = await getAchievements();
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
      message: "Intenta nuevamente en unos segundos.",
    });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadAchievements();
  }, [user?.id]);

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked,
  );

  const lockedAchievements = achievements.filter(
    (achievement) => !achievement.unlocked,
  );

  const loggedUserName =
    user?.firstName || user?.first_name || user?.name || "el usuario";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
        <section className="max-w-6xl mx-auto">
          <p className="text-[#4B367C] text-2xl font-bold">
            Cargando logros...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#4B367C] mb-4">
            Logros
          </h1>

          <p className="text-xl text-[#6B5A95]">
            Mira los logros que {loggedUserName} ha desbloqueado.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-md p-6 mb-10 border-2 border-[#E4D8FF]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-[#9B7BE8] font-bold mb-1">
                Progreso de logros
              </p>

              <h2 className="text-3xl font-extrabold text-[#4B367C]">
                ⭐ {unlockedAchievements.length} desbloqueados
              </h2>
            </div>

            <div className="bg-[#FFF3C4] text-[#5C4A00] px-6 py-4 rounded-full font-bold text-xl">
              Total: {achievements.length}
            </div>
          </div>
        </div>

        {achievements.length === 0 ? (
          <div className="bg-white rounded-[2rem] shadow-md p-8 text-center border-2 border-[#E4D8FF]">
            <div className="text-6xl mb-4">⭐</div>

            <h2 className="text-3xl font-bold text-[#4B367C] mb-3">
              Aún no hay logros para mostrar
            </h2>

            <p className="text-[#6B5A95] text-lg">
              Completa emociones, rutinas, conversaciones o lugares para que
              {loggedUserName} desbloquee nuevos logros.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-[#4B367C] mb-6">
              Logros desbloqueados
            </h2>

            {unlockedAchievements.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-6 shadow-md border-2 border-[#E4D8FF] mb-10">
                <p className="text-[#6B5A95] text-lg">
                  Todavía no tienes logros desbloqueados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
                <h2 className="text-3xl font-bold text-[#4B367C] mb-6">
                  Próximos logros
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        rounded-[2rem] p-6 shadow-md border-2 transition
        ${
          unlocked
            ? "bg-white border-[#9B7BE8]"
            : "bg-[#FDFBFF] border-[#E4D8FF] opacity-70"
        }
      `}
    >
      <div className="flex items-start gap-5">
        <div
          className={`
            min-w-20 h-20 rounded-3xl flex items-center justify-center text-5xl
            ${unlocked ? "bg-[#FFF3C4]" : "bg-[#E8DDFF]"}
          `}
        >
          {unlocked ? achievement.icon || "⭐" : "🔒"}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-[#4B367C]">
            {achievement.name}
          </h3>

          <p className="text-[#6B5A95] mt-2">{achievement.description}</p>

          <p
            className={`
              text-sm font-bold mt-4 w-fit px-4 py-2 rounded-full
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
