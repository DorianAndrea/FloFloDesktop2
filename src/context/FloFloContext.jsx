import { createContext, useContext, useState } from "react";

const FloFloContext = createContext();

export const FloFloProvider = ({ children }) => {
  const [mood, setMood] = useState(null);

  const [points, setPoints] = useState(0);

  const [completedConversations, setCompletedConversations] = useState([]);

  const [soundEnabled, setSoundEnabled] = useState(true);

  const [level, setLevel] = useState(1);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMood(null);
    setPoints(0);
    setCompletedConversations([]);
  };

  const value = {
    user,
    setUser,
    logout,

    mood,
    setMood,

    points,
    setPoints,

    level,
    setLevel,

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