import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useFloFlo } from "../context/FloFloContext";
import {
  getContacts,
  createContact,
  deleteContact,
  updateContact,
} from "../services/contactService";
import { getRelationshipTypes } from "../services/relationshipTypeService";

const Amigos = () => {
  const [name, setName] = useState("");
  const [whereMet, setWhereMet] = useState("");
  const [memoryNote, setMemoryNote] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");

  const { user } = useFloFlo();

  const [contacts, setContacts] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [relationshipTypeId, setRelationshipTypeId] = useState("");
  const [editingContactId, setEditingContactId] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounce, setBusquedaDebounce] = useState("");
  const [orden, setOrden] = useState("recientes");

  const fileInputRef = useRef(null);

  const loadRelationshipTypes = async () => {
    try {
      const data = await getRelationshipTypes();
      setRelationshipTypes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadContacts = async () => {
    try {
      if (!user) return;

      const data = await getContacts(busquedaDebounce, orden);

      const contactosUsuario = data.filter(
        (contacto) => Number(contacto.user_id) === Number(user.id),
      );

      setContacts(contactosUsuario);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadContacts();
    loadRelationshipTypes();
  }, [user, busquedaDebounce, orden]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounce(busqueda);
    }, 500);

    return () => clearTimeout(timer);
  }, [busqueda]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setImage("");
      setPreview("");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleEdit = (contact) => {
    setEditingContactId(contact.id);
    setName(contact.name);
    setRelationshipTypeId(contact.relationship_type_id);
    setWhereMet(contact.where_met);
    setMemoryNote(contact.memory_note || "");
    setImage(contact.image || "");
    setPreview("");
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm("¿Seguro que quieres eliminar esta persona?");
    if (!confirmDelete) return;

    try {
      await deleteContact(id);
      await loadContacts();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar persona");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Debes iniciar sesión primero");
      return;
    }

    if (!name.trim()) {
      alert("Debes ingresar un nombre");
      return;
    }

    if (!relationshipTypeId) {
      alert("Debes seleccionar quién es la persona");
      return;
    }

    if (!whereMet.trim()) {
      alert("Debes indicar dónde conociste a la persona");
      return;
    }

    if (!memoryNote.trim()) {
      alert("Debes indicar cómo puedes recordar a esta persona");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("relationship_type_id", relationshipTypeId);
      formData.append("where_met", whereMet.trim());
      formData.append("memory_note", memoryNote.trim());

      if (image instanceof File) {
        formData.append("image", image);
      }

      if (editingContactId) {
        await updateContact(editingContactId, formData);
      } else {
        await createContact(formData);
      }

      await loadContacts();

      setName("");
      setRelationshipTypeId("");
      setWhereMet("");
      setMemoryNote("");
      setImage("");
      setPreview("");
      setEditingContactId(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert(
        editingContactId
          ? "Persona actualizada correctamente"
          : "Persona guardada correctamente",
      );
    } catch (error) {
      console.error(error);
      alert("Error al guardar persona");
    }
  };

  return (
    <div className="min-h-screen bg-white px-8 py-10">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-4xl font-light text-black-900 mb-10 text-center">
              Personas importantes que recordar.
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
                className="w-full py-3 text-gray-900 placeholder-black-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
              />

              <select
                value={relationshipTypeId}
                onChange={(e) => setRelationshipTypeId(e.target.value)}
                className="w-full py-3 text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
              >
                <option value="">Selecciona quién es</option>

                {relationshipTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.relationship_name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={whereMet}
                onChange={(e) => setWhereMet(e.target.value)}
                placeholder="Donde lo conocí"
                className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
              />

              <textarea
                value={memoryNote}
                onChange={(e) => setMemoryNote(e.target.value)}
                placeholder="¿Cómo puedo recordar a esta persona?"
                className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full py-3 text-gray-500"
              />

              <button
                type="submit"
                className="w-full py-3 text-cyan-700 font-medium border border-cyan-700 hover:bg-cyan-700 hover:text-white transition-all duration-300"
              >
                {editingContactId ? "Actualizar" : "Enviar"}
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Vista previa"
                className="w-80 h-80 rounded-full object-cover border-4 border-cyan-700"
              />
            ) : (
              <div className="w-80 h-80 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
                Sin imagen
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <input
              id="buscar-amigo"
              name="buscar-amigo"
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="🔍 Buscar por nombre, relación o lugar..."
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
            />

            <select
              id="orden-amigos"
              name="orden-amigos"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </select>
          </div>

          <h2 className="text-3xl font-bold mb-8 text-center">
            Personas que conozco
          </h2>

          {contacts.length === 0 ? (
            <p className="text-center text-gray-500">
              Aún no hay personas registradas.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border rounded-2xl p-5 bg-white shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#4B367C]">
                        {contact.name}
                      </h3>

                      <p className="text-[#6B5A95] font-medium mt-1">
                        {contact.relationship_name}
                      </p>

                      <p className="text-gray-600 mt-2">
                        📍 {contact.where_met}
                      </p>
                    </div>

                    {contact.image ? (
                      <img
                        src={contact.image}
                        alt={contact.name}
                        className="w-32 h-32 object-cover rounded-xl border"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                        Sin foto
                      </div>
                    )}
                  </div>

                  <div className="mt-4 bg-[#F3ECFF] rounded-xl p-4">
                    <p className="text-sm font-semibold text-[#4B367C] mb-1">
                      ¿Cómo puedo recordarlo?
                    </p>

                    <p className="text-gray-700">
                      {contact.memory_note || "Sin información"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Eliminar
                    </button>

                    <Link
                      to={`/amigos/${contact.id}`}
                      className="px-4 py-2 rounded-xl bg-[#9B7BE8] text-white font-semibold"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Amigos;