import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useFloFlo } from "./FloFloContext";
import { getParentChildrenForSelection } from "../services/selectedChildService";

const SelectedChildContext = createContext(null);

const STORAGE_KEY_ID = "floflo_selected_child_id";
const LEGACY_STORAGE_KEY = "selectedChild";

const normalizeChild = (child) => {
  const id =
    child.id ??
    child.child_id ??
    child.childId ??
    child.user_id ??
    child.userId;

  return {
    ...child,
    id: Number(id),
    first_name:
      child.first_name ||
      child.firstName ||
      child.child_first_name ||
      child.childFirstName ||
      child.name ||
      "",
    last_name:
      child.last_name ||
      child.lastName ||
      child.child_last_name ||
      child.childLastName ||
      "",
    email: child.email || child.child_email || child.childEmail || "",
  };
};

const getStoredLegacyChildId = () => {
  try {
    const storedChild = localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!storedChild) return "";

    const parsedChild = JSON.parse(storedChild);

    return parsedChild?.id ? String(parsedChild.id) : "";
  } catch {
    return "";
  }
};

export const getChildDisplayName = (child) => {
  if (!child) return "Sin niño/a seleccionado";

  const fullName = `${child.first_name || ""} ${child.last_name || ""}`.trim();

  if (fullName) return fullName;

  if (child.email) return child.email;

  return `Niño/a ${child.id}`;
};

export const SelectedChildProvider = ({ children }) => {
  const { user } = useFloFlo();

  const [parentChildren, setParentChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [loadingChildren, setLoadingChildren] = useState(false);

  const isParent = user?.role === "parent";

  const selectedChild = useMemo(() => {
    if (!selectedChildId) return null;

    return (
      parentChildren.find(
        (child) => Number(child.id) === Number(selectedChildId),
      ) || null
    );
  }, [parentChildren, selectedChildId]);

  const syncSelectedChildStorage = (childId, childrenList = parentChildren) => {
    const cleanId = childId ? String(childId) : "";

    if (!cleanId) {
      localStorage.removeItem(STORAGE_KEY_ID);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      window.dispatchEvent(new Event("selectedChildChanged"));
      return;
    }

    const child = childrenList.find(
      (item) => Number(item.id) === Number(cleanId),
    );

    localStorage.setItem(STORAGE_KEY_ID, cleanId);

    if (child) {
      localStorage.setItem(
        LEGACY_STORAGE_KEY,
        JSON.stringify({
          ...child,
          firstName: child.first_name,
          lastName: child.last_name,
        }),
      );
    }

    window.dispatchEvent(new Event("selectedChildChanged"));
  };

  const selectChild = (childId) => {
    const cleanId = childId ? String(childId) : "";

    setSelectedChildId(cleanId);
    syncSelectedChildStorage(cleanId);
  };

  const clearSelectedChild = () => {
    setParentChildren([]);
    setSelectedChildId("");
    localStorage.removeItem(STORAGE_KEY_ID);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.dispatchEvent(new Event("selectedChildChanged"));
  };

  const loadParentChildren = async () => {
    if (!user || user.role !== "parent") {
      clearSelectedChild();
      return;
    }

    try {
      setLoadingChildren(true);

      const data = await getParentChildrenForSelection();

      const normalizedChildren = data
        .map(normalizeChild)
        .filter((child) => Number.isFinite(child.id));

      setParentChildren(normalizedChildren);

      const savedChildId =
        localStorage.getItem(STORAGE_KEY_ID) || getStoredLegacyChildId();

      const savedChildExists = normalizedChildren.some(
        (child) => Number(child.id) === Number(savedChildId),
      );

      if (savedChildExists) {
        setSelectedChildId(savedChildId);
        syncSelectedChildStorage(savedChildId, normalizedChildren);
        return;
      }

      if (normalizedChildren.length > 0) {
        const firstChildId = String(normalizedChildren[0].id);
        setSelectedChildId(firstChildId);
        syncSelectedChildStorage(firstChildId, normalizedChildren);
        return;
      }

      setSelectedChildId("");
      localStorage.removeItem(STORAGE_KEY_ID);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.error("Error cargando hijos del padre:", error);
      clearSelectedChild();
    } finally {
      setLoadingChildren(false);
    }
  };

  useEffect(() => {
    loadParentChildren();
  }, [user?.id, user?.role]);

  const value = {
    isParent,
    parentChildren,
    selectedChild,
    selectedChildId,
    loadingChildren,
    selectChild,
    reloadParentChildren: loadParentChildren,
    getChildDisplayName,
    isViewingChild: isParent && Boolean(selectedChild),
  };

  return (
    <SelectedChildContext.Provider value={value}>
      {children}
    </SelectedChildContext.Provider>
  );
};

export const useSelectedChild = () => {
  const context = useContext(SelectedChildContext);

  if (!context) {
    throw new Error(
      "useSelectedChild debe usarse dentro de SelectedChildProvider",
    );
  }

  return context;
};