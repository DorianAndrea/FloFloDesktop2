import { createContext, useContext, useEffect, useState } from "react";

const FloFloContext = createContext();

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return null;

    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
};

export const FloFloProvider = ({ children }) => {
  const [mood, setMood] = useState(null);

  const [points, setPoints] = useState(0);

  const [completedConversations, setCompletedConversations] = useState([]);

  const [soundEnabled, setSoundEnabled] = useState(true);

  const [level, setLevel] = useState(1);

  const [user, setUser] = useState(getStoredUser);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedChild");

    setUser(null);
    setMood(null);
    setPoints(0);
    setLevel(1);
    setCompletedConversations([]);
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener("floflo:auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("floflo:auth-expired", handleAuthExpired);
    };
  }, []);

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
    <FloFloContext.Provider value={value}>{children}</FloFloContext.Provider>
  );
};

export const useFloFlo = () => {
  return useContext(FloFloContext);
};