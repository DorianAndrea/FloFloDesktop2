import { Navigate, useLocation } from "react-router-dom";
import { useFloFlo } from "../context/FloFloContext";
import { useSelectedChild } from "../context/SelectedChildContext";

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requireSelectedChild = false,
}) => {
  const location = useLocation();
  const { user } = useFloFlo();
  const { selectedChildId, loadingChildren } = useSelectedChild();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (user.role === "parent" && requireSelectedChild) {
    if (loadingChildren) {
      return (
        <div className="min-h-screen bg-[#F6F0FF] flex items-center justify-center text-[#4B367C] font-bold">
          Cargando niño/a seleccionado...
        </div>
      );
    }

    if (!selectedChildId) {
      return <Navigate to="/panel-padres" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;