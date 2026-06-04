import { createContext, useContext, useState } from "react";

const FloFloContext = createContext();

export const FloFloProvider = ({ children }) => {
  const [mood, setMood] = useState(null);

  const [points, setPoints] = useState(0);

  const [completedConversations, setCompletedConversations] = useState([]);

  const [soundEnabled, setSoundEnabled] = useState(true);

  const value = {
    mood,
    setMood,

    points,
    setPoints,

    completedConversations,
    setCompletedConversations,

    soundEnabled,
    setSoundEnabled,
  };

  return (
    <FloFloContext.Provider value={value}>
      {children}
    </FloFloContext.Provider>
  );
};

export const useFloFlo = () => {
  return useContext(FloFloContext);
};