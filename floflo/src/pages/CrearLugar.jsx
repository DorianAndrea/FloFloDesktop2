import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevoLugar = {
      ...form,
      imagen,
    };

    console.log("Lugar creado:", nuevoLugar);
    console.log("Lugar creado:", nuevoLugar);
    navigate("/lugares");
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
