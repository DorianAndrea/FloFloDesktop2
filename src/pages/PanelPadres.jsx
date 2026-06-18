import { useEffect, useState } from "react";
import { useFloFlo } from "../context/FloFloContext";
import { getParentDashboard } from "../services/parentDashboardService";

const PanelPadres = () => {
  const { user } = useFloFlo();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const data = await getParentDashboard(user.id);
        setDashboard(data);
      } catch (error) {
        console.error("Error cargando panel de padres:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      cargarDashboard();
    }
  }, [user]);

  if (loading) {
    return <p className="text-center mt-10">Cargando panel...</p>;
  }

  return (
    <main className="min-h-screen bg-purple-50 p-6">
      <section className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-700 mb-2">
          Panel para Padres
        </h1>

        <p className="text-gray-600 mb-8">
          Revisa el avance general del niño en FloFlo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card titulo="Emociones" valor={dashboard.emotions} emoji="😊" />
          <Card titulo="Rutinas" valor={dashboard.routines} emoji="🕒" />
          <Card titulo="Lugares" valor={dashboard.places} emoji="📍" />
          <Card
            titulo="Familia y Amigos"
            valor={dashboard.contacts}
            emoji="👨‍👩‍👧"
          />
          <Card
            titulo="Conversaciones"
            valor={dashboard.conversations}
            emoji="💬"
          />
          <Card titulo="Logros" valor={dashboard.achievements} emoji="⭐" />
        </div>
        <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">
            Últimos logros desbloqueados
          </h2>

          {dashboard.latestAchievements?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.latestAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 bg-purple-50 rounded-2xl p-4"
                >
                  <div className="text-4xl">{achievement.icon}</div>

                  <div>
                    <h3 className="font-bold text-gray-700">
                      {achievement.name}
                    </h3>

                    <p className="text-gray-500 text-sm">
                      {achievement.description}
                    </p>

                    <p className="text-purple-500 text-xs font-semibold mt-1">
                      Desbloqueado recientemente
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Todavía no hay logros desbloqueados.
            </p>
          )}
        </section>
      </section>
    </main>
  );
};

const Card = ({ titulo, valor, emoji }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-purple-100">
      <div className="text-4xl mb-3">{emoji}</div>
      <h2 className="text-lg font-semibold text-gray-700">{titulo}</h2>
      <p className="text-4xl font-bold text-purple-600 mt-2">{valor}</p>
    </div>
  );
};

export default PanelPadres;
