import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createPlace,
  createPlaceStep,
  createChildPlace,
  createChildPlaceStep,
} from "../services/placeService";
import { generatePlaceSteps } from "../services/aiService";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";
import { useFeedback } from "../context/FeedbackContext";
import { validateImageFile } from "../utils/validateImageFile";

const CrearLugar = () => {
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    descripcion: "",
    actividad: "",
    personas: "",
    transporte: "",
    duracion: "",
    consejos: "",
  });

  const [steps, setSteps] = useState([
    "Vamos a salir de casa.",
    "Iremos al lugar.",
    "Llegaremos con calma.",
    "Saludaremos a las personas presentes.",
    "Haremos la actividad preparada.",
    "Luego volveremos a casa.",
  ]);

  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [generandoIA, setGenerandoIA] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { user } = useFloFlo();

  const {
    isParent,
    selectedChild,
    selectedChildId,
    loadingChildren,
    getChildDisplayName,
  } = useSelectedChild();

  const { showFeedback } = useFeedback();

  const isParentMode = isParent && Boolean(selectedChildId);
  const isParentWithoutChild = isParent && !selectedChildId;

  const childName = selectedChild
    ? getChildDisplayName(selectedChild)
    : "el niño/a seleccionado";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setImagen(null);
      setPreview(null);
      return;
    }

    const validation = validateImageFile(file);

    if (!validation.isValid) {
      e.target.value = "";
      setImagen(null);
      setPreview(null);

      showFeedback(validation.feedback);

      return;
    }

    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const validateParentChildSelection = () => {
    if (!isParent) return true;

    if (!selectedChildId) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta niño/a activo",
        title: "Selecciona un niño/a",
        message:
          "Para crear un lugar como cuidador, primero debes tener un niño/a asociado y seleccionado.",
      });

      return false;
    }

    return true;
  };

  const handleGenerateStepsAI = async () => {
    if (!form.nombre.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Ingresa el nombre del lugar",
        message: "Félix necesita saber el nombre para generar los pasos.",
      });
      return;
    }

    if (!form.actividad.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Describe la actividad",
        message:
          "Indica qué se hará en ese lugar para que Félix pueda ayudarte.",
      });
      return;
    }

    try {
      setGenerandoIA(true);

      const data = await generatePlaceSteps({
        placeName: form.nombre,
        activity: form.actividad,
        people: form.personas,
        transport: form.transporte,
        duration: form.duracion,
      });

      if (!data.steps || !Array.isArray(data.steps)) {
        showFeedback({
          type: "error",
          icon: "❌",
          label: "Algo salió mal",
          title: "No se generaron pasos",
          message: "Félix no pudo generar pasos válidos. Intenta nuevamente.",
        });
        return;
      }

      setSteps(data.steps);

      showFeedback({
        type: "success",
        icon: "✨",
        label: "Pasos generados",
        title: "Félix creó los pasos",
        message:
          "Puedes revisarlos, editarlos o agregar nuevos pasos antes de guardar.",
      });
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo generar",
        message: "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setGenerandoIA(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Sesión requerida",
        title: "Debes iniciar sesión",
        message: "Inicia sesión para crear un lugar.",
      });
      return;
    }

    if (!validateParentChildSelection()) return;

    if (!form.nombre.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Nombre obligatorio",
        message: "Debes ingresar el nombre del lugar antes de guardar.",
      });
      return;
    }

    if (!form.descripcion.trim()) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Falta información",
        title: "Descripción obligatoria",
        message: "Agrega una descripción simple del lugar antes de guardar.",
      });
      return;
    }

    if (pasosValidos.length === 0) {
      showFeedback({
        type: "warning",
        icon: "⚠️",
        label: "Faltan pasos",
        title: "Agrega al menos un paso",
        message: "El lugar necesita al menos un paso de preparación.",
      });
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", form.nombre.trim());
      formData.append("address", form.direccion.trim());
      formData.append("description", form.descripcion.trim());
      formData.append("activity", form.actividad.trim());
      formData.append("people_present", form.personas.trim());
      formData.append("transport", form.transporte.trim());
      formData.append("estimated_duration", form.duracion.trim());
      formData.append("tips", form.consejos.trim());

      if (imagen) {
        formData.append("image", imagen);
      }

      const lugarCreado = isParentMode
        ? await createChildPlace(selectedChildId, formData)
        : await createPlace(formData);

      const placeId =
        lugarCreado?.id || lugarCreado?.place?.id || lugarCreado?.data?.id;

      if (!placeId) {
        throw new Error("No se pudo obtener el ID del lugar creado.");
      }

      const pasosValidos = steps
        .map((step) => String(step || "").trim())
        .filter((step) => step !== "");

      for (let i = 0; i < pasosValidos.length; i++) {
        const stepPayload = {
          step_order: i + 1,
          title: `Paso ${i + 1}`,
          description: pasosValidos[i],
        };

        if (isParentMode) {
          await createChildPlaceStep(selectedChildId, placeId, stepPayload);
        } else {
          await createPlaceStep(placeId, stepPayload);
        }
      }

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Lugar creado",
        title: "Guardado correctamente",
        message: isParentMode
          ? `El lugar fue creado para ${childName}.`
          : "El lugar fue creado y ya está disponible en FloFlo.",
      });

      navigate("/lugares");
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo crear el lugar",
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
      <main className="flex min-h-screen items-center justify-center bg-[#F3ECFF] px-6 py-10">
        <p className="text-2xl font-bold text-[#4B367C]">
          Cargando niño/a seleccionado...
        </p>
      </main>
    );
  }

  if (isParentWithoutChild) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3ECFF] px-6 py-10">
        <section className="w-full max-w-xl rounded-[2.5rem] bg-white p-8 text-center shadow-lg">
          <h1 className="text-3xl font-extrabold text-[#4B367C]">
            No hay niño/a seleccionado
          </h1>

          <p className="mt-4 text-[#6B5A95]">
            Para crear lugares como cuidador, primero debes seleccionar un
            niño/a activo.
          </p>

          <Link
            to="/lugares"
            className="mt-6 inline-block rounded-full bg-[#9B7BE8] px-6 py-3 font-bold text-white"
          >
            Volver a lugares
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="mx-auto max-w-5xl rounded-[2.5rem] bg-white p-8 shadow-lg md:p-10">
        <p className="mb-3 text-center text-lg font-bold text-[#9B7BE8]">
          {isParentMode ? "Modo cuidador" : "Prepárate con Félix"}
        </p>

        <h1 className="mb-4 text-center text-4xl font-extrabold text-[#4B367C] md:text-5xl">
          {isParentMode ? `Crear lugar para ${childName}` : "Crear lugar"}
        </h1>

        <p className="mb-10 text-center text-lg text-[#6B5A95]">
          {isParentMode
            ? "Este lugar se guardará directamente en el perfil del niño/a seleccionado."
            : "Agrega un lugar para que Félix pueda ayudarte a prepararte."}
        </p>

        {isParentMode && (
          <div className="mb-8 rounded-[2rem] border-2 border-[#9ED5B3] bg-[#EAF8EF] p-5 text-center shadow-sm">
            <p className="font-bold text-[#2F6B4F]">
              El lugar quedará guardado para {childName}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre del lugar"
            className="rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
          />

          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Dirección"
            className="rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
          />

          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción simple del lugar"
            className="resize-none rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none md:col-span-2"
          />

          <input
            name="actividad"
            value={form.actividad}
            onChange={handleChange}
            placeholder="¿Qué se hará allí?"
            className="rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
          />

          <input
            name="personas"
            value={form.personas}
            onChange={handleChange}
            placeholder="¿Quién estará presente?"
            className="rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
          />

          <input
            name="transporte"
            value={form.transporte}
            onChange={handleChange}
            placeholder="Medio de transporte"
            className="rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
          />

          <input
            name="duracion"
            value={form.duracion}
            onChange={handleChange}
            placeholder="Tiempo estimado"
            className="rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
          />

          <textarea
            name="consejos"
            value={form.consejos}
            onChange={handleChange}
            placeholder="Consejos o recordatorios importantes"
            className="resize-none rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none md:col-span-2"
          />

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="rounded-2xl bg-[#F3ECFF] p-4 text-[#4B367C] md:col-span-2"
          />

          {preview && (
            <img
              src={preview}
              alt="Vista previa"
              className="max-h-80 w-full rounded-[2rem] object-cover md:col-span-2"
            />
          )}

          <div className="rounded-[2rem] bg-[#F3ECFF] p-6 md:col-span-2">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-[#4B367C]">
                  Pasos para prepararme
                </h2>

                <p className="text-[#6B5A95]">
                  Escribe los pasos o deja que Félix los genere con IA.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateStepsAI}
                disabled={generandoIA}
                className="rounded-full bg-[#4B367C] px-5 py-3 font-bold text-white hover:bg-[#3E2E68] disabled:opacity-50"
              >
                {generandoIA ? "Generando..." : "✨ Generar con Félix"}
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={`step-${index}`} className="flex gap-3">
                  <input
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Paso ${index + 1}`}
                    className="flex-1 rounded-2xl border-2 border-[#DCCCF8] p-4 focus:border-[#9B7BE8] focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="rounded-2xl bg-red-100 px-4 font-bold text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addStep}
              className="mt-5 rounded-full bg-white px-5 py-3 font-bold text-[#4B367C] shadow"
            >
              + Agregar paso
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-[#9B7BE8] py-4 font-bold text-white transition hover:bg-[#8B6FD6] disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
          >
            {saving
              ? "Guardando..."
              : isParentMode
                ? "Guardar lugar para niño/a"
                : "Guardar lugar"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default CrearLugar;
