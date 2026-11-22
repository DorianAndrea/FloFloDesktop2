
export default function Terminos() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-purple-800 mb-6">
        Términos y Condiciones
      </h1>

      <p className="text-gray-700">
        FloFlo es una plataforma digital de acompañamiento
        y aprendizaje personalizado para niños, niñas
        y adolescentes.
      </p>

      <p className="mt-6 text-gray-700">
        Contacto:
        {" "}
        <a
          href="mailto:contacto@floflo.cl"
          className="text-purple-700 underline"
        >
          contacto@floflo.cl
        </a>
      </p>

      <p className="mt-6 text-sm text-gray-500">
        Documento legal en preparación.
      </p>
    </div>
  );
}
