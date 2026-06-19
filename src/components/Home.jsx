import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useFloFlo } from "../context/FloFloContext";
import { getProfile } from "../services/profileService";
import felix from "../assets/svg/felix_feliz.svg";

const Home = () => {
  const { mood, user, setPoints } = useFloFlo();
  const [profile, setProfile] = useState(null);

  const accesos = [
    {
      titulo: "Estados de ánimo",
      descripcion: "Cuenta cómo te sientes hoy.",
      emoji: "😊",
      ruta: "/emociones",
      color: "bg-[#FFF3C4]",
    },
    {
      titulo: "Conversaciones",
      descripcion: "Practica hablar con otras personas.",
      emoji: "💬",
      ruta: "/conversaciones",
      color: "bg-[#DDF7FF]",
    },
    {
      titulo: "Rutinas",
      descripcion: "Organiza actividades del día.",
      emoji: "⭐",
      ruta: "/rutinas",
      color: "bg-[#E8DDFF]",
    },
    {
      titulo: "Lugares",
      descripcion: "Prepárate antes de visitar un lugar.",
      emoji: "📍",
      ruta: "/lugares",
      color: "bg-[#E7F8E7]",
    },
    {
      titulo: "Logros",
      descripcion: "Mira tus insignias desbloqueadas.",
      emoji: "🏆",
      ruta: "/logros",
      color: "bg-[#FFE8F3]",
    },
    {
      titulo: "Mi Perfil",
      descripcion: "Revisa tus estrellas y nivel.",
      emoji: "👤",
      ruta: "/mi-perfil",
      color: "bg-[#F1E7FF]",
    },
  ];

  const loadProfile = async () => {
    if (!user) return;

    try {
      const data = await getProfile();
      setProfile(data);
      setPoints(Number(data.progress?.points || 0));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const progress = profile?.progress;

  return (
    <main className="min-h-screen bg-[#F3ECFF] px-6 py-10">
      <section className="max-w-7xl mx-auto">
        <p className="text-[#6B5A95] mb-4">
          Estado actual: {mood || "Sin seleccionar"}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-10">
          <div className="text-center lg:text-left">
            <p className="text-[#8B6FD6] font-bold text-lg mb-2">
              Bienvenido a FloFlo
            </p>

            <p
              className={`inline-block text-sm font-bold px-4 py-2 rounded-full mb-4 ${
                user?.role === "parent"
                  ? "bg-[#CFEFD9] text-[#2F6B4F] border border-[#9ED5B3]"
                  : "bg-[#E8DDFF] text-[#6B4FC3] border border-[#D6C7FF]"
              }`}
            >
              {user?.role === "parent"
                ? "👨‍👩‍👧 Perfil: Padre/Cuidador"
                : "👶 Perfil: Niño"}
            </p>

            <h1 className="text-5xl md:text-7xl font-extrabold text-[#4B367C] leading-tight mb-6">
              {user?.role === "parent"
                ? `Hola${user?.firstName ? `, ${user.firstName}` : ""}. Estás en modo cuidador 👨‍👩‍👧`
                : `¡Hola${user?.firstName ? `, ${user.firstName}` : ""}! Soy Félix 👋`}
            </h1>

            <p className="text-xl md:text-2xl text-[#6B5A95] leading-relaxed mb-8 max-w-2xl">
              {user?.role === "parent"
                ? "Desde aquí puedes acompañar, registrar avances y revisar el progreso del niño en FloFlo."
                : "Estoy aquí para acompañarte a reconocer emociones, practicar conversaciones y seguir rutinas con calma."}
            </p>

            <Link
              to={
                user?.role === "parent"
                  ? "/panel-padres"
                  : user
                    ? "/conversaciones"
                    : "/login"
              }
              className="inline-block bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white text-xl font-bold px-8 py-4 rounded-full transition"
            >
              {user?.role === "parent"
                ? "Ir al Panel Padres"
                : user
                  ? "Continuar con Félix"
                  : "Iniciar sesión"}
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <motion.img
              src={felix}
              alt="Félix saludando"
              className="w-64 h-64 md:w-80 md:h-80 object-contain"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative bg-white rounded-[2rem] px-6 py-5 mt-4 shadow-md max-w-sm text-center"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45" />
              <p className="text-[#4B367C] text-lg font-bold">
                {user?.role === "parent"
                  ? "Puedes registrar avances aunque el niño necesite apoyo para usar la app."
                  : (progress?.points || 0) >= 20
                    ? "¡Lo estás haciendo increíble! Ya tienes muchas estrellas."
                    : "Podemos ir paso a paso. No hay prisa."}
              </p>
            </motion.div>
          </div>
        </div>

        {user && profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <DashboardCard
              icon="⭐"
              title="Estrellas"
              value={progress?.points || 0}
              color="bg-[#FFF3C4]"
            />
            <DashboardCard
              icon="🏆"
              title="Nivel"
              value={progress?.level || 1}
              color="bg-[#E8DDFF]"
            />
            <DashboardCard
              icon="🎖"
              title="Logros"
              value={profile.achievements || 0}
              color="bg-[#DDF7FF]"
            />
          </div>
        )}

        {user && profile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <SmallStat
              icon="💬"
              title="Conversaciones"
              value={progress?.completed_conversations || 0}
            />
            <SmallStat
              icon="📍"
              title="Lugares Preparados"
              value={progress?.completed_places || 0}
            />
            <SmallStat
              icon="📅"
              title="Rutinas realizadas"
              value={progress?.completed_routines || 0}
            />
            <SmallStat
              icon="😊"
              title="Emociones"
              value={progress?.completed_moods || 0}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {accesos.map((item) => (
            <motion.div
              key={item.titulo}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25 }}
            >
              <Link
                to={item.ruta}
                className={`${item.color} block rounded-[2rem] p-7 shadow-md hover:shadow-lg transition min-h-[220px]`}
              >
                <div className="text-5xl mb-5">{item.emoji}</div>

                <h2 className="text-2xl font-extrabold text-[#4B367C] mb-3">
                  {item.titulo}
                </h2>

                <p className="text-[#6B5A95] text-lg leading-relaxed">
                  {item.descripcion}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[#9B7BE8] font-bold mb-2">
              {user?.role === "parent"
                ? "Actividad sugerida para acompañar"
                : "Actividad recomendada del día"}
            </p>

            <h2 className="text-3xl md:text-4xl font-extrabold text-[#4B367C] mb-3">
              Prepararme para visitar un lugar
            </h2>

            <p className="text-[#6B5A95] text-lg max-w-2xl">
              {user?.role === "parent"
                ? "Puedes preparar junto al niño una visita a un lugar nuevo o importante."
                : "Félix puede mostrarte paso a paso qué puede ocurrir antes de ir a un lugar nuevo."}
            </p>
          </div>

          <Link
            to="/lugares"
            className="bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white font-bold px-8 py-4 rounded-full transition whitespace-nowrap"
          >
            {user?.role === "parent" ? "Registrar lugar" : "Ir a prepararme"}
          </Link>
        </div>
      </section>
    </main>
  );
};

const DashboardCard = ({ icon, title, value, color }) => {
  return (
    <div className={`${color} rounded-[2rem] p-6 shadow-md`}>
      <div className="text-5xl mb-3">{icon}</div>
      <h2 className="text-xl font-bold text-[#4B367C]">{title}</h2>
      <p className="text-5xl font-extrabold text-[#4B367C] mt-3">{value}</p>
    </div>
  );
};

const SmallStat = ({ icon, title, value }) => {
  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-md text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-[#6B5A95] font-semibold">{title}</p>
      <p className="text-3xl font-extrabold text-[#4B367C]">{value}</p>
    </div>
  );
};

export default Home;
