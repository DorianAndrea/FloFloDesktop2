import { useState } from "react"

const Amigos = () => {
    const [name, setName] = useState("");
    const [relationshipName, setRelationName] = useState("");
    const [whereMet, setWhereMet] = useState("");
    const [image, setImage] = useState("");
    const [preview, setPreview] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if(file){
            setPreview(URL.createObjectURL(file));
        }
    }
    const handleSubmit = (e) =>{
        e.preventDefault();
    }

    return(
       <div className="min-h-screen bg-white flex items-center justify-center px-8 py-10">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* FORMULARIO */}
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-4xl font-light text-black-900 mb-10 text-center">
            Amigos o Conocidos que conocí
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              className="w-full py-3 text-gray-900 placeholder-black-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />

            <input
              type="text"
              value={relationshipName}
              onChange={(e) => setRelationName(e.target.value)}
              placeholder="Quién és?"
              className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />
             <input
              type="text"
              value={whereMet}
              onChange={(e) => setWhereMet(e.target.value)}
              placeholder="Donde lo conocí"
              className="w-full py-3 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-cyan-700"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full py-3 text-gray-500"
            />

            <button
              type="submit"
              className="w-full py-3 text-cyan-700 font-medium border border-cyan-700 hover:bg-cyan-700 hover:text-white transition-all duration-300"
            >
              Enviar
            </button>
          </form>
        </div>

        {/* IMAGEN DERECHA */}
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
    </div>
    )

}
export default Amigos