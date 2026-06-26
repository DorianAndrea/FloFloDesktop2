import { createContext, useContext, useRef, useState } from "react";
import FeedbackModal from "../components/FeedbackModal";

const FeedbackContext = createContext(null);

export const FeedbackProvider = ({ children }) => {
  const [modal, setModal] = useState(null);
  const confirmResolverRef = useRef(null);

  const showFeedback = ({
    type = "info",
    icon,
    label,
    title,
    message,
    confirmText = "Aceptar",
  }) => {
    setModal({
      mode: "feedback",
      type,
      icon,
      label,
      title,
      message,
      confirmText,
    });
  };

  const showConfirm = ({
    type = "warning",
    icon,
    label,
    title,
    message,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
  }) => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;

      setModal({
        mode: "confirm",
        type,
        icon,
        label,
        title,
        message,
        confirmText,
        cancelText,
      });
    });
  };

  const closeModal = () => {
    if (modal?.mode === "confirm" && confirmResolverRef.current) {
      confirmResolverRef.current(false);
      confirmResolverRef.current = null;
    }

    setModal(null);
  };

  const confirmModal = () => {
    if (modal?.mode === "confirm" && confirmResolverRef.current) {
      confirmResolverRef.current(true);
      confirmResolverRef.current = null;
    }

    setModal(null);
  };

  return (
    <FeedbackContext.Provider value={{ showFeedback, showConfirm }}>
      {children}

      <FeedbackModal
        modal={modal}
        onClose={closeModal}
        onConfirm={confirmModal}
      />
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useFeedback debe usarse dentro de FeedbackProvider");
  }

  return context;
};