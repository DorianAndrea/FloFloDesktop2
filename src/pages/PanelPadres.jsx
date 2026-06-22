import { useEffect, useState } from "react";
import { useFloFlo } from "../context/FloFloContext";
import { getMyDashboard } from "../services/parentDashboardService";
import {
  getChildrenByParent,
  linkChildToParent,
} from "../services/parentChildService";

import api from "../services/api";

const PanelPadres = () => {
  const { user } = useFloFlo();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childEmail, setChildEmail] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        if (user?.role === "parent") {
          const childrenData = await getChildrenByParent(user.id);

          setChildren(childrenData);

          if (childrenData.length > 0) {
            const firstChild = childrenData[0];
            setSelectedChild(firstChild);
            localStorage.setItem("selectedChild", JSON.stringify(firstChild));
            window.dispatchEvent(new Event("selectedChildChanged"));

            const dashboardData = await getParentDashboard(firstChild.id);
            setDashboard(dashboardData);
          } else {
            setDashboard(null);
          }
        } else {
          const dashboardData = await getMyDashboard();
          setDashboard(dashboardData);
        }
      } catch (error) {
        console.error("Error cargando panel de padres:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      cargarDatos();
    }
  }, [user]);

  const handleChildChange = async (e) => {
    const childId = e.target.value;

    const child = children.find((item) => String(item.id) === childId);

    setSelectedChild(child);
    setLoading(true);
    localStorage.setItem("selectedChild", JSON.stringify(child));
    window.dispatchEvent(new Event("selectedChildChanged"));

    try {
      const dashboardData = await getParentDashboard(childId);
      setDashboard(dashboardData);
    } catch (error) {
      console.error("Error cargando dashboard del niño:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleLinkChild = async () => {
  try {
    if (!childEmail.trim()) {
      alert("Ingresa el correo del niño");
      return;
    }

    const result = await linkChildToParent(user.id, childEmail.trim());

    alert(`${result.child.firstName} fue asociado correctamente`);

    const updatedChildren = await getChildrenByParent(user.id);
    setChildren(updatedChildren);

    const childToSelect =
      updatedChildren.find((child) => String(child.id) === String(result.child.id)) ||
      updatedChildren[0];

    if (childToSelect) {
      setSelectedChild(childToSelect);

      localStorage.setItem("selectedChild", JSON.stringify(childToSelect));
      window.dispatchEvent(new Event("selectedChildChanged"));

      const dashboardData = await getParentDashboard(childToSelect.id);
      setDashboard(dashboardData);
    }

    setChildEmail("");
  } catch (error) {
    console.error("ERROR ASOCIANDO:", error.response?.data || error);

    alert(error.response?.data?.message || "No fue posible asociar al niño");
  }
};

  if (loading) {
    return <p className="text-center mt-10">Cargando panel...</p>;
  }
  if (!dashboard) {
    return (
      <main className="min-h-screen bg-purple-50 p-6">
        <section className="max-w-5xl mx-auto bg-white rounded-3xl p-6 shadow-md">
          <h1 className="text-3xl font-bold text-purple-700 mb-3">
            Panel para Padres
          </h1>

          <p className="text-gray-600 mb-5">
            No hay información disponible todavía. Asocia un niño a este
            cuidador para ver su progreso.
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              placeholder="Correo del niño"
              className="border border-purple-200 rounded-xl px-4 py-3 flex-1"
            />

            <button
              type="button"
              onClick={handleLinkChild}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              Asociar niño
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-purple-50 p-6">
      <section className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-700 mb-2">
              Panel para Padres
            </h1>

            <p className="text-gray-600">
              Revisa el avance general del niño en FloFlo.
            </p>
          </div>
          {user?.role === "parent" && (
            <div className="mt-4">
              <label className="block text-sm font-bold text-purple-700 mb-2">
                Niño seleccionado
              </label>
              <div className="mt-4 flex flex-col md:flex-row gap-3">
                <input
                  type="email"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  placeholder="Correo del niño"
                  className="border border-purple-200 rounded-xl px-4 py-3 flex-1"
                />

                <button
                  type="button"
                  onClick={handleLinkChild}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold transition"
                >
                  Asociar niño
                </button>
              </div>

              {children.length > 0 ? (
                <select
                  value={selectedChild?.id || ""}
                  onChange={handleChildChange}
                  className="bg-white border border-purple-200 rounded-xl px-4 py-3 text-gray-700 font-semibold shadow-sm"
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.firstName} {child.lastName}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-500 text-sm">
                  Este cuidador todavía no tiene niños asociados.
                </p>
              )}
            </div>
          )}
          <a
            href={`${api.defaults.baseURL}/report/${selectedChild?.id || user.id}`}
            target="_blank"
            rel="noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-semibold shadow-md transition text-center w-fit"
          >
            Descargar PDF
          </a>
        </div>

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

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-purple-700 mb-5">
            Actividad reciente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <RecentCard
              emoji="😊"
              title="Última emoción"
              mainText={dashboard.latestMood?.mood_name}
              description={dashboard.latestMood?.comment}
            />

            <RecentCard
              emoji="🕒"
              title="Última rutina"
              mainText={dashboard.latestRoutine?.name}
              description={dashboard.latestRoutine?.description}
            />

            <RecentCard
              emoji="📍"
              title="Último lugar"
              mainText={dashboard.latestPlace?.name}
              description={dashboard.latestPlace?.description}
            />

            <RecentCard
              emoji="💬"
              title="Última conversación"
              mainText={dashboard.latestContactConversation?.title}
              description={dashboard.latestContactConversation?.situation}
            />
          </div>
        </section>

        <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-5">
            Gráfico emocional
          </h2>

          {dashboard.moodSummary?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.moodSummary.map((mood) => (
                <EmotionBar
                  key={mood.mood_name}
                  name={mood.mood_name}
                  count={Number(mood.count)}
                  total={dashboard.emotions}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Todavía no hay emociones registradas.
            </p>
          )}
        </section>

        <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-5">
            Historial reciente
          </h2>

          {dashboard.recentActivity?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recentActivity.map((item) => (
                <ActivityItem key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Todavía no hay actividad reciente.</p>
          )}
        </section>
        <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-5">
            Tendencia emocional semanal
          </h2>

          {dashboard.emotionalTrend?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.emotionalTrend.map((trend) => (
                <EmotionTrendItem key={trend.mood_name} trend={trend} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Todavía no hay datos suficientes para comparar esta semana.
            </p>
          )}
        </section>
        <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-5">
            Alertas para padres
          </h2>

          {dashboard.alerts?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.alerts.map((alert, index) => (
                <AlertCard key={index} alert={alert} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay alertas por el momento.</p>
          )}
        </section>
        <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-5">
            Calendario de actividad
          </h2>

          {dashboard.activityCalendar?.length > 0 ? (
            <ActivityCalendar data={dashboard.activityCalendar} />
          ) : (
            <p className="text-gray-500">
              Todavía no hay actividad registrada en los últimos 30 días.
            </p>
          )}
        </section>
        <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-5">
            Recomendaciones de Félix
          </h2>

          {dashboard.recommendations?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recommendations.map((recommendation, index) => (
                <RecommendationCard
                  key={index}
                  recommendation={recommendation}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Todavía no hay recomendaciones disponibles.
            </p>
          )}
        </section>

        {dashboard.nextAchievement && (
          <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
            <h2 className="text-2xl font-bold text-purple-700 mb-5">
              Próximo logro
            </h2>

            <div className="bg-purple-50 rounded-2xl p-5">
              <div className="text-4xl mb-3">
                {dashboard.nextAchievement.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-700">
                {dashboard.nextAchievement.name}
              </h3>

              <p className="text-gray-500 mt-1">
                {dashboard.nextAchievement.description}
              </p>

              <p className="text-purple-600 font-bold mt-3">
                Te faltan{" "}
                {Math.max(
                  Number(dashboard.nextAchievement.required_value) -
                    Number(dashboard.nextAchievement.current_value),
                  0,
                )}{" "}
                para desbloquearlo.
              </p>
            </div>
          </section>
        )}

        <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-5">
            Conversaciones favoritas
          </h2>

          {dashboard.favoriteConversations?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.favoriteConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100"
                >
                  <h3 className="font-bold text-gray-700">
                    ⭐ {conversation.title}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    {conversation.situation}
                  </p>

                  {conversation.what_to_say && (
                    <p className="text-purple-600 text-sm font-semibold mt-2">
                      Qué decir: {conversation.what_to_say}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Todavía no hay conversaciones favoritas.
            </p>
          )}
        </section>

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
const RecentCard = ({ emoji, title, mainText, description }) => {
  return (
    <article className="bg-white rounded-3xl p-6 shadow-md border border-purple-100">
      <div className="text-4xl mb-3">{emoji}</div>

      <p className="text-sm font-bold text-purple-500 mb-1">{title}</p>

      <h3 className="text-xl font-bold text-gray-700">
        {mainText || "Sin registros todavía"}
      </h3>

      {description && <p className="text-gray-500 mt-2">{description}</p>}
    </article>
  );
};

const ActivityItem = ({ item }) => {
  const icons = {
    emotion: "😊",
    routine: "🕒",
    place: "📍",
    conversation: "💬",
  };

  return (
    <div className="flex items-start gap-4 bg-purple-50 rounded-2xl p-4">
      <div className="text-3xl">{icons[item.type] || "✨"}</div>

      <div className="flex-1">
        <h3 className="font-bold text-gray-700">{item.title}</h3>

        <p className="text-gray-500 text-sm">{item.description}</p>

        <p className="text-purple-500 text-xs font-semibold mt-1">
          {new Date(item.created_at).toLocaleDateString("es-CL")}
        </p>
      </div>
    </div>
  );
};
const EmotionBar = ({ name, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-semibold text-gray-700">{name}</span>
        <span className="font-bold text-purple-600">{count}</span>
      </div>

      <div className="w-full bg-purple-100 rounded-full h-4">
        <div
          className="bg-purple-500 h-4 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const EmotionTrendItem = ({ trend }) => {
  const currentWeek = Number(trend.current_week);
  const previousWeek = Number(trend.previous_week);
  const difference = currentWeek - previousWeek;

  const moodEmojis = {
    Alegre: "😊",
    Ansioso: "😰",
    Enojado: "😡",
    Triste: "😢",
    Asustado: "😨",
    Feliz: "😊",
  };

  let message = "Se mantuvo estable durante las últimas semanas.";
  let trendIcon = "➖";
  let bgColor = "bg-purple-50";

  if (difference > 0) {
    message = "Registró más veces esta emoción durante esta semana.";
    trendIcon = "↗️";
  }

  if (difference < 0) {
    message = "Registró menos veces esta emoción durante esta semana.";
    trendIcon = "↘️";
  }

  return (
    <div className={`${bgColor} rounded-2xl p-4 flex items-start gap-4`}>
      <div className="text-3xl">{trendIcon}</div>

      <div className="flex-1">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <span className="text-2xl">
            {moodEmojis[trend.mood_name] || "🙂"}
          </span>
          {trend.mood_name}
        </h3>

        <p className="text-gray-500 text-sm mt-1">
          {currentWeek} registro(s) esta semana.
        </p>

        <p className="text-purple-600 text-sm font-semibold mt-1">{message}</p>
      </div>
    </div>
  );
};

const AlertCard = ({ alert }) => {
  let bgColor = "bg-blue-50";
  let borderColor = "border-blue-200";

  if (alert.type === "warning") {
    bgColor = "bg-yellow-50";
    borderColor = "border-yellow-200";
  }

  if (alert.type === "success") {
    bgColor = "bg-green-50";
    borderColor = "border-green-200";
  }

  return (
    <div className={`${bgColor} ${borderColor} border rounded-2xl p-4`}>
      <div className="flex items-start gap-4">
        <div className="text-3xl">{alert.icon}</div>

        <div>
          <h3 className="font-bold text-gray-700">{alert.title}</h3>

          <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
        </div>
      </div>
    </div>
  );
};
const ActivityCalendar = ({ data }) => {
  const activityMap = {};

  data.forEach((item) => {
    const dateKey = new Date(item.activity_date).toISOString().split("T")[0];

    activityMap[dateKey] = Number(item.total);
  });

  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - index));

    const dateKey = date.toISOString().split("T")[0];

    return {
      date,
      dateKey,
      total: activityMap[dateKey] || 0,
    };
  });

  return (
    <div>
      <div className="grid grid-cols-10 gap-2">
        {days.map((day) => (
          <div
            key={day.dateKey}
            title={`${day.date.toLocaleDateString("es-CL")} - ${day.total} actividad(es)`}
            className={`
              h-8 rounded-lg flex items-center justify-center text-xs font-bold
              ${
                day.total === 0
                  ? "bg-gray-100 text-gray-400"
                  : day.total === 1
                    ? "bg-green-100 text-green-700"
                    : day.total === 2
                      ? "bg-green-200 text-green-800"
                      : "bg-green-300 text-green-900"
              }
            `}
          >
            {day.date.getDate()}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-4 text-sm text-gray-500">
        <span>Menos actividad</span>
        <span className="w-5 h-5 rounded bg-gray-100 inline-block" />
        <span className="w-5 h-5 rounded bg-green-100 inline-block" />
        <span className="w-5 h-5 rounded bg-green-200 inline-block" />
        <span className="w-5 h-5 rounded bg-green-300 inline-block" />
        <span>Más actividad</span>
      </div>
    </div>
  );
};
const RecommendationCard = ({ recommendation }) => {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{recommendation.icon || "💡"}</div>

        <div>
          <h3 className="font-bold text-gray-700">{recommendation.title}</h3>

          <p className="text-gray-600 text-sm mt-1">{recommendation.message}</p>
        </div>
      </div>
    </div>
  );
};

export default PanelPadres;
