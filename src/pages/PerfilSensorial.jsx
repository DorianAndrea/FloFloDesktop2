import { useEffect, useState } from "react";
import { useFloFlo } from "../context/FloFloContext";
import {
  getMySensoryProfile,
  saveMySensoryProfile,
  getChildSensoryProfile,
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
  console.log("PerfilSensorial montado");
  const { user } = useFloFlo();

  const [profile, setProfile] = useState(emptyProfile);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isParent = user?.role === "parent";
  const isChild = user?.role === "child";

  const hasProfileData = fields.some((field) => profile[field.name]?.trim());

  const normalizeProfile = (data) => {
    if (!data) return emptyProfile;

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
          setProfile(emptyProfile);
          return;
        }

        const data = await getChildSensoryProfile(child.id);
        setProfile(normalizeProfile(data));
        return;
      }

      const data = await getMySensoryProfile();
      setProfile(normalizeProfile(data));
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
              sobrecarga y estrategias que ayudan.
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
          <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-purple-100">
            <h2 className="text-2xl font-bold text-purple-700 mb-6">
              Resumen sensorial
            </h2>

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
        )}

        {isChild && !isEditing && hasProfileData && (
          <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-purple-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-purple-700">
                Mi resumen sensorial
              </h2>

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
        )}

        {isChild && (!hasProfileData || isEditing) && (
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-purple-100"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-purple-700">
                {hasProfileData
                  ? "Editar perfil sensorial"
                  : "Completar perfil"}
              </h2>

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
        )}
      </section>
    </main>
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

export default PerfilSensorial;
