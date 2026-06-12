const Footer = () => {
  return (
    <footer className="bg-[#E8DDFF] border-t border-[#D5C6FF] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Marca */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-[#4B367C]">
              FloFlo
            </h3>

            <p className="text-[#6B5A95] mt-2">
              Aprendiendo emociones paso a paso.
            </p>
          </div>

          {/* Enlaces */}
          <div className="flex gap-6 flex-wrap justify-center">
            <a
              href="#"
              className="text-[#5B4B8A] hover:text-[#8B6FD6] transition"
            >
              Emociones
            </a>

            <a
              href="#"
              className="text-[#5B4B8A] hover:text-[#8B6FD6] transition"
            >
              Rutinas
            </a>

            <a
              href="#"
              className="text-[#5B4B8A] hover:text-[#8B6FD6] transition"
            >
              Familia
            </a>

            <a
              href="#"
              className="text-[#5B4B8A] hover:text-[#8B6FD6] transition"
            >
              Conversaciones
            </a>
          </div>
        </div>

        <div className="border-t border-[#D5C6FF] mt-6 pt-6 text-center">
          <p className="text-sm text-[#7A6CA8]">
            © {new Date().getFullYear()} FloFlo · Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;