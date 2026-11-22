
export default function Privacidad() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-purple-800 mb-6">
        Política de Privacidad
      </h1>

      <p className="text-gray-700">
        FloFlo está comprometido con la protección de
        los datos personales de niños, niñas y adolescentes.
      </p>

      <p className="mt-6 text-gray-700">
        Contacto de privacidad:
        {" "}
        <a
          href="mailto:privacidad@floflo.cl"
          className="text-purple-700 underline"
        >
          privacidad@floflo.cl
        </a>
      </p>

      <p className="mt-6 text-sm text-gray-500">
        Documento legal en preparación.
      </p>
    </div>
  );
}
