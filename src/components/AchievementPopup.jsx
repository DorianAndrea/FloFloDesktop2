import { motion, AnimatePresence } from "framer-motion";

const AchievementPopup = ({ achievement }) => {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-24 right-8 z-50 bg-white rounded-3xl shadow-xl p-6 border-4 border-yellow-300 max-w-sm"
        >
          <div className="text-5xl mb-3">{achievement.icon}</div>

          <p className="text-[#9B7BE8] font-bold mb-1">
            Nuevo logro desbloqueado
          </p>

          <h3 className="font-extrabold text-2xl text-[#4B367C]">
            {achievement.name}
          </h3>

          <p className="text-[#6B5A95] mt-2">
            {achievement.description}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementPopup;