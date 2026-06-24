import { useEffect, useState } from "react";
import { useFloFlo } from "../context/FloFloContext";
import {
  getMySensoryProfile,
  saveMySensoryProfile,
  getChildSensoryProfile,
  getMySensoryProfileHistory,
  getChildSensoryProfileHistory,
} from "../services/sensoryProfileService";

const emptyProfile = {
  noise_sensitivity: "",
  light_sensitivity: "",
  texture_sensitivity: "",
  crowd_sensitivity: "",
  calming_items: "",
  calming_activities: "",
  stress_signals: "",
  support_strategies: "",
  notes: "",
  updated_at: null,
};

const fields = [
  {
    name: "noise_sensitivity",
    label: "Sensibilidad al ruido",
    placeholder: "Ej: Le molestan aspiradoras, gritos o bocinas.",
  },
  {
    name: "light_sensitivity",
    label: "Sensibilidad a la luz",
    placeholder: "Ej: Prefiere luces suaves o cálidas.",
  },
  {
    name: "texture_sensitivity",
    label: "Sensibilidad a texturas",
    placeholder: "Ej: No tolera etiquetas, telas ásperas o ciertas comidas.",
  },
  {
    name: "crowd_sensitivity",
    label: "Sensibilidad a multitudes",
    placeholder: "Ej: Se incomoda en lugares con mucha gente.",
  },
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
    name: "stress_signals",
    label: "Señales de sobrecarga",
    placeholder: "Ej: Se tapa los oídos, llora, se aleja, se queda callado.",
  },
  {
    name: "support_strategies",
    label: "Estrategias que funcionan",
    placeholder: "Ej: Anticipar cambios, hablar con calma, dar pausas.",
  },
  {
    name: "notes",
    label: "Notas generales",
    placeholder:
      "Ej: Reacciona mejor cuando se le avisa antes de cambiar de actividad.",
  },
];

const PerfilSensorial = () => {
  const { user } = useFloFlo();

  const [profile, setProfile] = useState(emptyProfile);
  const [history, setHistory] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isParent = user?.role === "parent";
  const isChild = user?.role === "child";

  const hasProfileData = fields.some((field) => profile[field.name]?.trim());
  const lastUpdatedAt = profile.updated_at || history[0]?.created_at || null;

  const normalizeProfile = (data) => {
    if (!data) return { ...emptyProfile };

    return {
      noise_sensitivity: data.noise_sensitivity || "",
      light_sensitivity: data.light_sensitivity || "",
      texture_sensitivity: data.texture_sensitivity || "",
      crowd_sensitivity: data.crowd_sensitivity || "",
      calming_items: data.calming_items || "",
      calming_activities: data.calming_activities || "",
      stress_signals: data.stress_signals || "",
      support_strategies: data.support_strategies || "",
      notes: data.notes || "",
      updated_at: data.updated_at || null,
    };
  };

  const getStoredChild = () => {
    const stored = localStorage.getItem("selectedChild");

    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch (error) {
      localStorage.removeItem("selectedChild");
      return null;
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

      if (isParent) {
        const child = getStoredChild();
        setSelectedChild(child);

        if (!child?.id) {
          setProfile({ ...emptyProfile });
          setHistory([]);
          return;
        }

        const [profileData, historyData] = await Promise.all([
          getChildSensoryProfile(child.id),
          getChildSensoryProfileHistory(child.id),
        ]);

        setProfile(normalizeProfile(profileData));
        setHistory(Array.isArray(historyData) ? historyData : []);
        return;
      }

      const [profileData, historyData] = await Promise.all([
        getMySensoryProfile(),
        getMySensoryProfileHistory(),
      ]);

      setProfile(normalizeProfile(profileData));
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      console.error("Error cargando perfil sensorial:", error);
      alert("No fue posible cargar el perfil sensorial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }

    const handleSelectedChildChanged = () => {
      if (user?.role === "parent") {
        loadProfile();
      }
    };

    window.addEventListener("selectedChildChanged", handleSelectedChildChanged);

    return () => {
      window.removeEventListener(
        "selectedChildChanged",
        handleSelectedChildChanged,
      );
    };
  }, [user]);

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

      await saveMySensoryProfile(profile);

      alert("Perfil sensorial guardado correctamente");
      setIsEditing(false);
      await loadProfile();
    } catch (error) {
      console.error("Error guardando perfil sensorial:", error);
      alert("No fue posible guardar el perfil sensorial");
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
                {selectedChild
                  ? `${selectedChild.firstName || ""} ${
                      selectedChild.lastName || ""
                    }`
                  : "un niño seleccionado"}
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
              Padres para ver su perfil sensorial.
            </p>
          </div>
        )}

        {isParent && selectedChild && (
          <>
            <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-purple-100">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-purple-700">
                  Resumen sensorial actual
                </h2>

                <LastUpdatedInfo date={lastUpdatedAt} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {fields.map((field) => (
                  <InfoCard
                    key={field.name}
                    title={field.label}
                    value={profile[field.name]}
                  />
                ))}
              </div>
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

                  <LastUpdatedInfo date={lastUpdatedAt} />
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
                {fields.map((field) => (
                  <InfoCard
                    key={field.name}
                    title={field.label}
                    value={profile[field.name]}
                  />
                ))}
              </div>
            </div>
            <CompareSensoryVersions
              currentProfile={profile}
              previousProfile={previousProfile}
            />

            <HistorySection history={history} />
          </>
        )}

        {isChild && (!hasProfileData || isEditing) && (
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

                  <LastUpdatedInfo date={lastUpdatedAt} />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-bold text-purple-700 mb-2">
                      {field.label}
                    </label>

                    <textarea
                      name={field.name}
                      value={profile[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full border border-purple-200 rounded-2xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                ))}
              </div>

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
const LastUpdatedInfo = ({ date }) => {
  if (!date) {
    return (
      <p className="text-sm text-gray-500 mt-2">
        Última actualización: sin registros todavía.
      </p>
    );
  }

  const formattedDate = new Date(date).toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <p className="text-sm text-gray-500 mt-2">
      Última actualización:{" "}
      <span className="font-bold text-purple-700">{formattedDate}</span>
    </p>
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
    item.noise_sensitivity ||
    item.light_sensitivity ||
    item.texture_sensitivity ||
    item.crowd_sensitivity ||
    item.notes ||
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SmallInfo title="Ruido" value={item.noise_sensitivity} />
            <SmallInfo title="Luz" value={item.light_sensitivity} />
            <SmallInfo title="Texturas" value={item.texture_sensitivity} />
            <SmallInfo title="Multitudes" value={item.crowd_sensitivity} />
            <SmallInfo title="Objetos calmantes" value={item.calming_items} />
            <SmallInfo
              title="Actividades calmantes"
              value={item.calming_activities}
            />
            <SmallInfo title="Señales" value={item.stress_signals} />
            <SmallInfo title="Estrategias" value={item.support_strategies} />
          </div>

          {item.notes && (
            <div className="mt-4 bg-white rounded-xl p-4 border border-purple-100">
              <p className="text-sm font-bold text-purple-700 mb-1">Notas</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {item.notes}
              </p>
            </div>
          )}
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
