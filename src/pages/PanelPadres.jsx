import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFloFlo } from "../context/FloFloContext";
import api from "../services/api";
import { getChildSensoryProfile } from "../services/sensoryProfileService";

const PanelPadres = () => {
  const { user } = useFloFlo();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childEmail, setChildEmail] = useState("");
  const [sensoryProfile, setSensoryProfile] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const getMyDashboard = async () => {
    const response = await api.get("/parent-dashboard/me");
    return response.data;
  };

  const getChildDashboard = async (childId) => {
    const response = await api.get(`/parent-dashboard/children/${childId}`);
    return response.data;
  };

  const getMyChildren = async () => {
    const response = await api.get("/parent-child/me/children");
    return Array.isArray(response.data)
      ? response.data
      : response.data.children || [];
  };

  const linkChildToMe = async (email) => {
    const response = await api.post("/parent-child/me/children", {
      childEmail: email,
    });

    return response.data;
  };

  const loadChildSensoryProfile = useCallback(async (childId) => {
    try {
      if (!childId) {
        setSensoryProfile(null);
        return;
      }

      const data = await getChildSensoryProfile(childId);
      setSensoryProfile(data || null);
    } catch (error) {
      console.error(
        "Error cargando perfil sensorial:",
        error.response?.data || error,
      );
      setSensoryProfile(null);
    }
  }, []);

  const getChildFirstName = (child) => {
    return child?.firstName || child?.first_name || child?.name || "Niño";
  };

  const getChildLastName = (child) => {
    return child?.lastName || child?.last_name || "";
  };

  const getChildFullName = (child) => {
    return `${getChildFirstName(child)} ${getChildLastName(child)}`.trim();
  };

  const saveSelectedChild = (child) => {
    if (!child) {
      localStorage.removeItem("selectedChild");
      window.dispatchEvent(new Event("selectedChildChanged"));
      return;
    }

    localStorage.setItem("selectedChild", JSON.stringify(child));
    window.dispatchEvent(new Event("selectedChildChanged"));
  };

  const getStoredSelectedChild = () => {
    try {
      const storedChild = localStorage.getItem("selectedChild");
      return storedChild ? JSON.parse(storedChild) : null;
    } catch (error) {
      localStorage.removeItem("selectedChild");
      return null;
    }
  };

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);

      if (user?.role === "parent") {
        const childrenData = await getMyChildren();
        setChildren(childrenData);

        if (childrenData.length > 0) {
          const storedChild = getStoredSelectedChild();

          const childToSelect =
            childrenData.find(
              (child) => String(child.id) === String(storedChild?.id),
            ) || childrenData[0];

          setSelectedChild(childToSelect);
          saveSelectedChild(childToSelect);

          const dashboardData = await getChildDashboard(childToSelect.id);
          setDashboard(dashboardData);
          await loadChildSensoryProfile(childToSelect.id);
        } else {
          setSelectedChild(null);
          setDashboard(null);
          setSensoryProfile(null);
          saveSelectedChild(null);
        }

        return;
      }

      const dashboardData = await getMyDashboard();
      setDashboard(dashboardData);
    } catch (error) {
      console.error(
        "Error cargando panel de padres:",
        error.response?.data || error,
      );
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, loadChildSensoryProfile]);

  useEffect(() => {
    if (user?.id) {
      cargarDatos();
    }
  }, [user?.id, cargarDatos]);

  const handleChildChange = async (e) => {
    const childId = e.target.value;
    const child = children.find((item) => String(item.id) === String(childId));

    if (!child) return;

    setSelectedChild(child);
    setLoading(true);
    saveSelectedChild(child);

    try {
      const dashboardData = await getChildDashboard(child.id);
      setDashboard(dashboardData);
      await loadChildSensoryProfile(child.id);
    } catch (error) {
      console.error(
        "Error cargando dashboard del niño:",
        error.response?.data || error,
      );
      alert("No fue posible cargar el dashboard del niño");
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

      const result = await linkChildToMe(childEmail.trim());
      const linkedChild = result.child;

      alert(`${getChildFirstName(linkedChild)} fue asociado correctamente`);

      const updatedChildren = await getMyChildren();
      setChildren(updatedChildren);

      const childToSelect =
        updatedChildren.find(
          (child) => String(child.id) === String(linkedChild?.id),
        ) || updatedChildren[0];

      if (childToSelect) {
        setSelectedChild(childToSelect);
        saveSelectedChild(childToSelect);

        const dashboardData = await getChildDashboard(childToSelect.id);
        setDashboard(dashboardData);
        await loadChildSensoryProfile(childToSelect.id);
      }

      setChildEmail("");
    } catch (error) {
      console.error("ERROR ASOCIANDO:", error.response?.data || error);
      alert(error.response?.data?.message || "No fue posible asociar al niño");
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedChild || isDownloadingPdf) return;

    try {
      setIsDownloadingPdf(true);

      const response = await api.get(`/report/children/${selectedChild.id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "floflo-report.pdf");

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando PDF:", error);
      alert("No se pudo descargar el PDF. Inténtalo nuevamente.");
    } finally {
      setIsDownloadingPdf(false);
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

          {user?.role === "parent" ? (
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
          ) : (
            <p className="text-gray-500">
              Esta sección está pensada para cuidadores o padres.
            </p>
          )}
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

              <div className="mt-4 flex flex-col md:flex-row gap-3 mb-4">
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
                      {getChildFullName(child)}
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

          <button
            onClick={handleDownloadReport}
            disabled={isDownloadingPdf || !selectedChild}
            className={`bg-purple-600 text-white px-5 py-3 rounded-2xl font-bold shadow-md transition flex items-center justify-center gap-2 ${
              isDownloadingPdf
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-purple-700"
            }`}
          >
            {isDownloadingPdf ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Generando PDF...
              </>
            ) : (
              <>📄 Descargar PDF</>
            )}
          </button>
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
        {user?.role === "parent" && selectedChild && (
          <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-purple-700">
                  Perfil sensorial de {getChildFirstName(selectedChild)}
                </h2>

                <p className="text-gray-500 mt-1">
                  Resumen rápido para anticipar apoyos y evitar sobrecargas.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold w-fit">
                  🧩 Perfil sensorial
                </span>

                <Link
                  to="/perfil-sensorial"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition w-fit"
                >
                  Ver perfil completo
                </Link>
              </div>
            </div>

            {hasSensoryProfileData(sensoryProfile) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SensoryCard
                  title="Sensibilidades principales"
                  emoji="⚡"
                  items={[
                    {
                      label: "Ruido",
                      value: sensoryProfile?.noise_sensitivity,
                    },
                    { label: "Luz", value: sensoryProfile?.light_sensitivity },
                    {
                      label: "Texturas",
                      value: sensoryProfile?.texture_sensitivity,
                    },
                    {
                      label: "Multitudes",
                      value: sensoryProfile?.crowd_sensitivity,
                    },
                  ]}
                />

                <SensoryCard
                  title="Cosas que ayudan"
                  emoji="🧸"
                  items={[
                    {
                      label: "Objetos calmantes",
                      value: sensoryProfile?.calming_items,
                    },
                    {
                      label: "Actividades calmantes",
                      value: sensoryProfile?.calming_activities,
                    },
                  ]}
                />

                <SensoryCard
                  title="Señales de estrés"
                  emoji="🚦"
                  items={[
                    { label: "Señales", value: sensoryProfile?.stress_signals },
                  ]}
                />

                <SensoryCard
                  title="Estrategias de apoyo"
                  emoji="💜"
                  items={[
                    {
                      label: "Estrategias",
                      value: sensoryProfile?.support_strategies,
                    },
                    { label: "Notas", value: sensoryProfile?.notes },
                  ]}
                />
              </div>
            ) : (
              <div className="bg-purple-50 rounded-2xl p-5">
                <p className="text-gray-600">
                  Este niño todavía no tiene un perfil sensorial completado.
                </p>

                <p className="text-purple-600 text-sm font-semibold mt-2">
                  Cuando lo complete desde su cuenta, aparecerá aquí para el
                  cuidador.
                </p>
              </div>
            )}
          </section>
        )}

        {dashboard.weeklySupportPlan && (
          <WeeklySupportPlanCard plan={dashboard.weeklySupportPlan} />
        )}

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
                <AlertCard
                  key={`${alert.title || "alert"}-${index}`}
                  alert={alert}
                />
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
                  key={`${recommendation.title || "recommendation"}-${index}`}
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
      <p className="text-4xl font-bold text-purple-600 mt-2">{valor ?? 0}</p>
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
  const bgColor = "bg-purple-50";

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
const WeeklySupportPlanCard = ({ plan }) => {
  const days = Array.isArray(plan?.days) ? plan.days : [];
  const tips = Array.isArray(plan?.tips) ? plan.tips : [];

  if (!plan) return null;

  return (
    <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-6">
        <div>
          <p className="text-sm font-bold text-purple-500 mb-1">
            🗓️ Plan de apoyo semanal
          </p>

          <h2 className="text-2xl font-bold text-purple-700">
            {plan.title || "Plan de apoyo semanal"}
          </h2>

          <p className="text-gray-600 mt-2">
            {plan.focus ||
              "Reforzar avances pequeños y acompañar la semana con calma."}
          </p>
        </div>

        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold w-fit">
          Semana sugerida
        </span>
      </div>

      {days.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map((day) => (
            <article
              key={day.day}
              className="bg-purple-50 rounded-2xl p-4 border border-purple-100"
            >
              <div className="text-3xl mb-2">{day.icon || "✨"}</div>

              <p className="text-sm font-bold text-purple-600">{day.day}</p>

              <h3 className="font-bold text-gray-700 mt-1">{day.title}</h3>

              <p className="text-gray-600 text-sm mt-2">{day.action}</p>

              {day.reason && (
                <p className="text-purple-500 text-xs font-semibold mt-3">
                  {day.reason}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          Todavía no hay suficientes datos para armar un plan semanal.
        </p>
      )}

      {tips.length > 0 && (
        <div className="mt-6 bg-green-50 rounded-2xl p-5 border border-green-100">
          <h3 className="font-bold text-gray-700 mb-3">
            Consejos rápidos para esta semana
          </h3>

          <div className="space-y-2">
            {tips.map((tip, index) => (
              <p key={`${tip}-${index}`} className="text-gray-600 text-sm">
                ✅ {tip}
              </p>
            ))}
          </div>
        </div>
      )}
    </section>
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
const hasText = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

const hasSensoryProfileData = (profile) => {
  if (!profile) return false;

  return [
    profile.noise_sensitivity,
    profile.light_sensitivity,
    profile.texture_sensitivity,
    profile.crowd_sensitivity,
    profile.calming_items,
    profile.calming_activities,
    profile.stress_signals,
    profile.support_strategies,
    profile.notes,
  ].some(hasText);
};

const SensoryCard = ({ title, emoji, items }) => {
  const visibleItems = items.filter((item) => hasText(item.value));

  if (visibleItems.length === 0) return null;

  return (
    <article className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
      <div className="text-3xl mb-3">{emoji}</div>

      <h3 className="text-lg font-bold text-gray-700 mb-3">{title}</h3>

      <div className="space-y-3">
        {visibleItems.map((item) => (
          <div key={item.label}>
            <p className="text-sm font-bold text-purple-600">{item.label}</p>
            <p className="text-gray-600 text-sm mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
};

export default PanelPadres;
