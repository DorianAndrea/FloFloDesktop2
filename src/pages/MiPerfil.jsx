import { useEffect, useState } from "react";
import { getMe, updateMe } from "../services/authService";
import { useFloFlo } from "../context/FloFloContext";
import { formatRut } from "../utils/formatRut";

const MiPerfil = () => {
  const { setUser } = useFloFlo();

  const [user, setProfileUser] = useState(null);
  const [editing, setEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rut, setRut] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [role, setRole] = useState("child");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");

  const loadProfile = async () => {
    try {
      const data = await getMe();
      setProfileUser(data);

      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setRut(data.rut || "");
      setBirthDate(data.birth_date ? data.birth_date.slice(0, 10) : "");
      setRole(data.role || "child");
      setAvatar(null);
      setPreview(data.avatar || "");
    } catch (error) {
      console.error(error);
    }
  };
  <option value="child">Niño</option>;
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
      alert("El nombre es obligatorio");
      return;
    }

    if (!lastName.trim()) {
      alert("El apellido es obligatorio");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("rut", rut.trim());
      formData.append("birth_date", birthDate || "");
      formData.append("role", role);

      if (avatar instanceof File) {
        formData.append("avatar", avatar);
      }

      console.log("ROLE QUE ENVÍO:", role);

      const updatedUser = await updateMe(formData);

      const safeUpdatedUser = {
        ...user,
        ...updatedUser,
        role,
      };

      setProfileUser(safeUpdatedUser);
      setUser(safeUpdatedUser);
      localStorage.setItem("user", JSON.stringify(safeUpdatedUser));

      setEditing(false);
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar perfil");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Cargando perfil...
      </div>
    );
  }

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
                <p className="text-xl font-semibold break-all">{user.email}</p>
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
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="bg-[#F3ECFF] border-2 border-[#E4D8FF] rounded-[2rem] p-8 text-center">
              <p className="text-[#6B5A95] font-semibold mb-5">Avatar</p>

              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar usuario"
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

              <select
                id="perfil-role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
              >
                <option value="child">Niño</option>
                <option value="parent">Padre/Cuidador</option>
              </select>

              <input
                id="perfil-rut"
                name="rut"
                type="text"
                value={rut}
                onChange={(e) => setRut(formatRut(e.target.value))}
                placeholder="Rut"
                className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
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
