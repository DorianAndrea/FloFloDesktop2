import { useEffect, useState } from "react";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import {
  getMySensoryProfile,
  saveMySensoryProfile,
  getChildSensoryProfile,
  getMySensoryProfileHistory,
  getChildSensoryProfileHistory,
  saveChildSensoryProfile,
  updateChildSensoryProfile,
  updateMySensoryProfile,
} from "../services/sensoryProfileService";
import { getCachedData, setCachedData } from "../utils/cache";

const emptyProfile = {
  noise_sensitivity: "",
  light_sensitivity: "",
  texture_sensitivity: "",
  crowd_sensitivity: "",
  touch_sensitivity: "",
  smell_sensitivity: "",
  food_sensitivity: "",
  unexpected_changes: "",
  waiting_sensitivity: "",
  calming_items: "",
  calming_activities: "",
  stress_signals: "",
  support_strategies: "",
  notes: "",

  created_by: null,
  creator_access_profile: "",
  creator_relationship_key: "",
  creator_first_name: "",
  creator_last_name: "",

  updated_by: null,
  updater_access_profile: "",
  updater_relationship_key: "",
  updater_first_name: "",
  updater_last_name: "",

  created_at: null,
  updated_at: null,
};

const fieldGroups = [
  {
    title: "Sensibilidades",
    emoji: "🧩",
    description:
      "Registra estímulos sensoriales que pueden incomodar, sobrecargar o requerir adaptación.",
    fields: [
      {
        name: "noise_sensitivity",
        label: "Sensibilidad al ruido",
        placeholder:
          "Ej: Le molestan aspiradoras, gritos, bocinas o ambientes ruidosos.",
      },
      {
        name: "light_sensitivity",
        label: "Sensibilidad a la luz",
        placeholder:
          "Ej: Prefiere luces suaves o le molestan luces directas o intensas.",
      },
      {
        name: "texture_sensitivity",
        label: "Sensibilidad a texturas",
        placeholder:
          "Ej: No tolera etiquetas, telas ásperas, lana o ciertas texturas.",
      },
      {
        name: "crowd_sensitivity",
        label: "Sensibilidad a multitudes",
        placeholder:
          "Ej: Se incomoda en lugares con mucha gente o espacios llenos.",
      },
      {
        name: "touch_sensitivity",
        label: "Contacto físico",
        placeholder:
          "Ej: Prefiere que le avisen antes de abrazarlo/a o tocarlo/a.",
      },
      {
        name: "smell_sensitivity",
        label: "Olores",
        placeholder:
          "Ej: Le incomodan perfumes, comida con olor fuerte o productos de limpieza.",
      },
      {
        name: "food_sensitivity",
        label: "Alimentación y texturas de comida",
        placeholder:
          "Ej: Prefiere alimentos suaves, evita mezclas o rechaza ciertas texturas.",
      },
    ],
  },
  {
    title: "Situaciones difíciles",
    emoji: "⏳",
    description:
      "Registra momentos que pueden generar frustración, incomodidad o necesidad de anticipación.",
    fields: [
      {
        name: "unexpected_changes",
        label: "Cambios inesperados",
        placeholder:
          "Ej: Le cuesta cuando cambia una rutina, salida o actividad sin aviso.",
      },
      {
        name: "waiting_sensitivity",
        label: "Esperas prolongadas",
        placeholder:
          "Ej: Se frustra o se inquieta cuando debe esperar mucho tiempo.",
      },
    ],
  },
  {
    title: "Apoyos que ayudan",
    emoji: "🌿",
    description:
      "Registra objetos, actividades y estrategias que favorecen calma, regulación y seguridad.",
    fields: [
      {
        name: "calming_items",
        label: "Objetos que ayudan a calmar",
        placeholder: "Ej: Audífonos, peluche, manta, juguete favorito.",
      },
      {
        name: "calming_activities",
        label: "Actividades que ayudan",
        placeholder: "Ej: Respirar con Félix, música tranquila, dibujar.",
      },
      {
        name: "support_strategies",
        label: "Estrategias que funcionan",
        placeholder: "Ej: Anticipar cambios, hablar con calma, dar pausas.",
      },
    ],
  },
  {
    title: "Observaciones",
    emoji: "📝",
    description:
      "Registra señales observables y notas generales útiles para padres, cuidadores o profesionales.",
    fields: [
      {
        name: "stress_signals",
        label: "Señales de sobrecarga",
        placeholder:
          "Ej: Se tapa los oídos, llora, se aleja, aletea o se queda callado/a.",
      },
      {
        name: "notes",
        label: "Notas generales",
        placeholder:
          "Ej: Reacciona mejor cuando se le avisa antes de cambiar de actividad.",
      },
    ],
  },
];

