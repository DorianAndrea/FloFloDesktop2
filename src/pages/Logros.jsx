import { useEffect, useState } from "react";
import { getAchievements } from "../services/achievementService";

const Logros = () => {
  const [achievements, setAchievements] = useState([]);

  const loadAchievements = async () => {
    try {
      const data = await getAchievements();
      setAchievements(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#4B367C] mb-4">
          Logros
        </h1>

        <p className="text-xl text-[#6B5A95] mb-10">
          Mira los logros que Félix ha desbloqueado contigo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`
                rounded-[2rem] p-6 shadow-md border-2 transition
                ${
                  achievement.unlocked
                    ? "bg-white border-[#9B7BE8]"
                    : "bg-[#FDFBFF] border-[#E4D8FF] opacity-60"
                }
              `}
            >
              <div className="flex items-center gap-5">
                <div className="text-5xl">
                  {achievement.unlocked ? achievement.icon : "🔒"}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#4B367C]">
                    {achievement.name}
                  </h2>

                  <p className="text-[#6B5A95] mt-1">
                    {achievement.description}
                  </p>

                  <p className="text-sm font-bold mt-3 text-[#9B7BE8]">
                    {achievement.unlocked
                      ? "Logro desbloqueado"
                      : "Aún bloqueado"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Logros;