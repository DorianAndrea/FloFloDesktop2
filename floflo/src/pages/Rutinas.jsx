import { useState } from "react";
import felix from "../assets/svg/felix_cara_sonriendo.svg";

const Rutinas = () => {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const rutina = {
      name,
      startTime,
      endTime,
      description,
    };

    console.log("Rutina creada:", rutina);
  };

  return (
    <div className="relative min-h-screen bg-[#F3ECFF] flex justify-center items-center px-6 py-10 overflow-hidden">
      {/* Félix a la derecha */}
      <img
        src={felix}
        alt="Félix"
        className="hidden xl:block absolute right-28 top-32 w-60 h-60 object-contain"
      />

      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-lg p-10">
        <h1 className="text-4xl md:text-5xl font-bold text-[#4B367C] text-center mb-4">
          Nueva Rutina
        </h1>

        <p className="text-center text-[#6B5A95] text-lg mb-10">
          Crea una actividad para acompañar el día de Félix.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Nombre de la rutina
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Lavarse los dientes"
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] transition"
            />
          </div>

          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Hora de inicio
            </label>

            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] transition"
            />
          </div>

          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Hora de término
            </label>

            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] transition"
            />
          </div>

          <div>
            <label className="block text-[#4B367C] font-semibold mb-2">
              Descripción
            </label>

            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la actividad, instrucciones o detalles importantes..."
              className="w-full p-4 rounded-2xl border-2 border-[#DCCCF8] focus:outline-none focus:border-[#9B7BE8] transition resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            Guardar Rutina
          </button>
        </form>
      </div>
    </div>
  );
};

export default Rutinas;