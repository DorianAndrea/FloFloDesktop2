import { useEffect, useState } from "react";

import {
  addExperienceFavorite,
  removeExperienceFavorite,
} from "../../../services/experienceFavoriteService";

const FavoriteButton = ({
  templateId,
  initialFavorite = false,
  onChange,
}) => {
  const [favorite, setFavorite] = useState(Boolean(initialFavorite));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFavorite(Boolean(initialFavorite));
  }, [initialFavorite]);

  const toggleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (loading) return;

    const nextFavorite = !favorite;

    // Cambio visual inmediato
    setFavorite(nextFavorite);
    setLoading(true);

    try {
      if (nextFavorite) {
        await addExperienceFavorite(templateId);
      } else {
        await removeExperienceFavorite(templateId);
      }

      onChange?.(nextFavorite);
    } catch (error) {
      console.error("Error actualizando favorita:", error);

      // Si falla backend, revertimos
      setFavorite(!nextFavorite);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={
        favorite
          ? "Quitar de favoritas"
          : "Agregar a favoritas"
      }
      aria-pressed={favorite}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl transition ${
        favorite
          ? "bg-[#FFF7D6] hover:bg-[#FFF0AE]"
          : "bg-[#F7F3FF] hover:bg-[#EEE7FA]"
      } ${
        loading
          ? "cursor-wait opacity-60"
          : "hover:scale-110"
      }`}
    >
      {loading ? "…" : favorite ? "⭐" : "☆"}
    </button>
  );
};

export default FavoriteButton;