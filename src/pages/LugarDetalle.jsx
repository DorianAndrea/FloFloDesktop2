import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getPlaceById,
  getPlaceSteps,
  updatePlace,
  deletePlace,
  completePlace,
  replacePlaceSteps,
} from "../services/placeService";

import { generatePlaceSteps } from "../services/aiService";
import felix from "../assets/webp/felix_respirando.webp";

const lugaresDemo = [
  {
    id: "demo-1",
    nombre: "Médico",
    emoji: "🩺",
    imagen: null,
    direccion: "Centro médico cercano",
    descripcion: "Es un lugar donde revisan nuestra salud.",
    actividad: "El doctor nos revisará unos minutos.",
    personas: "Mamá, Félix y el doctor.",
    transporte: "Automóvil",
    duracion: "30 minutos",
    consejos: "Puedes llevar tu juguete favorito.",
    pasos: [
      "Vamos a salir de casa.",
      "Iremos en automóvil.",
      "Llegaremos al médico.",
      "El doctor nos saludará.",
      "La revisión durará unos minutos.",
      "Luego volveremos a casa.",
    ],
  },
  {
    id: "demo-2",
    nombre: "Colegio",
    emoji: "🏫",
    imagen: null,
    direccion: "Colegio",
    descripcion: "Es un lugar donde aprendemos y compartimos.",
    actividad: "Entraremos a clases y haremos actividades.",
    personas: "Profesora, compañeros y Félix.",
    transporte: "Automóvil o bus escolar",
    duracion: "Media jornada",
    consejos: "Puedes llevar tu mochila y tu colación.",
    pasos: [
      "Vamos a preparar la mochila.",
      "Saldremos de casa.",
      "Iremos al colegio.",
      "La profesora nos saludará.",
      "Haremos actividades en la sala.",
      "Luego volveremos a casa.",
    ],
  },
  {
    id: "demo-3",
    nombre: "Parque",
    emoji: "🌳",
    imagen: null,
    direccion: "Parque cercano",
    descripcion: "Es un lugar para caminar, jugar y descansar.",
    actividad: "Podremos caminar, mirar árboles o jugar.",
    personas: "Familia, otros niños y Félix.",
    transporte: "Caminando o en automóvil",
    duracion: "1 hora",
    consejos: "Puedes llevar agua y usar bloqueador.",
    pasos: [
      "Vamos a salir de casa.",
      "Iremos al parque.",
      "Veremos árboles y juegos.",
      "Podremos caminar o jugar.",
      "Descansaremos si lo necesitas.",
      "Luego volveremos a casa.",
    ],
  },
];

const defaultSteps = [
  "Vamos a salir de casa.",
  "Iremos al lugar.",
  "Llegaremos y miraremos alrededor.",
  "Saludaremos a las personas presentes.",
  "Haremos la actividad preparada.",
  "Luego volveremos a casa.",
];

const LugarDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const esDemo = id.startsWith("demo");

  const [lugar, setLugar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modoPreparacion, setModoPreparacion] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editingSteps, setEditingSteps] = useState([]);
  const [generandoIA, setGenerandoIA] = useState(false);

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

  const loadLugar = async () => {
    try {
      setLoading(true);

      if (esDemo) {
        const lugarDemo = lugaresDemo.find(
          (lugar) => String(lugar.id) === String(id),
        );

        setLugar(lugarDemo || null);
        setEditingSteps(lugarDemo?.pasos || defaultSteps);
        return;
      }

      const data = await getPlaceById(id);
      const stepsData = await getPlaceSteps(id);

      const pasosBD = Array.isArray(stepsData)
        ? stepsData
            .map((step) => step.description)
            .filter((step) => typeof step === "string" && step.trim() !== "")
        : [];

      const pasosFinales = pasosBD.length > 0 ? pasosBD : defaultSteps;

      const lugarFormateado = {
        id: data.id,
        nombre: data.name,
        imagen: data.image,
        direccion: data.address,
        descripcion: data.description,
        actividad: data.activity,
        personas: data.people_present,
        transporte: data.transport,
        duracion: data.estimated_duration,
        consejos: data.tips,
        emoji: "📍",
        pasos: pasosFinales,
      };

      setLugar(lugarFormateado);
      setEditingSteps(pasosFinales);

      setForm({
        nombre: data.name || "",
        direccion: data.address || "",
        descripcion: data.description || "",
        actividad: data.activity || "",
        personas: data.people_present || "",
        transporte: data.transport || "",
        duracion: data.estimated_duration || "",
        consejos: data.tips || "",
      });
    } catch (error) {
      console.error(error);
      setLugar(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLugar();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerateStepsAI = async () => {
    if (!form.nombre.trim()) {
      alert("Primero ingresa el nombre del lugar");
      return;
    }

    if (!form.actividad.trim()) {
      alert("Primero ingresa qué se hará en ese lugar");
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
        alert("La IA no devolvió pasos válidos");
        return;
      }

      setEditingSteps(data.steps);
      alert("Félix regeneró los pasos correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al regenerar pasos con Félix");
    } finally {
      setGenerandoIA(false);
    }
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...editingSteps];
    newSteps[index] = value;
    setEditingSteps(newSteps);
  };

  const addStep = () => {
    setEditingSteps([...editingSteps, ""]);
  };

  const removeStep = (index) => {
    setEditingSteps(editingSteps.filter((_, i) => i !== index));
  };

  const handleUpdateLugar = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      alert("Debes ingresar el nombre del lugar");
      return;
    }

    if (!form.descripcion.trim()) {
      alert("Debes ingresar una descripción");
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

      const updated = await updatePlace(id, formData);

      const pasosValidos = editingSteps
        .map((step) => String(step || "").trim())
        .filter((step) => step !== "");

      await replacePlaceSteps(id, pasosValidos);

      setLugar({
        ...lugar,
        nombre: updated.name,
        direccion: updated.address,
        descripcion: updated.description,
        actividad: updated.activity,
        personas: updated.people_present,
        transporte: updated.transport,
        duracion: updated.estimated_duration,
        consejos: updated.tips,
        imagen: updated.image,
        pasos: pasosValidos,
      });

      setEditing(false);
      alert("Lugar actualizado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar lugar");
    }
  };

  const handleDeleteLugar = async () => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este lugar?",
    );

    if (!confirmDelete) return;

    try {
      await deletePlace(id);
      alert("Lugar eliminado correctamente");
      navigate("/lugares");
    } catch (error) {
      console.error(error);
      alert("Error al eliminar lugar");
    }
  };

  const siguientePaso = () => {
    if (pasoActual < lugar.pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    }
  };

  const anteriorPaso = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };

  const prepararLugar = async () => {
    try {
      if (!esDemo) {
        await completePlace(id);
      }

      alert("🎉 ¡Muy bien! Félix te ayudó a prepararte. Ganaste una estrella.");
      setModoPreparacion(false);
    } catch (error) {
      console.error(error);
      alert("Error al guardar la preparación del lugar");
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);

    if (!lugar) return;

    setForm({
      nombre: lugar.nombre || "",
      direccion: lugar.direccion || "",
      descripcion: lugar.descripcion || "",
      actividad: lugar.actividad || "",
      personas: lugar.personas || "",
      transporte: lugar.transporte || "",
      duracion: lugar.duracion || "",
      consejos: lugar.consejos || "",
    });

    setEditingSteps(lugar.pasos || defaultSteps);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3ECFF] flex items-center justify-center">
        <p className="text-[#4B367C] text-2xl font-bold">Cargando lugar...</p>
      </main>
    );
  }

  if (!lugar) {
    return (
      <main className="min-h-screen bg-[#F3ECFF] flex items-center justify-center">
        <p className="text-[#4B367C] text-2xl font-bold">Lugar no encontrado</p>
      </main>
    );
  }

  if (modoPreparacion) {
    return (
      <main className="min-h-screen bg-[#F3ECFF] flex items-center justify-center px-6 py-10">
        <section className="bg-white rounded-[2.5rem] shadow-lg p-8 max-w-3xl w-full text-center">
          <p className="text-[#9B7BE8] font-bold mb-4">
            Paso {pasoActual + 1} de {lugar.pasos.length}
          </p>

          <motion.img
            src={felix}
            alt="Félix respirando"
            className="w-80 h-80 object-contain mx-auto mb-6"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#4B367C] mb-8">
            {lugar.pasos[pasoActual]}
          </h1>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={anteriorPaso}
              disabled={pasoActual === 0}
              className="px-6 py-3 rounded-full bg-[#E8DDFF] text-[#4B367C] font-bold disabled:opacity-40"
            >
              Anterior
            </button>

            {pasoActual === lugar.pasos.length - 1 ? (
              <button
                type="button"
                onClick={prepararLugar}
                className="px-6 py-3 rounded-full bg-green-500 text-white font-bold"
              >
                ✅ Ya estoy preparado
              </button>
            ) : (
              <button
                type="button"
                onClick={siguientePaso}
                className="px-6 py-3 rounded-full bg-[#9B7BE8] text-white font-bold"
              >
                Siguiente
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setModoPreparacion(false)}
            className="mt-6 text-[#6B5A95] font-semibold"
          >
            Volver al lugar
          </button>
        </section>
      </main>
    );
  }

  const imagenValida =
    lugar.imagen && lugar.imagen.startsWith("https://res.cloudinary.com");

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="max-w-6xl mx-auto">
        <Link
          to="/lugares"
          className="inline-block mb-6 text-[#4B367C] font-bold bg-white px-5 py-3 rounded-full shadow-sm hover:shadow-md transition"
        >
          ← Volver a lugares
        </Link>

        {imagenValida ? (
          <img
            src={lugar.imagen}
            alt={lugar.nombre}
            className="w-full h-72 object-cover rounded-[2.5rem] shadow-md mb-8"
          />
        ) : (
          <div className="w-full h-72 rounded-[2.5rem] bg-[#E8DDFF] flex items-center justify-center text-7xl mb-8">
            {lugar.emoji || "📍"}
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-lg p-8 md:p-10">
          {!esDemo && (
            <div className="flex justify-end gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  if (editing) {
                    handleCancelEdit();
                  } else {
                    setEditing(true);
                  }
                }}
                className="bg-[#E8DDFF] text-[#4B367C] font-bold px-5 py-3 rounded-full"
              >
                {editing ? "Cancelar edición" : "Editar lugar"}
              </button>

              <button
                type="button"
                onClick={handleDeleteLugar}
                className="bg-red-100 text-red-600 font-bold px-5 py-3 rounded-full"
              >
                Eliminar lugar
              </button>
            </div>
          )}

          {editing ? (
            <form
              onSubmit={handleUpdateLugar}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                className="p-4 rounded-2xl border-2 border-[#DCCCF8]"
              />

              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Dirección"
                className="p-4 rounded-2xl border-2 border-[#DCCCF8]"
              />

              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción"
                className="md:col-span-2 p-4 rounded-2xl border-2 border-[#DCCCF8]"
              />

              <input
                name="actividad"
                value={form.actividad}
                onChange={handleChange}
                placeholder="¿Qué se hará allí?"
                className="p-4 rounded-2xl border-2 border-[#DCCCF8]"
              />

              <input
                name="personas"
                value={form.personas}
                onChange={handleChange}
                placeholder="¿Quién estará presente?"
                className="p-4 rounded-2xl border-2 border-[#DCCCF8]"
              />

              <input
                name="transporte"
                value={form.transporte}
                onChange={handleChange}
                placeholder="Medio de transporte"
                className="p-4 rounded-2xl border-2 border-[#DCCCF8]"
              />

              <input
                name="duracion"
                value={form.duracion}
                onChange={handleChange}
                placeholder="Tiempo estimado"
                className="p-4 rounded-2xl border-2 border-[#DCCCF8]"
              />

              <textarea
                name="consejos"
                value={form.consejos}
                onChange={handleChange}
                placeholder="Consejos o recordatorios importantes"
                className="md:col-span-2 p-4 rounded-2xl border-2 border-[#DCCCF8]"
              />

              <div className="md:col-span-2 bg-[#F3ECFF] rounded-[2rem] p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-[#4B367C] mb-2">
                      Pasos para prepararme
                    </h2>

                    <p className="text-[#6B5A95]">
                      Puedes editar los pasos o pedirle a Félix que los regenere
                      con IA.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateStepsAI}
                    disabled={generandoIA}
                    className="bg-[#4B367C] hover:bg-[#3E2E68] text-white font-bold px-5 py-3 rounded-full disabled:opacity-50"
                  >
                    {generandoIA ? "Generando..." : "✨ Regenerar con Félix"}
                  </button>
                </div>

                <div className="space-y-4">
                  {editingSteps.map((step, index) => (
                    <div key={`${index}-${step}`} className="flex gap-3">
                      <input
                        value={step}
                        onChange={(e) =>
                          handleStepChange(index, e.target.value)
                        }
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
                className="md:col-span-2 bg-[#9B7BE8] text-white font-bold py-4 rounded-2xl"
              >
                Guardar cambios
              </button>
            </form>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-extrabold text-[#4B367C] mb-4">
                {lugar.nombre}
              </h1>

              <p className="text-xl text-[#6B5A95] mb-8">
                {lugar.descripcion || "Sin descripción"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <InfoCard
                  icono="📍"
                  titulo="Dirección"
                  texto={lugar.direccion}
                />
                <InfoCard
                  icono="✅"
                  titulo="Qué haremos"
                  texto={lugar.actividad}
                />
                <InfoCard
                  icono="👥"
                  titulo="Quién estará"
                  texto={lugar.personas}
                />
                <InfoCard
                  icono="🚗"
                  titulo="Cómo iremos"
                  texto={lugar.transporte}
                />
                <InfoCard icono="⏱️" titulo="Duración" texto={lugar.duracion} />
                <InfoCard
                  icono="💡"
                  titulo="Recordatorio"
                  texto={lugar.consejos}
                />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#F3ECFF] rounded-[2rem] p-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#4B367C] mb-2">
                    Prepararme para ir
                  </h2>

                  <p className="text-[#6B5A95]">
                    Félix te mostrará paso a paso lo que puede ocurrir.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPasoActual(0);
                    setModoPreparacion(true);
                  }}
                  className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold px-8 py-4 rounded-full transition"
                >
                  Empezar
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

const InfoCard = ({ icono, titulo, texto }) => {
  return (
    <div className="bg-[#FDFBFF] border-2 border-[#E4D8FF] rounded-[2rem] p-5">
      <div className="text-4xl mb-3">{icono}</div>
      <h3 className="text-xl font-bold text-[#4B367C] mb-2">{titulo}</h3>
      <p className="text-[#6B5A95] text-lg">{texto || "Sin información"}</p>
    </div>
  );
};

export default LugarDetalle;