import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFloFlo } from "../context/FloFloContext";
import { useFeedback } from "../context/FeedbackContext";
import api from "../services/api";
import { getChildSensoryProfile } from "../services/sensoryProfileService";
import {
  getChildWeeklySupportPlanHistory,
  getChildEvolutionDashboard,
} from "../services/parentDashboardService";
import { getCachedData, setCachedData } from "../utils/cache";

const PanelPadres = () => {
  const { user } = useFloFlo();
  const { showFeedback } = useFeedback();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [sensoryProfile, setSensoryProfile] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [weeklyPlanHistory, setWeeklyPlanHistory] = useState([]);
  const [evolutionDashboard, setEvolutionDashboard] = useState(null);

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

  const loadWeeklyPlanHistory = useCallback(async (childId) => {
    try {
      if (!childId) {
        setWeeklyPlanHistory([]);
        return;
      }

      const data = await getChildWeeklySupportPlanHistory(childId);
      setWeeklyPlanHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Error cargando historial del plan semanal:",
        error.response?.data || error,
      );
      setWeeklyPlanHistory([]);
    }
  }, []);

  const loadEvolutionDashboard = useCallback(async (childId) => {
    try {
      if (!childId) {
        setEvolutionDashboard(null);
        return;
      }

      const data = await getChildEvolutionDashboard(childId);
      setEvolutionDashboard(data || null);
    } catch (error) {
      console.error(
        "Error cargando dashboard de evolución:",
        error.response?.data || error,
      );
      setEvolutionDashboard(null);
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
  const relationshipLabels = {
    primary_caregiver: "Cuidador/a principal",
    caregiver: "Cuidador/a",
    family: "Familiar",
    occupational_therapist: "Terapeuta ocupacional",
    psychologist: "Psicólogo/a",
    speech_therapist: "Fonoaudiólogo/a",
    teacher: "Profesor/a",
    other_professional: "Otro profesional",
  };

  const currentRelationshipLabel =
    relationshipLabels[selectedChild?.relationship_key] || "Adulto/a de apoyo";

  const canManageTeam =
    selectedChild?.relationship_key === "primary_caregiver" ||
    selectedChild?.can_manage_team === true;
  const getPanelCacheKey = (childId = null) => {
    if (!user?.id) return null;

    if (user?.role === "parent" && childId) {
      return `floflo_parent_panel_${user.id}_${childId}`;
    }

    return `floflo_parent_panel_${user.id}`;
  };

  const applyPanelCache = (cachedPanel) => {
    if (!cachedPanel) return false;

    setDashboard(cachedPanel.dashboard || null);
    setSensoryProfile(cachedPanel.sensoryProfile || null);
    setWeeklyPlanHistory(
      Array.isArray(cachedPanel.weeklyPlanHistory)
        ? cachedPanel.weeklyPlanHistory
        : [],
    );
    setEvolutionDashboard(cachedPanel.evolutionDashboard || null);
    setLoading(false);

    return true;
  };

  const fetchChildPanelData = async (childId) => {
    const [dashboardData, sensoryData, weeklyHistoryData, evolutionData] =
      await Promise.all([
        getChildDashboard(childId),
        getChildSensoryProfile(childId).catch((error) => {
          console.error(
            "Error cargando perfil sensorial:",
            error.response?.data || error,
          );
          return null;
        }),
        getChildWeeklySupportPlanHistory(childId).catch((error) => {
          console.error(
            "Error cargando historial del plan semanal:",
            error.response?.data || error,
          );
          return [];
        }),
        getChildEvolutionDashboard(childId).catch((error) => {
          console.error(
            "Error cargando dashboard de evolución:",
            error.response?.data || error,
          );
          return null;
        }),
      ]);

    return {
      dashboard: dashboardData,
      sensoryProfile: sensoryData || null,
      weeklyPlanHistory: Array.isArray(weeklyHistoryData)
        ? weeklyHistoryData
        : [],
      evolutionDashboard: evolutionData || null,
    };
  };

  const applyChildPanelData = (panelData) => {
    setDashboard(panelData.dashboard || null);
    setSensoryProfile(panelData.sensoryProfile || null);
    setWeeklyPlanHistory(
      Array.isArray(panelData.weeklyPlanHistory)
        ? panelData.weeklyPlanHistory
        : [],
    );
    setEvolutionDashboard(panelData.evolutionDashboard || null);
  };

  const saveSelectedChild = (child) => {
    if (!child) {
      localStorage.removeItem("selectedChild");
      localStorage.removeItem("floflo_selected_child_id");
      window.dispatchEvent(new Event("selectedChildChanged"));
      return;
    }

    localStorage.setItem("selectedChild", JSON.stringify(child));
    localStorage.setItem("floflo_selected_child_id", String(child.id));
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
      if (!user?.id) return;

      setLoading(true);

      if (user?.role === "parent") {
        const childrenCacheKey = `floflo_parent_children_${user.id}`;
        const cachedChildren = getCachedData(childrenCacheKey);

        if (Array.isArray(cachedChildren)) {
          setChildren(cachedChildren);
        }

        const storedChild = getStoredSelectedChild();

        if (storedChild?.id) {
          const cachedPanel = getCachedData(getPanelCacheKey(storedChild.id));

          if (cachedPanel) {
            setSelectedChild(storedChild);
            applyPanelCache(cachedPanel);
          }
        }

        const childrenData = await getMyChildren();
        setChildren(childrenData);
        setCachedData(childrenCacheKey, childrenData);

        if (childrenData.length > 0) {
          const childToSelect =
            childrenData.find(
              (child) => String(child.id) === String(storedChild?.id),
            ) || childrenData[0];

          setSelectedChild(childToSelect);
          saveSelectedChild(childToSelect);

          const panelData = await fetchChildPanelData(childToSelect.id);

          applyChildPanelData(panelData);

          const panelCacheKey = getPanelCacheKey(childToSelect.id);

          if (panelCacheKey) {
            setCachedData(panelCacheKey, panelData);
          }
        } else {
          setSelectedChild(null);
          setDashboard(null);
          setSensoryProfile(null);
          setWeeklyPlanHistory([]);
          setEvolutionDashboard(null);
          saveSelectedChild(null);
        }

        return;
      }

      const cacheKey = getPanelCacheKey();
      const cachedPanel = getCachedData(cacheKey);

      if (cachedPanel) {
        applyPanelCache(cachedPanel);
      }

      const dashboardData = await getMyDashboard();

      const panelData = {
        dashboard: dashboardData,
        sensoryProfile: null,
        weeklyPlanHistory: [],
        evolutionDashboard: null,
      };

      applyChildPanelData(panelData);

      if (cacheKey) {
        setCachedData(cacheKey, panelData);
      }
    } catch (error) {
      console.error(
        "Error cargando panel de padres:",
        error.response?.data || error,
      );

      setDashboard(null);
      setWeeklyPlanHistory([]);
      setEvolutionDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

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
    saveSelectedChild(child);

    const cacheKey = getPanelCacheKey(child.id);
    const cachedPanel = getCachedData(cacheKey);

    if (cachedPanel) {
      applyPanelCache(cachedPanel);
    } else {
      setLoading(true);
    }

    try {
      const panelData = await fetchChildPanelData(child.id);

      applyChildPanelData(panelData);

      if (cacheKey) {
        setCachedData(cacheKey, panelData);
      }
    } catch (error) {
      console.error(
        "Error cargando dashboard del niño:",
        error.response?.data || error,
      );

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo cargar el dashboard",
        message: "No fue posible cargar la información del niño seleccionado.",
      });
    } finally {
      setLoading(false);
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

      showFeedback({
        type: "success",
        icon: "📄",
        label: "Reporte descargado",
        title: "PDF generado correctamente",
        message: "El reporte de FloFlo fue descargado en tu computador.",
      });
    } catch (error) {
      console.error("Error descargando PDF:", error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo descargar el PDF",
        message: "Inténtalo nuevamente en unos segundos.",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!user) {
    return <p className="text-center mt-10">Cargando usuario...</p>;
  }

  if (user.role !== "parent") {
    return (
      <main className="min-h-screen bg-purple-50 p-6">
        <section className="max-w-5xl mx-auto bg-white rounded-3xl p-6 shadow-md text-center">
          <h1 className="text-3xl font-bold text-purple-700 mb-3">
            Acceso solo para cuidadores
          </h1>

          <p className="text-gray-600">
            Esta sección está disponible solo para cuentas de padre, madre o
            cuidador.
          </p>
        </section>
      </main>
    );
  }

  if (loading) {
    return <p className="text-center mt-10">Cargando panel...</p>;
  }

  if (!dashboard) {
    return (
      <main className="min-h-screen bg-purple-50 p-6">
        <section className="max-w-5xl mx-auto bg-white rounded-3xl p-6 shadow-md">
          <h1 className="text-3xl font-bold text-purple-700 mb-3">
            Panel de Apoyo
          </h1>

          <p className="text-gray-600">
            No hay información disponible para el niño/a seleccionado todavía.
          </p>
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
              Panel de Apoyo
            </h1>

            <p className="text-gray-600">
              {selectedChild
                ? `Acompañas a ${getChildFirstName(selectedChild)} como ${currentRelationshipLabel}.`
                : "Revisa el avance general del niño en FloFlo."}
            </p>
          </div>

          {user?.role === "parent" && (
            <div className="mt-4">
              <label className="block text-sm font-bold text-purple-700 mb-2">
                Niño seleccionado
              </label>

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
            className={`bg-gradient-to-r from-violet-200 via-purple-100 to-teal-100 
  text-purple-800 px-5 py-3 rounded-2xl font-bold shadow-md 
  border border-purple-200 transition flex items-center justify-center gap-2 ${
    isDownloadingPdf || !selectedChild
      ? "opacity-60 cursor-not-allowed"
      : "hover:from-violet-300 hover:via-purple-200 hover:to-teal-200 hover:scale-[1.01]"
  }`}
          >
            {isDownloadingPdf ? (
              <>
                <span className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></span>
                Generando PDF...
              </>
            ) : (
              <>📄 Descargar reporte general</>
            )}
          </button>
        </div>

        {selectedChild && (
          <Link
            to="/equipo-floflo"
            className="mb-8 block rounded-[2rem] border-2 border-[#DCCCF8] bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3ECFF] text-4xl">
                  🤝
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-[#4B367C]">
                    Equipo FloFlo
                  </h2>

                  <p className="mt-1 text-gray-600">
                    {canManageTeam
                      ? `Administra a las personas que acompañan a ${getChildFirstName(selectedChild)}.`
                      : `Revisa quiénes forman parte del Equipo FloFlo de ${getChildFirstName(selectedChild)}.`}
                  </p>
                </div>
              </div>

              <span className="rounded-2xl bg-[#9B7BE8] px-5 py-3 text-center font-extrabold text-white">
                Ver equipo
              </span>
            </div>
          </Link>
        )}

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
        {dashboard.wellnessStatus && (
          <WellnessStatusCard status={dashboard.wellnessStatus} />
        )}

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
                    {
                      label: "Luz",
                      value: sensoryProfile?.light_sensitivity,
                    },
                    {
                      label: "Texturas",
                      value: sensoryProfile?.texture_sensitivity,
                    },
                    {
                      label: "Multitudes",
                      value: sensoryProfile?.crowd_sensitivity,
                    },
                    {
                      label: "Contacto físico",
                      value: sensoryProfile?.touch_sensitivity,
                    },
                    {
                      label: "Olores",
                      value: sensoryProfile?.smell_sensitivity,
                    },
                    {
                      label: "Alimentación",
                      value: sensoryProfile?.food_sensitivity,
                    },
                    {
                      label: "Cambios inesperados",
                      value: sensoryProfile?.unexpected_changes,
                    },
                    {
                      label: "Esperas prolongadas",
                      value: sensoryProfile?.waiting_sensitivity,
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

        {user?.role === "parent" && selectedChild && (
          <WeeklySupportPlanHistory history={weeklyPlanHistory} />
        )}

        {user?.role === "parent" && selectedChild && (
          <EvolutionDashboard data={evolutionDashboard} />
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
            Alertas de apoyo
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
const WellnessStatusCard = ({ status }) => {
  if (!status) return null;

  const reasons = Array.isArray(status.reasons) ? status.reasons : [];

  const styles = {
    green: {
      card: "bg-green-50 border-green-200",
      badge: "bg-green-100 text-green-700",
      title: "text-green-700",
    },
    yellow: {
      card: "bg-yellow-50 border-yellow-200",
      badge: "bg-yellow-100 text-yellow-700",
      title: "text-yellow-700",
    },
    red: {
      card: "bg-red-50 border-red-200",
      badge: "bg-red-100 text-red-700",
      title: "text-red-700",
    },
  };

  const currentStyle = styles[status.level] || styles.yellow;

  return (
    <section
      className={`mt-10 rounded-3xl p-6 shadow-md border ${currentStyle.card}`}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-gray-500 mb-1">
            Semáforo de bienestar
          </p>

          <h2 className={`text-2xl font-bold ${currentStyle.title}`}>
            {status.icon || "🟡"} {status.title || "Requiere observación"}
          </h2>

          <p className="text-gray-600 mt-2">
            {status.message ||
              "Resumen general del estado actual según los registros recientes."}
          </p>
        </div>

        <span
          className={`px-4 py-2 rounded-full text-sm font-bold w-fit ${currentStyle.badge}`}
        >
          Puntaje: {status.score ?? 0}
        </span>
      </div>

      {reasons.length > 0 && (
        <div className="mt-5">
          <h3 className="font-bold text-gray-700 mb-3">Motivos principales</h3>

          <div className="space-y-2">
            {reasons.map((reason, index) => (
              <p key={`${reason}-${index}`} className="text-gray-600 text-sm">
                • {reason}
              </p>
            ))}
          </div>
        </div>
      )}

      {status.suggestedAction && (
        <div className="mt-5 bg-white/70 rounded-2xl p-4 border border-white">
          <h3 className="font-bold text-gray-700 mb-1">Acción sugerida</h3>

          <p className="text-gray-600 text-sm">{status.suggestedAction}</p>
        </div>
      )}
    </section>
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
const WeeklySupportPlanHistory = ({ history }) => {
  const hasHistory = Array.isArray(history) && history.length > 0;

  return (
    <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
      <div className="mb-6">
        <p className="text-sm font-bold text-purple-500 mb-1">
          📚 Historial de planes semanales
        </p>

        <h2 className="text-2xl font-bold text-purple-700">
          Planes anteriores
        </h2>

        <p className="text-gray-600 mt-2">
          Aquí se guardan los planes sugeridos para cada semana. FloFlo conserva
          un plan por niño y por semana.
        </p>
      </div>

      {!hasHistory ? (
        <p className="text-gray-500">
          Todavía no hay planes semanales guardados.
        </p>
      ) : (
        <div className="space-y-4">
          {history.map((record, index) => (
            <WeeklySupportPlanHistoryCard
              key={record.id || index}
              record={record}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const WeeklySupportPlanHistoryCard = ({ record, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const plan =
    typeof record.plan === "string" ? JSON.parse(record.plan) : record.plan;

  const days = Array.isArray(plan?.days) ? plan.days : [];
  const tips = Array.isArray(plan?.tips) ? plan.tips : [];

  const weekDate = record.week_start
    ? new Date(record.week_start).toLocaleDateString("es-CL", {
        dateStyle: "medium",
      })
    : "Semana no disponible";

  const updatedDate = record.updated_at
    ? new Date(record.updated_at).toLocaleString("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <article className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-purple-700">Semana del {weekDate}</h3>

            {index === 0 && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                Más reciente
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500">
            {updatedDate
              ? `Actualizado el ${updatedDate}`
              : "Sin fecha de actualización"}
          </p>

          <p className="text-gray-600 mt-3">
            {record.focus ||
              plan?.focus ||
              "Plan semanal guardado para acompañar avances."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="bg-white text-purple-700 border border-purple-200 px-4 py-2 rounded-xl font-bold shadow-sm w-fit hover:bg-purple-100 transition"
        >
          {isOpen ? "Ocultar detalle" : "Ver detalle"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5">
          {days.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {days.map((day) => (
                <article
                  key={day.day}
                  className="bg-white rounded-2xl p-4 border border-purple-100"
                >
                  <div className="text-3xl mb-2">{day.icon || "✨"}</div>

                  <p className="text-sm font-bold text-purple-600">{day.day}</p>

                  <h4 className="font-bold text-gray-700 mt-1">{day.title}</h4>

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
            <p className="text-gray-500">Este plan no tiene días guardados.</p>
          )}

          {tips.length > 0 && (
            <div className="mt-6 bg-green-50 rounded-2xl p-5 border border-green-100">
              <h4 className="font-bold text-gray-700 mb-3">Consejos rápidos</h4>

              <div className="space-y-2">
                {tips.map((tip, tipIndex) => (
                  <p
                    key={`${tip}-${tipIndex}`}
                    className="text-gray-600 text-sm"
                  >
                    ✅ {tip}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

const EvolutionDashboard = ({ data }) => {
  const sensoryEvolution = data?.sensoryEvolution;
  const emotionalEvolution = Array.isArray(data?.emotionalEvolution)
    ? data.emotionalEvolution
    : [];
  const importantChanges = Array.isArray(data?.importantChanges)
    ? data.importantChanges
    : [];
  const repeatedSupports = Array.isArray(data?.repeatedSupports)
    ? data.repeatedSupports
    : [];
  const usefulStrategies = Array.isArray(data?.usefulStrategies)
    ? data.usefulStrategies
    : [];

  const totalVersions = Number(sensoryEvolution?.totalVersions || 0);

  const lastUpdatedAt = sensoryEvolution?.lastUpdatedAt
    ? new Date(sensoryEvolution.lastUpdatedAt).toLocaleString("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <section className="mt-10 bg-white rounded-3xl p-6 shadow-md border border-purple-100">
      <div className="mb-6">
        <p className="text-sm font-bold text-purple-500 mb-1">
          📈 Dashboard de evolución
        </p>

        <h2 className="text-2xl font-bold text-purple-700">
          Evolución y cambios importantes
        </h2>

        <p className="text-gray-600 mt-2">
          Resumen de cambios sensoriales, emocionales y apoyos que se repiten en
          el tiempo.
        </p>
      </div>

      {!data ? (
        <p className="text-gray-500">
          Todavía no hay datos suficientes para mostrar evolución.
        </p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <EvolutionMiniCard
              emoji="🧩"
              title="Evolución sensorial"
              value={`${totalVersions} versión(es)`}
              description={
                lastUpdatedAt
                  ? `Última actualización: ${lastUpdatedAt}`
                  : "Sin historial sensorial todavía"
              }
            />

            <EvolutionMiniCard
              emoji="😊"
              title="Evolución emocional"
              value={`${emotionalEvolution.length} emoción(es)`}
              description="Comparación entre esta semana y la anterior"
            />

            <EvolutionMiniCard
              emoji="✨"
              title="Cambios importantes"
              value={`${importantChanges.length} cambio(s)`}
              description="Cambios recientes detectados en el perfil o plan"
            />
          </div>

          <EvolutionBlock title="Evolución emocional" emoji="😊">
            {emotionalEvolution.length > 0 ? (
              <div className="space-y-3">
                {emotionalEvolution.map((emotion) => (
                  <EmotionEvolutionItem
                    key={emotion.mood_name}
                    emotion={emotion}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Todavía no hay registros emocionales suficientes.
              </p>
            )}
          </EvolutionBlock>

          <EvolutionBlock title="Cambios recientes importantes" emoji="🚦">
            {importantChanges.length > 0 ? (
              <div className="space-y-3">
                {importantChanges.map((change, index) => (
                  <div
                    key={`${change.title}-${index}`}
                    className="bg-purple-50 rounded-2xl p-4 border border-purple-100"
                  >
                    <h4 className="font-bold text-gray-700">{change.title}</h4>

                    {change.before && (
                      <p className="text-gray-500 text-sm mt-2">
                        Antes: {change.before}
                      </p>
                    )}

                    <p className="text-purple-600 text-sm font-semibold mt-2">
                      Ahora: {change.after}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No hay cambios recientes importantes detectados.
              </p>
            )}
          </EvolutionBlock>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <EvolutionBlock title="Apoyos que se repiten más" emoji="🧸">
              {repeatedSupports.length > 0 ? (
                <TagList items={repeatedSupports} />
              ) : (
                <p className="text-gray-500 text-sm">
                  Todavía no hay apoyos repetidos registrados.
                </p>
              )}
            </EvolutionBlock>

            <EvolutionBlock
              title="Estrategias que aparecen como útiles"
              emoji="💜"
            >
              {usefulStrategies.length > 0 ? (
                <TagList items={usefulStrategies} />
              ) : (
                <p className="text-gray-500 text-sm">
                  Todavía no hay estrategias suficientes para comparar.
                </p>
              )}
            </EvolutionBlock>
          </div>
        </div>
      )}
    </section>
  );
};

const EvolutionMiniCard = ({ emoji, title, value, description }) => {
  return (
    <article className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
      <div className="text-3xl mb-3">{emoji}</div>

      <p className="text-sm font-bold text-purple-500">{title}</p>

      <h3 className="text-2xl font-bold text-gray-700 mt-1">{value}</h3>

      <p className="text-gray-500 text-sm mt-2">{description}</p>
    </article>
  );
};

const EvolutionBlock = ({ title, emoji, children }) => {
  return (
    <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm">
      <h3 className="text-lg font-bold text-purple-700 mb-4">
        {emoji} {title}
      </h3>

      {children}
    </div>
  );
};

const EmotionEvolutionItem = ({ emotion }) => {
  let statusText = "Estable";
  let statusClass = "bg-gray-100 text-gray-700";
  let icon = "➖";

  if (emotion.status === "increased") {
    statusText = "Aumentó";
    statusClass = "bg-yellow-100 text-yellow-700";
    icon = "↗️";
  }

  if (emotion.status === "decreased") {
    statusText = "Disminuyó";
    statusClass = "bg-green-100 text-green-700";
    icon = "↘️";
  }

  return (
    <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h4 className="font-bold text-gray-700">
            {icon} {emotion.mood_name}
          </h4>

          <p className="text-gray-500 text-sm mt-1">
            Esta semana: {emotion.current_week} · Semana anterior:{" "}
            {emotion.previous_week}
          </p>

          <p className="text-purple-600 text-sm font-semibold mt-1">
            {emotion.message}
          </p>
        </div>

        <span
          className={`${statusClass} px-4 py-2 rounded-full text-sm font-bold w-fit`}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
};

const TagList = ({ items }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item.label}-${index}`}
          className="bg-purple-100 text-purple-700 px-3 py-2 rounded-full text-sm font-bold"
        >
          {item.label} · {item.count}
        </span>
      ))}
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
