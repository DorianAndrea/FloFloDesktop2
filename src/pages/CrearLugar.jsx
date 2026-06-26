import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPlace, createPlaceStep } from "../services/placeService";
import { generatePlaceSteps } from "../services/aiService";
import { useFeedback } from "../context/FeedbackContext";

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

  const navigate = useNavigate();
  const { showFeedback } = useFeedback();

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

    if (!file) return;

    setImagen(file);
    setPreview(URL.createObjectURL(file));
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
        message: "Indica qué se hará en ese lugar para que Félix pueda ayudarte.",
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
        message: "Puedes revisarlos, editarlos o agregar nuevos pasos antes de guardar.",
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

    try {
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

      const lugarCreado = await createPlace(formData);

      const pasosValidos = steps
        .map((step) => String(step || "").trim())
        .filter((step) => step !== "");

      for (let i = 0; i < pasosValidos.length; i++) {
        await createPlaceStep(lugarCreado.id, {
          step_order: i + 1,
          title: `Paso ${i + 1}`,
          description: pasosValidos[i],
        });
      }

      showFeedback({
        type: "success",
        icon: "✅",
        label: "Lugar creado",
        title: "Guardado correctamente",
        message: "El lugar fue creado y ya está disponible en FloFlo.",
      });

      navigate("/lugares");
    } catch (error) {
      console.error(error);

      showFeedback({
        type: "error",
        icon: "❌",
        label: "Algo salió mal",
        title: "No se pudo crear el lugar",
        message: "Revisa los datos e intenta nuevamente.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-lg p-8 md:p-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#4B367C] text-center mb-4">
          Crear lugar
        </h1>

        <p className="text-center text-[#6B5A95] text-lg mb-10">
          Agrega un lugar para que Félix pueda ayudarte a prepararte.
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre del lugar"
            className="p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
          />

          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Dirección"
            className="p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
          />

          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción simple del lugar"
            className="md:col-span-2 p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] resize-none"
          />

          <input
            name="actividad"
            value={form.actividad}
            onChange={handleChange}
            placeholder="¿Qué se hará allí?"
            className="p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
          />

          <input
            name="personas"
            value={form.personas}
            onChange={handleChange}
            placeholder="¿Quién estará presente?"
            className="p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
          />

          <input
            name="transporte"
            value={form.transporte}
            onChange={handleChange}
            placeholder="Medio de transporte"
            className="p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
          />

          <input
            name="duracion"
            value={form.duracion}
            onChange={handleChange}
            placeholder="Tiempo estimado"
            className="p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
          />

          <textarea
            name="consejos"
            value={form.consejos}
            onChange={handleChange}
            placeholder="Consejos o recordatorios importantes"
            className="md:col-span-2 p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] resize-none"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="md:col-span-2 p-4 rounded-2xl bg-[#F3ECFF] text-[#4B367C]"
          />

          {preview && (
            <img
              src={preview}
              alt="Vista previa"
              className="md:col-span-2 w-full max-h-80 object-cover rounded-[2rem]"
            />
          )}

          <div className="md:col-span-2 bg-[#F3ECFF] rounded-[2rem] p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-[#4B367C] mb-2">
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
                className="bg-[#4B367C] hover:bg-[#3E2E68] text-white font-bold px-5 py-3 rounded-full disabled:opacity-50"
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
                    className="flex-1 p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8]"
                  />

                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="px-4 rounded-2xl bg-red-100 text-red-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addStep}
              className="mt-5 bg-white text-[#4B367C] font-bold px-5 py-3 rounded-full shadow"
            >
              + Agregar paso
            </button>
          </div>

          <button
            type="submit"
            className="md:col-span-2 bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold py-4 rounded-2xl transition"
          >
            Guardar lugar
          </button>
        </form>
      </section>
    </main>
  );
};

export default CrearLugar;