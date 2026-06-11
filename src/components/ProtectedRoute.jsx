import { Navigate } from "react-router-dom";
import { useFloFlo } from "../context/FloFloContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useFloFlo();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;