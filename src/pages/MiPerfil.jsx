import { useEffect, useState } from "react";
import { getMe, updateMe } from "../services/authService";
import { useFloFlo } from "../context/FloFloContext";

const MiPerfil = () => {
  const { setUser } = useFloFlo();

  const [user, setProfileUser] = useState(null);
  const [editing, setEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rut, setRut] = useState("");
  const [birthDate, setBirthDate] = useState("");
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
      setAvatar(null);
      setPreview(data.avatar || "");
    } catch (error) {
      console.error(error);
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

      if (avatar instanceof File) {
        formData.append("avatar", avatar);
      }

      const updatedUser = await updateMe(formData);

      setProfileUser(updatedUser);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

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
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#4B367C]">Mi Perfil</h1>

          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-semibold px-5 py-3 rounded-full transition"
            >
              Editar perfil
            </button>
          )}
        </div>

        {!editing ? (
          <div className="space-y-6">
            <div>
              <p className="text-gray-500">Nombre</p>
              <p className="text-xl font-semibold">{user.firstName}</p>
            </div>

            <div>
              <p className="text-gray-500">Apellido</p>
              <p className="text-xl font-semibold">{user.lastName}</p>
            </div>

            <div>
              <p className="text-gray-500">Correo</p>
              <p className="text-xl font-semibold">{user.email}</p>
            </div>

            <div>
              <p className="text-gray-500">Rut</p>
              <p className="text-xl font-semibold">
                {user.rut || "No registrado"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Fecha nacimiento</p>
              <p className="text-xl font-semibold">
                {user.birth_date
                  ? new Date(user.birth_date).toLocaleDateString()
                  : "No registrada"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Avatar</p>
              <p className="text-xl font-semibold">
                {user.avatar || "No registrado"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Miembro desde</p>
              <p className="text-xl font-semibold">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nombre"
              className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
            />

            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellido"
              className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
            />

            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="Rut"
              className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
            />

            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#9B7BE8]"
            />

            <div>
              <p className="text-gray-500 mb-2">Avatar</p>

              {preview && (
                <img
                  src={preview}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover mb-4 border"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="w-full py-3 text-gray-900"
              />
            </div>

            <div className="flex gap-4">
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
          </form>
        )}
      </div>
    </div>
  );
};

export default MiPerfil;
