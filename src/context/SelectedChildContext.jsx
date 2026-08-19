import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useFloFlo } from "./FloFloContext";
import { getParentChildrenForSelection } from "../services/selectedChildService";

const SelectedChildContext = createContext(null);

const STORAGE_KEY_PREFIX = "floflo_selected_child_id";
const LEGACY_STORAGE_KEY_PREFIX = "selectedChild";

const getStorageKeyId = (userId) =>
  userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;

const getLegacyStorageKey = (userId) =>
  userId ? `${LEGACY_STORAGE_KEY_PREFIX}_${userId}` : LEGACY_STORAGE_KEY_PREFIX;

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

    relationship_key: child.relationship_key || child.relationshipKey || null,

    access_profile: child.access_profile || child.accessProfile || null,

    can_manage_team: Boolean(child.can_manage_team ?? child.canManageTeam),
  };
};

const getStoredLegacyChildId = (userId) => {
  try {
    const storedChild = localStorage.getItem(getLegacyStorageKey(userId));

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
  const [loadedForUserId, setLoadedForUserId] = useState(null);

  const isParent = user?.role === "parent";

  const selectedChild = useMemo(() => {
    if (
      !selectedChildId ||
      !user?.id ||
      Number(loadedForUserId) !== Number(user.id)
    ) {
      return null;
    }

    return (
      parentChildren.find(
        (child) => Number(child.id) === Number(selectedChildId),
      ) || null
    );
  }, [parentChildren, selectedChildId, loadedForUserId, user?.id]);

  const safeSelectedChildId = selectedChild
  ? String(selectedChild.id)
  : "";

  const selectedAccessProfile =
    selectedChild?.access_profile || selectedChild?.accessProfile || null;

  const selectedRelationshipKey =
    selectedChild?.relationship_key || selectedChild?.relationshipKey || null;

  const canManageSelectedChildTeam = Boolean(
    selectedChild?.can_manage_team ?? selectedChild?.canManageTeam,
  );

  const isPrimaryCaregiver = selectedAccessProfile === "primary_caregiver";

  const isCaregiver = ["primary_caregiver", "caregiver"].includes(
    selectedAccessProfile,
  );

  const isTherapist = selectedAccessProfile === "therapist";

  const isTeacher = selectedAccessProfile === "teacher";

  const isFamily = selectedAccessProfile === "family";

  const isProfessional = selectedAccessProfile === "professional";

  const observationProfileLabel = (() => {
    if (isTherapist) return "Observación profesional";
    if (isTeacher) return "Observación educativa";
    if (isProfessional) return "Observación profesional";
    if (isFamily) return "Observación familiar";

    return "Observación del cuidador";
  })();

  const syncSelectedChildStorage = (childId, childrenList = parentChildren) => {
    const cleanId = childId ? String(childId) : "";

    const storageKey = getStorageKeyId(user?.id);
    const legacyStorageKey = getLegacyStorageKey(user?.id);

    if (!cleanId) {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(legacyStorageKey);

      window.dispatchEvent(new Event("selectedChildChanged"));
      return;
    }

    const child = childrenList.find(
      (item) => Number(item.id) === Number(cleanId),
    );

    if (!child) {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(legacyStorageKey);

      window.dispatchEvent(new Event("selectedChildChanged"));
      return;
    }

    localStorage.setItem(storageKey, cleanId);

    localStorage.setItem(
      legacyStorageKey,
      JSON.stringify({
        ...child,
        firstName: child.first_name,
        lastName: child.last_name,
      }),
    );

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
    setLoadedForUserId(null);

    if (user?.id) {
      localStorage.removeItem(getStorageKeyId(user.id));
      localStorage.removeItem(getLegacyStorageKey(user.id));
    }

    window.dispatchEvent(new Event("selectedChildChanged"));
  };

  const loadParentChildren = async () => {
    const currentUserId = user?.id;

    if (!currentUserId || user?.role !== "parent") {
      clearSelectedChild();
      return;
    }

    try {
      /*
       * Muy importante:
       * invalida inmediatamente cualquier selección
       * perteneciente al usuario anterior.
       */
      setLoadingChildren(true);
      setParentChildren([]);
      setSelectedChildId("");
      setLoadedForUserId(null);

      const data = await getParentChildrenForSelection();

      const normalizedChildren = (Array.isArray(data) ? data : [])
        .map(normalizeChild)
        .filter((child) => Number.isFinite(child.id));

      setParentChildren(normalizedChildren);
      setLoadedForUserId(Number(currentUserId));

      const storageKey = getStorageKeyId(currentUserId);

      const savedChildId =
        localStorage.getItem(storageKey) ||
        getStoredLegacyChildId(currentUserId);

      const savedChildExists = normalizedChildren.some(
        (child) => Number(child.id) === Number(savedChildId),
      );

      if (savedChildExists) {
        setSelectedChildId(String(savedChildId));

        syncSelectedChildStorage(String(savedChildId), normalizedChildren);

        return;
      }

      if (normalizedChildren.length > 0) {
        const firstChildId = String(normalizedChildren[0].id);

        setSelectedChildId(firstChildId);

        syncSelectedChildStorage(firstChildId, normalizedChildren);

        return;
      }

      localStorage.removeItem(storageKey);
      localStorage.removeItem(getLegacyStorageKey(currentUserId));
    } catch (error) {
      console.error("Error cargando hijos del padre:", error);

      setParentChildren([]);
      setSelectedChildId("");
      setLoadedForUserId(null);
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
    selectedChildId: safeSelectedChildId,
    loadingChildren,

    selectedAccessProfile,
    selectedRelationshipKey,
    canManageSelectedChildTeam,

    isPrimaryCaregiver,
    isCaregiver,
    isTherapist,
    isTeacher,
    isFamily,
    isProfessional,

    observationProfileLabel,

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
