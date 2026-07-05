import { useEffect, useState } from "react";
import { getMe, updateMe, changePassword } from "../services/authService";
import { useFloFlo } from "../context/FloFloContext";
import { useFeedback } from "../context/FeedbackContext";
import { formatRut, cleanRut } from "../utils/formatRut";

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

const MiPerfil = () => {
  const { setUser } = useFloFlo();
  const { showFeedback } = useFeedback();

  const [user, setProfileUser] = useState(null);
  const [editing, setEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rut, setRut] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await getMe();

      setProfileUser(data);
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setRut(data.rut || "");
      setBirthDate(data.birth_date ? data.birth_date.slice(0, 10) : "");
      setAvatar(null);
      setPreview(getAvatarUrl(data.avatar) || "");
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo cargar el perfil",
        message: "Intenta nuevamente en unos segundos.",
      });
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setAvatar(null);
      return;
    }

    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!firstName.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Nombre obligatorio",
        message: "Debes ingresar tu nombre antes de guardar.",
      });
      return;
    }

    if (!lastName.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Apellido obligatorio",
        message: "Debes ingresar tu apellido antes de guardar.",
      });
      return;
    }

    try {
      const formData = new FormData();

      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("rut", cleanRut(rut));
      formData.append("birth_date", birthDate || "");

      if (avatar instanceof File) {
        formData.append("avatar", avatar);
      }

      const updatedUser = await updateMe(formData);

      const safeUpdatedUser = {
        ...user,
        ...updatedUser,
      };

      setProfileUser(safeUpdatedUser);
      setUser(safeUpdatedUser);
      localStorage.setItem("user", JSON.stringify(safeUpdatedUser));

      setEditing(false);

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Cambios guardados",
        title: "Perfil actualizado",
        message: "Tu información se guardó correctamente.",
      });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo actualizar",
        message: "Revisa los datos e intenta nuevamente.",
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!currentPassword.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Contraseña actual obligatoria",
        message: "Debes ingresar tu contraseña actual.",
      });
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Contraseña débil",
        title: "Revisa tu nueva contraseña",
        message:
          "La nueva contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula y número.",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Revisa la contraseña",
        title: "Las contraseñas no coinciden",
        message: "La nueva contraseña y su confirmación deben ser iguales.",
      });
      return;
    }

    try {
      setChangingPassword(true);

      await changePassword(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Contraseña actualizada",
        title: "Tu clave fue cambiada",
        message: "La contraseña de tu cuenta se actualizó correctamente.",
      });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo cambiar la contraseña",
        message:
          error.message || "Revisa tu contraseña actual e intenta nuevamente.",
      });
    } finally {
      setChangingPassword(false);
    }
  };
  const getAvatarUrl = (avatarValue) => {
    if (!avatarValue) return null;

    const avatarString = String(avatarValue).trim();

    if (!avatarString) return null;

    if (avatarString.startsWith("http")) {
      return avatarString;
    }

    if (avatarString.startsWith("/uploads")) {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const backendBase = apiBase.replace("/api", "");

      return `${backendBase}${avatarString}`;
    }

    return null;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6F0FF] flex justify-center items-center text-[#4B367C] font-bold">
        Cargando perfil...
      </div>
    );
  }
  const avatarUrl = getAvatarUrl(user.avatar);

  return (
    <div className="min-h-screen bg-[#F6F0FF] py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-lg p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#4B367C]">
              Mi Perfil
            </h1>

            <p className="text-[#6B5A95] mt-2">
              Revisa y actualiza tu información de FloFlo.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-semibold px-6 py-3 rounded-full transition"
            >
              Editar perfil
            </button>
          )}
        </div>

        {!editing ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FDFBFF] border border-[#E4D8FF] rounded-2xl p-5">
                  <p className="text-gray-500">Nombre</p>
                  <p className="text-xl font-semibold">{user.firstName}</p>
                </div>

                <div className="bg-[#FDFBFF] border border-[#E4D8FF] rounded-2xl p-5">
                  <p className="text-gray-500">Apellido</p>
                  <p className="text-xl font-semibold">{user.lastName}</p>
                </div>

                <div className="bg-[#FDFBFF] border border-[#E4D8FF] rounded-2xl p-5 md:col-span-2">
                  <p className="text-gray-500">Correo</p>
                  <p className="text-xl font-semibold break-all">
                    {user.email}
                  </p>
                </div>

                <div className="bg-[#FDFBFF] border border-[#E4D8FF] rounded-2xl p-5">
                  <p className="text-gray-500">Rol</p>

                  <p
                    className={`inline-block mt-2 px-4 py-2 rounded-full font-bold ${
                      user.role === "parent"
                        ? "bg-[#CFEFD9] text-[#2F6B4F] border border-[#9ED5B3]"
                        : "bg-[#E8DDFF] text-[#6B4FC3] border border-[#D6C7FF]"
                    }`}
                  >
                    {user.role === "parent" ? "Padre/Cuidador" : "Niño"}
                  </p>
                </div>

                <div className="bg-[#FDFBFF] border border-[#E4D8FF] rounded-2xl p-5">
                  <p className="text-gray-500">Rut</p>

                  <p className="text-xl font-semibold">
                    {user.rut ? formatRut(user.rut) : "No registrado"}
                  </p>
                </div>

                <div className="bg-[#FDFBFF] border border-[#E4D8FF] rounded-2xl p-5">
                  <p className="text-gray-500">Fecha nacimiento</p>

                  <p className="text-xl font-semibold">
                    {user.birth_date
                      ? new Date(user.birth_date).toLocaleDateString()
                      : "No registrada"}
                  </p>
                </div>

                <div className="bg-[#FDFBFF] border border-[#E4D8FF] rounded-2xl p-5 md:col-span-2">
                  <p className="text-gray-500">Miembro desde</p>

                  <p className="text-xl font-semibold">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "No registrado"}
                  </p>
                </div>
              </div>

              <div className="bg-[#F3ECFF] border-2 border-[#E4D8FF] rounded-[2rem] p-8 text-center">
                <p className="text-[#6B5A95] font-semibold mb-5">Avatar</p>

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar usuario"
                    onError={() => {
                      setProfileUser((prev) =>
                        prev ? { ...prev, avatar: null } : prev,
                      );
                    }}
                    className="w-44 h-44 mx-auto rounded-full object-cover border-4 border-[#DCCCF8] shadow-md"
                  />
                ) : (
                  <div className="w-44 h-44 mx-auto rounded-full border-4 border-[#DCCCF8] bg-white flex items-center justify-center text-[#6B5A95] font-bold">
                    Sin avatar
                  </div>
                )}

                <h2 className="text-2xl font-bold text-[#4B367C] mt-5">
                  {user.firstName} {user.lastName}
                </h2>

                <p className="text-[#6B5A95] mt-2">Perfil de FloFlo</p>
              </div>
            </div>

            <div className="bg-[#FDFBFF] border border-[#E4D8FF] rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-[#4B367C]">
                Seguridad de la cuenta
              </h2>

              <p className="text-[#6B5A95] mt-2 mb-6">
                Cambia tu contraseña para mantener protegida tu información en
                FloFlo.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <input
                  id="perfil-password-actual"
                  name="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Contraseña actual"
                  className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
                />

                <input
                  id="perfil-password-nueva"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
                />

                <p className="text-sm text-[#6B5A95]">
                  Mínimo 8 caracteres, con mayúscula, minúscula y número.
                </p>

                <input
                  id="perfil-password-confirmar"
                  name="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirmar nueva contraseña"
                  className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
                />

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-[#9B7BE8] hover:bg-[#8B6FD6] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-full transition"
                >
                  {changingPassword ? "Cambiando..." : "Cambiar contraseña"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10"
          >
            <div className="space-y-6">
              <input
                id="perfil-nombre"
                name="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nombre"
                className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
              />

              <input
                id="perfil-apellido"
                name="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellido"
                className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
              />
              
              <input
                id="perfil-rut"
                name="rut"
                type="text"
                value={formatRut(rut)}
                onChange={(e) => setRut(cleanRut(e.target.value))}
                placeholder="Rut"
                className="w-full border-b border-gray-300 bg-transparent py-3 text-gray-900 focus:border-[#9B7BE8] focus:outline-none"
              />

              <input
                id="perfil-fecha-nacimiento"
                name="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
              />

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-semibold px-6 py-3 rounded-full transition"
                >
                  Guardar cambios
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    loadProfile();
                  }}
                  className="border border-gray-300 text-gray-600 font-semibold px-6 py-3 rounded-full transition"
                >
                  Cancelar
                </button>
              </div>
            </div>

            <div className="bg-[#F3ECFF] border-2 border-[#E4D8FF] rounded-[2rem] p-8 text-center">
              <p className="text-[#6B5A95] font-semibold mb-5">Avatar</p>

              {preview && (
                <img
                  src={preview}
                  alt="Avatar"
                  onError={() => setPreview("")}
                  className="w-44 h-44 mx-auto rounded-full object-cover mb-5 border-4 border-[#DCCCF8] shadow-md"
                />
              )}

              <input
                id="perfil-avatar"
                name="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="w-full py-3 text-gray-900"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MiPerfil;
