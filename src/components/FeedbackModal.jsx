import { motion, AnimatePresence } from "framer-motion";

const typeStyles = {
  success: {
    icon: "✅",
    border: "border-green-300",
    title: "text-[#4B367C]",
    button: "bg-green-500 hover:bg-green-600 text-white",
  },
  error: {
    icon: "❌",
    border: "border-red-300",
    title: "text-red-600",
    button: "bg-red-500 hover:bg-red-600 text-white",
  },
  warning: {
    icon: "⚠️",
    border: "border-yellow-300",
    title: "text-[#4B367C]",
    button: "bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white",
  },
  danger: {
    icon: "🗑️",
    border: "border-red-300",
    title: "text-red-600",
    button: "bg-red-500 hover:bg-red-600 text-white",
  },
  info: {
    icon: "💜",
    border: "border-[#DCCCF8]",
    title: "text-[#4B367C]",
    button: "bg-[#9B7BE8] hover:bg-[#8B6FD6] text-white",
  },
};

const FeedbackModal = ({ modal, onClose, onConfirm }) => {
  const style = typeStyles[modal?.type] || typeStyles.info;

  return (
    <AnimatePresence>
      {modal && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`bg-white rounded-[2rem] shadow-2xl p-8 border-4 ${style.border} max-w-md w-full text-center`}
          >
            <div className="text-6xl mb-4">{modal.icon || style.icon}</div>

            {modal.label && (
              <p className="text-[#9B7BE8] font-bold mb-2">{modal.label}</p>
            )}

            <h2 className={`text-3xl font-extrabold mb-4 ${style.title}`}>
              {modal.title}
            </h2>

            {modal.message && (
              <p className="text-[#6B5A95] text-lg mb-8">{modal.message}</p>
            )}

            {modal.mode === "confirm" ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-[#E8DDFF] hover:bg-[#D8C7FF] text-[#4B367C] font-bold py-3 rounded-2xl transition"
                >
                  {modal.cancelText || "Cancelar"}
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  className={`w-full font-bold py-3 rounded-2xl transition ${style.button}`}
                >
                  {modal.confirmText || "Aceptar"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className={`w-full font-bold py-3 rounded-2xl transition ${style.button}`}
              >
                {modal.confirmText || "Aceptar"}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;