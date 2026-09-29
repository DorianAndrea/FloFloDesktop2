import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFloFlo } from "../context/FloFloContext";
import { useFeedback } from "../context/FeedbackContext";
import api from "../services/api";
import { validateImageFile } from "../utils/validateImageFile";
import { useSelectedChild } from "../context/SelectedChildContext";

const getAvatarUrl = (avatarValue) => {
  if (!avatarValue) return null;

  const avatarString = String(avatarValue).trim();

  if (!avatarString) return null;

  if (avatarString.startsWith("http")) {
    return avatarString;
  }

  if (avatarString.startsWith("/uploads")) {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    const backendBase = apiBase.replace(/\/api\/?$/, "");

    return `${backendBase}${avatarString}`;
  }

  return null;
};

const MiFamilia = () => {
  const { user } = useFloFlo();
  const { showFeedback } = useFeedback();
  const { selectChild, parentChildren, loadingChildren } = useSelectedChild();
  const caregiverRelationshipKeys = ["primary_caregiver", "caregiver"];

  const hasCaregiverRelationship = parentChildren.some((child) =>
    caregiverRelationshipKeys.includes(child.relationship_key),
  );

  const hasAnyChildRelationship = parentChildren.length > 0;

  const canManageFamily =
    user?.role === "parent" &&
    (!hasAnyChildRelationship || hasCaregiverRelationship);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [childFirstName, setChildFirstName] = useState("");
  const [childLastName, setChildLastName] = useState("");
  const [childBirthDate, setChildBirthDate] = useState("");
  const [childAvatar, setChildAvatar] = useState(null);
  const [childAvatarPreview, setChildAvatarPreview] = useState("");

  const getMyChildren = async () => {
    const response = await api.get("/parent-child/me/children");

    return Array.isArray(response.data)
      ? response.data
      : response.data.children || [];
  };

  const loadChildren = async () => {
    try {
      setLoading(true);
      const data = await getMyChildren();

      const caregiverChildren = data.filter((child) =>
        caregiverRelationshipKeys.includes(child.relationship_key),
      );

      setChildren(caregiverChildren);
    } catch (error) {
      console.error("Error cargando familia:", error.response?.data || error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No pudimos cargar tu familia",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && canManageFamily && !loadingChildren) {
      loadChildren();
    }
  }, [user?.id, canManageFamily, loadingChildren]);

  const handleChildAvatarChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setChildAvatar(null);
      setChildAvatarPreview("");
      return;
    }

    const validation = validateImageFile(file);

    if (!validation.isValid) {
      e.target.value = "";
      setChildAvatar(null);
      setChildAvatarPreview("");

      showFeedback(validation.feedback);

      return;
    }

    setChildAvatar(file);
    setChildAvatarPreview(URL.createObjectURL(file));
  };

  const resetCreateForm = () => {
    setChildFirstName("");
    setChildLastName("");
    setChildBirthDate("");
    setChildAvatar(null);
    setChildAvatarPreview("");
  };

  const handleCreateChild = async (event) => {
    event.preventDefault();

    try {
      const cleanFirstName = childFirstName.trim();
      const cleanLastName = childLastName.trim();

      if (!cleanFirstName) {
        showFeedback({
          type: "warning",
          icon: "⚠️",
          label: "Falta información",
          title: "Ingresa el nombre",
          message: "El nombre del niño/a es obligatorio.",
        });

        return;
      }

      setIsCreatingChild(true);

      const formData = new FormData();

      formData.append("firstName", cleanFirstName);
      formData.append("lastName", cleanLastName);
      formData.append("birthDate", childBirthDate || "");

      if (childAvatar instanceof File) {
        formData.append("avatar", childAvatar);
      }

      const response = await api.post("/parent-child/me/children", formData);

      const createdChild = response.data.child;

      setChildren((currentChildren) => [...currentChildren, createdChild]);

      resetCreateForm();
      setShowCreateForm(false);

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Perfil creado",
        title: "Niño/a agregado correctamente",
        message: `${createdChild.firstName} ya forma parte de tu familia en FloFlo.`,
      });
    } catch (error) {
      console.error(
        "Error creando perfil infantil:",
        error.response?.data || error,
      );

      showFeedback({
        type: "error",
        icon: "❌",
        label: "No se pudo crear",
        title: "No pudimos agregar al niño/a",
        message: error.response?.data?.message || "Intenta nuevamente.",
      });
    } finally {
      setIsCreatingChild(false);
    }
  };

  const getChildFullName = (child) => {
    return `${child?.firstName || ""} ${child?.lastName || ""}`.trim();
  };

  const getChildAge = (birthDate) => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const monthDifference = today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age -= 1;
    }

    return age;
  };

  if (!user || loadingChildren) {
    return (
      <p className="text-center mt-10">
        Cargando familia...
      </p>
    );
  }

  if (!canManageFamily) {
    return (
      <main className="min-h-screen bg-purple-50 p-6">
        <section className="max-w-5xl mx-auto bg-white rounded-3xl p-6 shadow-md text-center">
          <h1 className="text-3xl font-bold text-purple-700 mb-3">
            Mi familia
          </h1>

          <p className="text-gray-600">
            Esta sección está disponible para cuentas cuidadoras.
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
            <p className="text-sm font-bold text-purple-500 mb-1">👨‍👩‍👧‍👦 Familia</p>

            <h1 className="text-3xl font-extrabold text-purple-700">
              Mi familia
            </h1>

            <p className="text-gray-600 mt-2">
              Administra los perfiles infantiles asociados a tu cuenta.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm((current) => !current)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold shadow-md transition"
          >
            {showCreateForm ? "Cancelar" : "+ Agregar niño/a"}
          </button>
        </div>

        {showCreateForm && (
          <form
            onSubmit={handleCreateChild}
            className="bg-white rounded-3xl p-6 shadow-md border border-purple-100 mb-8"
          >
            <h2 className="text-2xl font-bold text-purple-700 mb-2">
              Crear perfil infantil
            </h2>

            <p className="text-gray-500 mb-6">
              El niño/a no necesita correo ni contraseña para usar FloFlo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre *
                </label>

                <input
                  type="text"
                  value={childFirstName}
                  onChange={(event) => setChildFirstName(event.target.value)}
                  placeholder="Ej: Martina"
                  className="w-full border border-purple-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Apellido
                </label>

                <input
                  type="text"
                  value={childLastName}
                  onChange={(event) => setChildLastName(event.target.value)}
                  placeholder="Rodríguez"
                  className="w-full border border-purple-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Fecha de nacimiento
                </label>

                <input
                  type="date"
                  value={childBirthDate}
                  onChange={(event) => setChildBirthDate(event.target.value)}
                  className="w-full border border-purple-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Foto de perfil
                </label>

                <div className="bg-[#F3ECFF] border-2 border-[#E4D8FF] rounded-3xl p-6 text-center">
                  {childAvatarPreview ? (
                    <img
                      src={childAvatarPreview}
                      alt="Foto del niño/a"
                      className="w-36 h-36 mx-auto rounded-full object-cover mb-5 border-4 border-[#DCCCF8] shadow-md"
                    />
                  ) : (
                    <div className="w-36 h-36 mx-auto rounded-full border-4 border-[#DCCCF8] bg-white flex items-center justify-center text-[#6B5A95] font-bold mb-5">
                      Sin foto
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleChildAvatarChange}
                    className="w-full py-3 text-gray-900"
                  />

                  <p className="text-sm text-gray-500 mt-2">
                    Puedes elegir una foto desde tu dispositivo.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isCreatingChild}
                className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition ${
                  isCreatingChild ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isCreatingChild ? "Creando perfil..." : "Crear perfil"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl p-8 shadow-md text-center">
            <p className="text-gray-500">Cargando familia...</p>
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 shadow-md border border-purple-100 text-center">
            <div className="text-5xl mb-4">👨‍👩‍👧</div>

            <h2 className="text-2xl font-bold text-purple-700">
              Todavía no hay perfiles infantiles
            </h2>

            <p className="text-gray-500 mt-2">
              Agrega el primer niño/a para comenzar a personalizar su
              experiencia en FloFlo.
            </p>

            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="mt-5 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold"
            >
              + Agregar niño/a
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {children.map((child) => {
              const age = getChildAge(child.birthDate);

              return (
                <article
                  key={child.id}
                  className="bg-white rounded-3xl p-6 shadow-md border border-purple-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center overflow-hidden text-3xl">
                      {getAvatarUrl(child.avatar) ? (
                        <img
                          src={getAvatarUrl(child.avatar)}
                          alt={getChildFullName(child)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "🧒"
                      )}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-extrabold text-gray-700">
                        {getChildFullName(child)}
                      </h2>

                      {age !== null && (
                        <p className="text-gray-500 mt-1">
                          {age} {age === 1 ? "año" : "años"}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        {child.relationship_key === "primary_caregiver" && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            Cuidador principal
                          </span>
                        )}

                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                          Perfil activo
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    <Link
                      to="/panel-padres"
                      onClick={() => selectChild(child.id)}
                      className="text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-bold transition"
                    >
                      Ver progreso
                    </Link>

                    <Link
                      to="/equipo-floflo"
                      onClick={() => selectChild(child.id)}
                      className="text-center bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-4 py-3 rounded-xl font-bold transition"
                    >
                      Equipo FloFlo
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default MiFamilia;