const fields = fieldGroups.flatMap((group) => group.fields);

const getRoleLabel = (relationshipKey, accessProfile) => {
  const role = relationshipKey || accessProfile;

  if (!role) return "";

  const labels = {
    child: "Niño/a",
    primary_caregiver: "Cuidador principal",
    caregiver: "Cuidador/a",
    family: "Familiar",
    therapist: "Terapeuta",
    occupational_therapist: "Terapeuta ocupacional",
    psychologist: "Psicólogo/a",
    speech_therapist: "Fonoaudiólogo/a",
    special_educator: "Educador/a diferencial",
    teacher: "Profesor/a",
    professional: "Profesional",
  };

  return (
    labels[role] ||
    String(role)
      .replaceAll("_", " ")
      .replace(/^./, (letter) => letter.toUpperCase())
  );
};

const getFullName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(" ");
};

const PerfilSensorial = () => {
  const { user } = useFloFlo();
  const {
    isParent,
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,
    selectedAccessProfile,
  } = useSelectedChild();

  const { showFeedback } = useFeedback();

  const [profile, setProfile] = useState(emptyProfile);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isChild = user?.role === "child";

  const childName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "un niño seleccionado";

  const canEditProfile =
    isChild ||
    (isParent &&
      Boolean(selectedChildId) &&
      [
        "primary_caregiver",
        "caregiver",
        "therapist",
        "teacher",
        "professional",
      ].includes(selectedAccessProfile));

  const hasProfileData = fields.some((field) => profile[field.name]?.trim());
  const lastUpdatedAt = profile.updated_at || history[0]?.created_at || null;

  const normalizeProfile = (data) => {
    if (!data) return { ...emptyProfile };

    const normalized = fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: data[field.name] || "",
      }),
      {},
    );

    return {
      ...normalized,

      created_by: data.created_by || null,
      creator_access_profile: data.creator_access_profile || "",
      creator_relationship_key: data.creator_relationship_key || "",
      creator_first_name: data.creator_first_name || "",
      creator_last_name: data.creator_last_name || "",

      updated_by: data.updated_by || null,
      updater_access_profile: data.updater_access_profile || "",
      updater_relationship_key: data.updater_relationship_key || "",
      updater_first_name: data.updater_first_name || "",
      updater_last_name: data.updater_last_name || "",

      created_at: data.created_at || null,
      updated_at: data.updated_at || null,
    };
  };

  const getSensoryProfileCacheKey = (childId = null) => {
    if (!user?.id) return null;

    if (isParent && childId) {
      return `floflo_sensory_profile_${user.id}_${childId}`;
    }

    return `floflo_sensory_profile_${user.id}`;
  };

  const applySensoryProfileData = (profileData, historyData) => {
    setProfile(normalizeProfile(profileData));
    setHistory(Array.isArray(historyData) ? historyData : []);
  };

  const fetchSensoryProfileData = async (childId = null) => {
    if (isParent && childId) {
      const [profileData, historyData] = await Promise.all([
        getChildSensoryProfile(childId),
        getChildSensoryProfileHistory(childId),
      ]);

      return {
        profileData,
        historyData: Array.isArray(historyData) ? historyData : [],
      };
    }

    const [profileData, historyData] = await Promise.all([
      getMySensoryProfile(),
      getMySensoryProfileHistory(),
    ]);

    return {
      profileData,
      historyData: Array.isArray(historyData) ? historyData : [],
    };
  };

  const loadProfile = async ({ useCache = true } = {}) => {
    let hasCache = false;

    try {
      if (!user?.id) return;

      if (isParent && loadingChildren) return;

      if (isParent) {
        if (!selectedChildId) {
          setProfile({ ...emptyProfile });
          setHistory([]);
          setLoading(false);
          return;
        }

        const cacheKey = getSensoryProfileCacheKey(selectedChildId);
        const cachedData =
          useCache && cacheKey ? getCachedData(cacheKey) : null;

        if (cachedData) {
          hasCache = true;
          applySensoryProfileData(
            cachedData.profileData,
            cachedData.historyData,
          );
          setLoading(false);
        } else {
          setLoading(true);
        }

        const freshData = await fetchSensoryProfileData(selectedChildId);

        applySensoryProfileData(freshData.profileData, freshData.historyData);

        if (cacheKey) {
          setCachedData(cacheKey, freshData);
        }

        return;
      }

      const cacheKey = getSensoryProfileCacheKey();
      const cachedData = useCache && cacheKey ? getCachedData(cacheKey) : null;

      if (cachedData) {
        hasCache = true;
        applySensoryProfileData(cachedData.profileData, cachedData.historyData);
        setLoading(false);
      } else {
        setLoading(true);
      }

      const freshData = await fetchSensoryProfileData();

      applySensoryProfileData(freshData.profileData, freshData.historyData);

      if (cacheKey) {
        setCachedData(cacheKey, freshData);
      }
    } catch (error) {
      console.error("Error cargando perfil sensorial:", error);

      if (!hasCache) {
        setProfile({ ...emptyProfile });
        setHistory([]);
      }

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo cargar el perfil",
        message:
          "No fue posible cargar el perfil sensorial. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && !loadingChildren) {
      setIsEditing(false);
      loadProfile();
    }
  }, [user?.id, user?.role, isParent, selectedChildId, loadingChildren]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const { updated_at, ...payload } = profile;

      if (isParent) {
        if (!selectedChildId) {
          showFeedback({
            type: "warning",
            icon: "⚠️",
            label: "Falta selección",
            title: "No hay niño/a seleccionado",
            message:
              "Selecciona un niño/a desde el Panel de Apoyo para ver su perfil sensorial.",
          });
          return;
        }

        if (hasProfileData) {
          await updateChildSensoryProfile(selectedChildId, payload);
        } else {
          await saveChildSensoryProfile(selectedChildId, payload);
        }
      } else {
        if (hasProfileData) {
          await updateMySensoryProfile(payload);
        } else {
          await saveMySensoryProfile(payload);
        }
      }

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Cambios guardados",
        title: "Perfil sensorial actualizado",
        message: isParent
          ? `La información sensorial de ${childName} fue guardada correctamente.`
          : "La información sensorial fue guardada correctamente.",
      });

      setIsEditing(false);
      await loadProfile({ useCache: false });
    } catch (error) {
      console.error("Error guardando perfil sensorial:", error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo guardar",
        message:
          error.response?.data?.message ||
          "No fue posible guardar el perfil sensorial. Intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const previousProfile = history?.[1] || null;
  if (loading) {
    return <p className="text-center mt-10">Cargando perfil sensorial...</p>;
  }

  return (
    <main className="min-h-screen bg-purple-50 px-6 py-10">
      <section className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-700 mb-3">
            Perfil Sensorial
          </h1>

          {isParent ? (
            <p className="text-gray-600">
              Estás viendo el perfil sensorial de{" "}
              <span className="font-bold text-purple-700">
                {selectedChild ? childName : "un niño seleccionado"}
              </span>
              .
            </p>
          ) : (
            <p className="text-gray-600">
              Registra información importante sobre sensibilidades, señales de
              sobrecarga y estrategias que ayudan. Cada vez que guardes, FloFlo
              conservará una versión en el historial.
            </p>
          )}
        </div>

        {isParent && !selectedChild && (
          <div className="bg-white rounded-3xl shadow-md p-6 border border-purple-100">
            <p className="text-gray-600">
              No hay un niño seleccionado. Selecciona un niño desde el Panel de
              Apoyo para ver su perfil sensorial.
            </p>
          </div>
        )}

        {isParent && selectedChild && !isEditing && hasProfileData && (
          <>
            <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-purple-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-purple-700">
                    Resumen sensorial actual
                  </h2>

                  <LastUpdatedInfo date={lastUpdatedAt} profile={profile} />
                </div>

                {canEditProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-md w-fit"
                  >
                    Editar perfil
                  </button>
                )}
              </div>

              <FieldGroupsView profile={profile} />
            </div>
            <CompareSensoryVersions
              currentProfile={profile}
              previousProfile={previousProfile}
            />

            <HistorySection history={history} />
          </>
        )}

        {isChild && !isEditing && hasProfileData && (
          <>
            <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-purple-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-purple-700">
                    Mi resumen sensorial actual
                  </h2>

                  <LastUpdatedInfo date={lastUpdatedAt} profile={profile} />
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-md w-fit"
                >
                  Editar perfil
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldGroupsView profile={profile} />
              </div>
            </div>
            <CompareSensoryVersions
              currentProfile={profile}
              previousProfile={previousProfile}
            />

            <HistorySection history={history} />
          </>
        )}

        {isParent && selectedChild && !canEditProfile && !hasProfileData && (
          <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-purple-100">
            <p className="text-gray-600">
              Todavía no hay información registrada en el perfil sensorial de{" "}
              <span className="font-bold text-purple-700">{childName}</span>.
            </p>
          </div>
        )}

        {canEditProfile && (!hasProfileData || isEditing) && (
          <>
            <form
              onSubmit={handleSave}
              className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-purple-100"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-purple-700">
                    {hasProfileData
                      ? "Editar perfil sensorial"
                      : "Completar perfil"}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Al guardar, esta versión quedará registrada en el historial
                    sensorial.
                  </p>

                  <LastUpdatedInfo date={lastUpdatedAt} profile={profile} />
                </div>

                {hasProfileData && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                    className="bg-white text-purple-700 border border-purple-200 px-5 py-3 rounded-xl font-bold shadow-sm w-fit"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <FieldGroupsForm profile={profile} onChange={handleChange} />

              <button
                type="submit"
                disabled={saving}
                className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-md disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar perfil sensorial"}
              </button>
            </form>

            <CompareSensoryVersions
              currentProfile={profile}
              previousProfile={previousProfile}
            />

            <HistorySection history={history} />
          </>
        )}
      </section>
    </main>
  );
};
const FieldGroupSection = ({ group, profile, mode = "view", onChange }) => {
  return (
    <section className="bg-white rounded-3xl border border-purple-100 shadow-sm p-5 md:p-6">
      <div className="mb-5">
        <p className="text-sm font-bold text-purple-500 mb-1">
          {group.emoji} {group.title}
        </p>

        <p className="text-sm text-gray-500">{group.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {group.fields.map((field) =>
          mode === "edit" ? (
            <div key={field.name}>
              <label className="block text-sm font-bold text-purple-700 mb-2">
                {field.label}
              </label>

              <textarea
                name={field.name}
                value={profile[field.name] || ""}
                onChange={onChange}
                placeholder={field.placeholder}
                rows={4}
                className="w-full border border-purple-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          ) : (
            <InfoCard
              key={field.name}
              title={field.label}
              value={profile[field.name]}
            />
          ),
        )}
      </div>
    </section>
  );
};

const FieldGroupsView = ({ profile }) => {
  return (
    <div className="space-y-6">
      {fieldGroups.map((group) => (
        <FieldGroupSection
          key={group.title}
          group={group}
          profile={profile}
          mode="view"
        />
      ))}
    </div>
  );
};

const FieldGroupsForm = ({ profile, onChange }) => {
  return (
    <div className="space-y-6">
      {fieldGroups.map((group) => (
        <FieldGroupSection
          key={group.title}
          group={group}
          profile={profile}
          mode="edit"
          onChange={onChange}
        />
      ))}
    </div>
  );
};
const LastUpdatedInfo = ({ date, profile }) => {
  if (!date) {
    return (
      <p className="mt-2 text-sm text-gray-500">
        Última actualización: sin registros todavía.
      </p>
    );
  }

  const formattedDate = new Date(date).toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const updaterRole = getRoleLabel(
    profile?.updater_relationship_key || profile?.creator_relationship_key,
    profile?.updater_access_profile || profile?.creator_access_profile,
  );

  const updaterName = getFullName(
    profile?.updater_first_name || profile?.creator_first_name,
    profile?.updater_last_name || profile?.creator_last_name,
  );

  return (
    <div className="mt-2">
      <p className="text-sm text-gray-500">
        Última actualización:{" "}
        <span className="font-bold text-purple-700">{formattedDate}</span>
      </p>

      {updaterRole && (
        <p className="mt-2 inline-flex rounded-full bg-[#E8F1FF] px-3 py-1 text-sm font-bold text-[#345A8A]">
          ✏️ Actualizado por: {updaterRole}
          {updaterName ? ` · ${updaterName}` : ""}
        </p>
      )}
    </div>
  );
};

const InfoCard = ({ title, value }) => {
  return (
    <article className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
      <h3 className="font-bold text-purple-700 mb-2">{title}</h3>

      <p className="text-gray-600 whitespace-pre-line">
        {value || "Sin información registrada todavía."}
      </p>
    </article>
  );
};

const HistorySection = ({ history }) => {
  const hasHistory = Array.isArray(history) && history.length > 0;

  return (
    <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-purple-100 mt-8">
      <div className="mb-6">
        <p className="text-sm font-bold text-purple-500 mb-1">
          🕒 Historial sensorial
        </p>

        <h2 className="text-2xl font-bold text-purple-700">
          Versiones guardadas
        </h2>

        <p className="text-gray-600 mt-2">
          Aquí se guardan las versiones anteriores del perfil sensorial para ver
          su evolución en el tiempo.
        </p>
      </div>

      {!hasHistory ? (
        <p className="text-gray-500">
          Todavía no hay versiones guardadas en el historial.
        </p>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <HistoryCard key={item.id || index} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

const CompareSensoryVersions = ({ currentProfile, previousProfile }) => {
  if (!previousProfile) {
    return (
      <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-purple-100 mt-8">
        <p className="text-sm font-bold text-purple-500 mb-1">
          🔍 Comparación sensorial
        </p>

        <h2 className="text-2xl font-bold text-purple-700 mb-2">
          Cambios respecto a la versión anterior
        </h2>

        <p className="text-gray-500">
          Todavía se necesita al menos una versión anterior para comparar
          cambios.
        </p>
      </div>
    );
  }

  const changes = fields
    .map((field) => {
      const currentValue = currentProfile[field.name]?.trim() || "";
      const previousValue = previousProfile[field.name]?.trim() || "";

      if (currentValue === previousValue) return null;

      return {
        label: field.label,
        before: previousValue || "Sin información registrada",
        after: currentValue || "Sin información registrada",
      };
    })
    .filter(Boolean);

  return (
    <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-purple-100 mt-8">
      <p className="text-sm font-bold text-purple-500 mb-1">
        🔍 Comparación sensorial
      </p>

      <h2 className="text-2xl font-bold text-purple-700 mb-2">
        Cambios respecto a la versión anterior
      </h2>

      <p className="text-gray-600 mb-6">
        Esta sección muestra qué cambió entre el perfil sensorial actual y la
        versión anterior guardada.
      </p>

      {changes.length === 0 ? (
        <p className="text-gray-500">
          No se detectaron cambios respecto a la versión anterior.
        </p>
      ) : (
        <div className="space-y-4">
          {changes.map((change) => (
            <article
              key={change.label}
              className="bg-purple-50 rounded-2xl p-5 border border-purple-100"
            >
              <h3 className="font-bold text-purple-700 mb-3">{change.label}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-sm font-bold text-gray-500 mb-1">Antes</p>
                  <p className="text-gray-600 whitespace-pre-line">
                    {change.before}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <p className="text-sm font-bold text-green-700 mb-1">Ahora</p>
                  <p className="text-gray-600 whitespace-pre-line">
                    {change.after}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
const HistoryCard = ({ item, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const date = item.created_at
    ? new Date(item.created_at).toLocaleString("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Fecha no disponible";

  const mainSummary =
    fields.map((field) => item[field.name]).find((value) => value?.trim()) ||
    "Versión guardada del perfil sensorial.";

  return (
    <article className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-purple-700">
              Versión {index + 1} del perfil sensorial
            </h3>

            {index === 0 && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                Más reciente
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500">Guardada el {date}</p>
          {getRoleLabel(
            item.creator_relationship_key,
            item.creator_access_profile,
          ) && (
            <p className="mt-2 inline-flex rounded-full bg-[#EAF8EF] px-3 py-1 text-sm font-bold text-[#2F6B4F]">
              👤 Versión registrada por:{" "}
              {getRoleLabel(
                item.creator_relationship_key,
                item.creator_access_profile,
              )}
              {getFullName(item.creator_first_name, item.creator_last_name)
                ? ` · ${getFullName(
                    item.creator_first_name,
                    item.creator_last_name,
                  )}`
                : ""}
            </p>
          )}

          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {mainSummary}
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
          <div className="space-y-5">
            {fieldGroups.map((group) => (
              <section
                key={group.title}
                className="bg-white rounded-2xl p-4 border border-purple-100"
              >
                <p className="text-sm font-bold text-purple-700 mb-3">
                  {group.emoji} {group.title}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.fields.map((field) => (
                    <SmallInfo
                      key={field.name}
                      title={field.label}
                      value={item[field.name]}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

const SmallInfo = ({ title, value }) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-purple-100">
      <p className="text-sm font-bold text-purple-700 mb-1">{title}</p>

      <p className="text-sm text-gray-600 whitespace-pre-line">
        {value || "Sin información"}
      </p>
    </div>
  );
};

export default PerfilSensorial;
