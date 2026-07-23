import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import {
  getContacts,
  createContact,
  deleteContact,
  updateContact,
  getChildContacts,
  createChildContact,
  deleteChildContact,
  updateChildContact,
} from "../services/contactService";
import { getRelationshipTypes } from "../services/relationshipTypeService";
import { getCachedData, setCachedData } from "../utils/cache";
import { validateImageFile } from "../utils/validateImageFile";

const Amigos = () => {
  const [name, setName] = useState("");
  const [whereMet, setWhereMet] = useState("");
  const [memoryNote, setMemoryNote] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");

  const [contacts, setContacts] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [relationshipTypeId, setRelationshipTypeId] = useState("");
  const [editingContactId, setEditingContactId] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounce, setBusquedaDebounce] = useState("");
  const [orden, setOrden] = useState("recientes");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  const { showFeedback, showConfirm } = useFeedback();
  const { user } = useFloFlo();

  const {
    isParent,
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,
    canManageSelectedChildTeam,
  } = useSelectedChild();

  /*
   * Técnicamente, todas las cuentas adultas siguen teniendo role "parent",
   * aunque sean terapeutas, profesores, familiares u otros profesionales.
   */
  const isSupportMode = isParent && Boolean(selectedChildId);
  const isSupportWithoutChild = isParent && !selectedChildId;

  /*
   * Todos pueden crear y editar.
   * Solo el administrador del grupo puede eliminar.
   * El niño/a tampoco puede eliminar.
   */
  const canDeleteContacts =
    isSupportMode && Boolean(canManageSelectedChildTeam);

  const childName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "el niño/a seleccionado";

  const resetForm = () => {
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
  };

  const loadRelationshipTypes = async () => {
    try {
      const data = await getRelationshipTypes();

      setRelationshipTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudieron cargar las relaciones",
        message: "Intenta nuevamente en unos segundos.",
      });
    }
  };

  const loadContacts = async () => {
    try {
      if (!user) {
        setContacts([]);
        setLoadingContacts(false);
        return;
      }

      if (isParent && loadingChildren) {
        return;
      }

      if (isSupportWithoutChild) {
        setContacts([]);
        setLoadingContacts(false);
        return;
      }

      const ownerId = isSupportMode ? selectedChildId : user.id;

      const searchKey = busquedaDebounce.trim() || "all";

      const cacheKey = `floflo_contacts_${ownerId}_${searchKey}_${orden}`;

      const cachedContacts = getCachedData(cacheKey);

      if (Array.isArray(cachedContacts)) {
        setContacts(cachedContacts);
        setLoadingContacts(false);
      } else {
        setLoadingContacts(true);
      }

      const data = isSupportMode
        ? await getChildContacts(selectedChildId, busquedaDebounce, orden)
        : await getContacts(busquedaDebounce, orden);

      const safeContacts = Array.isArray(data) ? data : [];

      setContacts(safeContacts);
      setCachedData(cacheKey, safeContacts);
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudieron cargar las personas",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    loadRelationshipTypes();
  }, []);

  useEffect(() => {
    loadContacts();
  }, [
    user?.id,
    user?.role,
    selectedChildId,
    loadingChildren,
    busquedaDebounce,
    orden,
  ]);

  useEffect(() => {
    resetForm();
  }, [selectedChildId, user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounce(busqueda);
    }, 500);

    return () => clearTimeout(timer);
  }, [busqueda]);

  const validateSelectedChild = () => {
    if (!isParent) return true;

    if (!selectedChildId) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta niño/a activo",
        title: "Selecciona un niño/a",
        message:
          "Para gestionar personas importantes desde tu perfil, primero debes tener un niño/a asociado y seleccionado.",
      });

      return false;
    }

    return true;
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImage("");
      setPreview("");
      return;
    }

    const validation = validateImageFile(file);

    if (!validation.isValid) {
      event.target.value = "";

      setImage("");
      setPreview("");

      showFeedback(validation.feedback);
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleEdit = (contact) => {
    setEditingContactId(contact.id);
    setName(contact.name || "");
    setRelationshipTypeId(contact.relationship_type_id || "");
    setWhereMet(contact.where_met || "");
    setMemoryNote(contact.memory_note || "");
    setImage(contact.image || "");
    setPreview(contact.image || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (contact) => {
    if (!validateSelectedChild()) return;

    if (!canDeleteContacts) {
      showFeedback({
        type: "warning",
        icon: "🔒",
        label: "Acción restringida",
        title: "No puedes eliminar personas",
        message: "Solo el administrador del grupo puede eliminar contactos.",
      });

      return;
    }

    const confirmed = await showConfirm({
      type: "danger",
      icon: "🗑️",
      label: "Eliminar persona",
      title: "¿Eliminar esta persona?",
      message:
        `Estás por eliminar a "${contact.name}" del perfil de ${childName}. ` +
        "También se eliminarán sus conversaciones relacionadas. " +
        "Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    try {
      await deleteChildContact(selectedChildId, contact.id);

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Persona eliminada",
        title: "Eliminada correctamente",
        message: `La persona fue eliminada del perfil de ${childName}.`,
      });

      if (Number(editingContactId) === Number(contact.id)) {
        resetForm();
      }

      await loadContacts();
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo eliminar",
        message:
          error.response?.data?.message ||
          "Intenta nuevamente en unos segundos.",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Sesión requerida",
        title: "Debes iniciar sesión",
        message: "Inicia sesión para guardar personas importantes.",
      });

      return;
    }

    if (!validateSelectedChild()) return;

    if (!name.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Nombre obligatorio",
        message: "Debes ingresar el nombre de la persona.",
      });

      return;
    }

    if (!relationshipTypeId) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Selecciona quién es",
        message: "Debes seleccionar la relación con esta persona.",
      });

      return;
    }

    if (!whereMet.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Indica dónde la conoció",
        message: "Esto ayuda a Félix a recordar mejor a la persona.",
      });

      return;
    }

    if (!memoryNote.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Agrega una pista para recordarla",
        message: "Escribe una pista que permita recordar a esta persona.",
      });

      return;
    }

    try {
      setSaving(true);

      const wasEditing = Boolean(editingContactId);
      const contactName = name.trim() || "la persona";

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("relationship_type_id", relationshipTypeId);
      formData.append("where_met", whereMet.trim());
      formData.append("memory_note", memoryNote.trim());

      if (image instanceof File) {
        formData.append("image", image);
      }

      if (editingContactId) {
        if (isSupportMode) {
          await updateChildContact(selectedChildId, editingContactId, formData);
        } else {
          await updateContact(editingContactId, formData);
        }
      } else if (isSupportMode) {
        await createChildContact(selectedChildId, formData);
      } else {
        await createContact(formData);
      }

      await loadContacts();
      resetForm();

      showFeedback({
        type: "success",
        icon: "✅",
        label: wasEditing ? "Cambios guardados" : "Persona guardada",
        title: wasEditing ? "Persona actualizada" : "Guardada correctamente",
        message: wasEditing
          ? isSupportMode
            ? `Los datos de ${contactName}, contacto de ${childName}, se actualizaron correctamente.`
            : `Los datos de ${contactName} se actualizaron correctamente.`
          : isSupportMode
            ? `${contactName} fue guardado/a como contacto de ${childName}.`
            : `${contactName} fue guardado/a y ya está disponible en FloFlo.`,
      });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo guardar",
        message:
          error.response?.data?.message ||
          "Revisa los datos e intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isParent && loadingChildren) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-8 py-10">
        <p className="text-xl font-bold text-[#4B367C]">
          Cargando niño/a seleccionado...
        </p>
      </div>
    );
  }

  if (isSupportWithoutChild) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-8 py-10">
        <section className="max-w-xl rounded-[2rem] bg-[#F3ECFF] p-8 text-center shadow-lg">
          <h1 className="text-3xl font-extrabold text-[#4B367C]">
            No hay niño/a seleccionado
          </h1>

          <p className="mt-4 text-[#6B5A95]">
            Para gestionar personas importantes desde tu perfil, primero debes
            seleccionar un niño/a activo.
          </p>
        </section>
      </div>
    );
  }
  const getCreatorRoleLabel = (contact) => {
    const role =
      contact.creator_relationship_key || contact.creator_access_profile;

    if (!role) return "";

    const roleLabels = {
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
      roleLabels[role] ||
      String(role)
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase())
    );
  };

  const getCreatorName = (contact) => {
    return [contact.creator_first_name, contact.creator_last_name]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-[#F3ECFF]">
      <div className="mx-auto w-full max-w-6xl">
        {isSupportMode && (
          <div className="mb-8 rounded-[2rem] border-2 border-[#9ED5B3] bg-[#EAF8EF] p-5 text-center shadow-sm">
            <p className="font-bold text-[#2F6B4F]">
              {canManageSelectedChildTeam
                ? "Administrador del grupo activo"
                : "Perfil de apoyo activo"}
            </p>

            <p className="mt-1 text-[#2F6B4F]">
              Estás viendo y gestionando las personas importantes de {childName}
              .
            </p>

            {!canDeleteContacts && (
              <p className="mt-2 text-sm text-[#2F6B4F]">
                Puedes crear y editar contactos. Solo el administrador puede
                eliminarlos.
              </p>
            )}
          </div>
        )}

        <section className="mx-auto mb-10 max-w-6xl rounded-[2rem] bg-white px-8 py-10 shadow-sm md:px-12">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="mx-auto w-full max-w-md">
              <p className="mb-3 text-center text-lg font-bold text-[#9B7BE8]">
                {editingContactId
                  ? "Editando persona"
                  : isSupportMode
                    ? "Personas del niño/a"
                    : "Personas importantes"}
              </p>

              <h1 className="mb-10 text-center text-4xl font-light text-black">
                {isSupportMode
                  ? `Personas importantes para ${childName}`
                  : "Personas importantes que recordar."}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nombre"
                  className="w-full border-b border-[#D6D1E8] bg-transparent px-1 py-4 text-[#4B367C] placeholder:text-[#9A91B5] focus:border-[#9B7BE8] focus:outline-none"
                />

                <select
                  value={relationshipTypeId}
                  onChange={(event) =>
                    setRelationshipTypeId(event.target.value)
                  }
                  className={`w-full border-b border-gray-300 bg-transparent py-3 focus:border-cyan-700 focus:outline-none ${
                    relationshipTypeId ? "text-gray-900" : "text-[#9A91B5]"
                  }`}
                >
                  <option value="" className="text-[#9A91B5]">
                    Selecciona quién es
                  </option>

                  {relationshipTypes.map((type) => (
                    <option
                      key={type.id}
                      value={type.id}
                      className="text-gray-900"
                    >
                      {type.relationship_name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={whereMet}
                  onChange={(event) => setWhereMet(event.target.value)}
                  placeholder="Dónde lo conoció"
                  className="w-full border-b border-gray-300 bg-transparent py-3 text-gray-900 placeholder-gray-400 focus:border-cyan-700 focus:outline-none"
                />

                <textarea
                  value={memoryNote}
                  onChange={(event) => setMemoryNote(event.target.value)}
                  placeholder="¿Cómo puede recordar a esta persona?"
                  className="w-full border-b border-gray-300 bg-transparent py-3 text-gray-900 placeholder-gray-400 focus:border-cyan-700 focus:outline-none"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full py-3 text-gray-500"
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full border border-cyan-700 py-3 font-medium text-cyan-700 transition-all duration-300 hover:bg-cyan-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Guardando..."
                    : editingContactId
                      ? "Actualizar"
                      : isSupportMode
                        ? `Guardar para ${childName}`
                        : "Guardar"}
                </button>

                {editingContactId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full border border-[#DCCCF8] py-3 font-medium text-[#4B367C] transition-all duration-300 hover:bg-[#F3ECFF]"
                  >
                    Cancelar edición
                  </button>
                )}
              </form>
            </div>

            <div className="flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Vista previa"
                  className="h-80 w-80 rounded-full border-4 border-cyan-700 object-cover"
                />
              ) : (
                <div className="flex h-80 w-80 items-center justify-center rounded-full bg-gray-300 text-gray-500">
                  Sin imagen
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto mb-8 max-w-6xl rounded-[2rem] bg-white px-8 py-8 shadow-sm md:px-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              id="buscar-amigo"
              name="buscar-amigo"
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="🔍 Buscar por nombre, relación o lugar..."
              className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
            />

            <select
              id="orden-amigos"
              name="orden-amigos"
              value={orden}
              onChange={(event) => setOrden(event.target.value)}
              className="w-full rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
            >
              <option value="recientes">Más recientes</option>

              <option value="antiguos">Más antiguos</option>

              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </select>
          </div>
        </section>

        <section className="mx-auto mb-10 max-w-6xl rounded-[2rem] bg-white px-8 py-10 shadow-sm md:px-12">
          <h2 className="mb-8 text-center text-3xl font-bold">
            {isSupportMode
              ? `Personas que conoce ${childName}`
              : "Personas que conozco"}
          </h2>

          {loadingContacts ? (
            <p className="text-center text-gray-500">Cargando personas...</p>
          ) : contacts.length === 0 ? (
            <p className="text-center text-gray-500">
              Aún no hay personas registradas.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-2xl border bg-white p-5 shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#4B367C]">
                        {contact.name}
                      </h3>

                      <span className="mt-2 inline-flex rounded-full bg-[#EDE4FF] px-3 py-1 text-sm font-bold text-[#5B3E96]">
                        {contact.relationship_name || "Persona importante"}
                      </span>
                      
                      {getCreatorRoleLabel(contact) && (
                        <div className="mt-3">
                          <span className="inline-flex rounded-full bg-[#EAF8EF] px-3 py-1 text-sm font-bold text-[#2F6B4F]">
                            👤 Creado por: {getCreatorRoleLabel(contact)}
                            {getCreatorName(contact)
                              ? ` · ${getCreatorName(contact)}`
                              : ""}
                          </span>
                        </div>
                      )}

                      <p className="mt-2 text-gray-600">
                        📍 {contact.where_met || "Sin información"}
                      </p>
                    </div>

                    {contact.image ? (
                      <img
                        src={contact.image}
                        alt={contact.name}
                        className="h-32 w-32 rounded-xl border object-cover"
                      />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-gray-200 text-sm text-gray-500">
                        Sin foto
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl bg-[#F3ECFF] p-4">
                    <p className="mb-1 text-sm font-semibold text-[#4B367C]">
                      ¿Cómo puede recordarlo?
                    </p>

                    <p className="text-gray-700">
                      {contact.memory_note || "Sin información"}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(contact)}
                      className="rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
                    >
                      Editar
                    </button>

                    {canDeleteContacts && (
                      <button
                        type="button"
                        onClick={() => handleDelete(contact)}
                        className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    )}

                    <Link
                      to={`/amigos/${contact.id}`}
                      className="rounded-xl bg-[#9B7BE8] px-4 py-2 font-semibold text-white"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Amigos;
