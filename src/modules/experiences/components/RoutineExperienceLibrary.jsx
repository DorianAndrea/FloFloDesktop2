import { useEffect, useMemo, useState } from "react";
import { getExperienceLibrary } from "../../../services/experienceLibraryService";
import FavoriteButton from "./FavoriteButton";
import {
  getExperienceRecommendations
} from "../../../services/experienceRecommendationService";
import { getExperienceRecents } from "../../../services/experienceRecentService";

const RoutineExperienceLibrary = ({ onSelect, childId = null }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedContext, setSelectedContext] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [openCategories, setOpenCategories] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [recents, setRecents] = useState([]);
  const [loadingRecents, setLoadingRecents] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  useEffect(() => {
    loadRecommendations();
    loadRecents();
  }, [childId]);

  const loadLibrary = async () => {
    try {
      setLoading(true);

      const data = await getExperienceLibrary();

      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando biblioteca:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      setLoadingRecommendations(true);

      const data = await getExperienceRecommendations(childId);

      setRecommendations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando recomendaciones:", error);
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const loadRecents = async () => {
    try {
      setLoadingRecents(true);

      const data = await getExperienceRecents(childId);

      setRecents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setRecents([]);
    } finally {
      setLoadingRecents(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const availableContexts = useMemo(() => {
    const contextMap = new Map();

    categories.forEach((category) => {
      category.templates?.forEach((template) => {
        if (template.learning_context_id && template.learning_context_name) {
          contextMap.set(String(template.learning_context_id), {
            id: String(template.learning_context_id),
            name: template.learning_context_name,
            icon: template.learning_context_icon || "📍",
          });
        }
      });
    });

    return Array.from(contextMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    );
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories
      .filter((category) => {
        if (selectedCategory === "all") {
          return true;
        }

        return String(category.id) === selectedCategory;
      })
      .map((category) => {
        const filteredTemplates = (category.templates || []).filter(
          (template) => {
            const matchesSearch =
              !normalizedSearch ||
              template.name?.toLowerCase().includes(normalizedSearch) ||
              template.description?.toLowerCase().includes(normalizedSearch) ||
              category.name?.toLowerCase().includes(normalizedSearch) ||
              template.learning_context_name
                ?.toLowerCase()
                .includes(normalizedSearch);

            const matchesContext =
              selectedContext === "all" ||
              !template.learning_context_id ||
              String(template.learning_context_id) === selectedContext;

            const minutes = Number(template.estimated_minutes || 0);

            let matchesDuration = true;

            if (selectedDuration === "short") {
              matchesDuration = minutes > 0 && minutes <= 10;
            }

            if (selectedDuration === "medium") {
              matchesDuration = minutes > 10 && minutes <= 30;
            }

            if (selectedDuration === "long") {
              matchesDuration = minutes > 30;
            }

            return matchesSearch && matchesContext && matchesDuration;
          },
        );

        return {
          ...category,
          templates: filteredTemplates,
        };
      })
      .filter((category) => category.templates.length > 0);
  }, [
    categories,
    normalizedSearch,
    selectedCategory,
    selectedContext,
    selectedDuration,
  ]);
  const favoriteTemplates = useMemo(() => {
    return filteredCategories.flatMap((category) =>
      (category.templates || [])
        .filter((template) => template.is_favorite)
        .map((template) => ({
          ...template,
          category_name: category.name,
          category_icon: category.icon,
          category_color: category.color,
        })),
    );
  }, [filteredCategories]);

  const totalResults = filteredCategories.reduce(
    (total, category) => total + category.templates.length,
    0,
  );

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedContext("all");
    setSelectedDuration("all");
  };
  
  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center font-bold text-[#6B5A95]">
        Cargando experiencias...
      </div>
    );
  }
  const toggleCategory = (categoryId) => {
    setOpenCategories((current) => ({
      ...current,
      [categoryId]:
        current[categoryId] === undefined ? false : !current[categoryId],
    }));
  };

  const isCategoryOpen = (categoryId) => {
    return openCategories[categoryId] !== false;
  };

  const handleFavoriteChange = (templateId, isFavorite) => {
    // Sincroniza biblioteca y sección Favoritas
    setCategories((currentCategories) =>
      currentCategories.map((category) => ({
        ...category,

        templates: (category.templates || []).map((template) =>
          String(template.id) === String(templateId)
            ? {
                ...template,
                is_favorite: isFavorite,
              }
            : template,
        ),
      })),
    );

    // Sincroniza Recomendadas
    setRecommendations((currentRecommendations) =>
      currentRecommendations.map((template) =>
        String(template.template_id) === String(templateId)
          ? {
              ...template,
              is_favorite: isFavorite,
            }
          : template,
      ),
    );
  };
  const formatRelativeTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    const now = new Date();

    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "Hace un momento";
    }

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} ${diffMinutes === 1 ? "minuto" : "minutos"}`;
    }

    if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    }

    if (diffDays === 1) {
      return "Ayer";
    }

    if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    }

    return date.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
    });
  };
  const hasActiveFilters =
    Boolean(normalizedSearch) ||
    selectedCategory !== "all" ||
    selectedContext !== "all" ||
    selectedDuration !== "all";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#4B367C] md:text-4xl">
          Biblioteca FloFlo
        </h1>

        <p className="mt-2 text-[#6B5A95]">
          Busca y selecciona una experiencia para personalizarla.
        </p>
      </div>

      <div className="rounded-[2rem] border-2 border-[#E8DEFF] bg-white p-5 shadow-sm md:p-6">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
            🔎
          </span>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar: dormir, colegio, lavarse, ayuda..."
            className="w-full rounded-2xl border-2 border-[#DCCCF8] bg-[#FCFAFF] py-4 pl-12 pr-4 font-semibold text-[#4B367C] outline-none transition placeholder:text-[#9B8DB8] focus:border-[#9B7BE8]"
          />
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#9B7BE8]">
            Categoría
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                selectedCategory === "all"
                  ? "bg-[#9B7BE8] text-white"
                  : "bg-[#F3ECFF] text-[#5F4A8B] hover:bg-[#E8DDFF]"
              }`}
            >
              Todas
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(String(category.id))}
                className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                  selectedCategory === String(category.id)
                    ? "bg-[#9B7BE8] text-white"
                    : "bg-[#F3ECFF] text-[#5F4A8B] hover:bg-[#E8DDFF]"
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.15em] text-[#9B7BE8]">
              Contexto
            </label>

            <select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              className="w-full rounded-2xl border-2 border-[#DCCCF8] bg-white p-3 font-bold text-[#5F4A8B] outline-none focus:border-[#9B7BE8]"
            >
              <option value="all">Cualquier contexto</option>

              {availableContexts.map((context) => (
                <option key={context.id} value={context.id}>
                  {context.icon} {context.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.15em] text-[#9B7BE8]">
              Duración
            </label>

            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full rounded-2xl border-2 border-[#DCCCF8] bg-white p-3 font-bold text-[#5F4A8B] outline-none focus:border-[#9B7BE8]"
            >
              <option value="all">Cualquier duración</option>

              <option value="short">Hasta 10 minutos</option>

              <option value="medium">11 a 30 minutos</option>

              <option value="long">Más de 30 minutos</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="font-bold text-[#6B5A95]">
            {totalResults}{" "}
            {totalResults === 1
              ? "experiencia encontrada"
              : "experiencias encontradas"}
          </p>

          {(search ||
            selectedCategory !== "all" ||
            selectedContext !== "all" ||
            selectedDuration !== "all") && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl px-4 py-2 text-sm font-extrabold text-[#7C5CE6] transition hover:bg-[#F3ECFF]"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
      {!hasActiveFilters && !loadingRecents && recents.length > 0 && (
        <section className="space-y-5">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#9B7BE8]">
              Historial
            </p>

            <h2 className="mt-1 text-2xl font-black text-[#4B367C]">
              🕒 Continuar donde quedaste
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recents.map((template) => (
              <article
                key={template.template_id}
                className="rounded-[2rem] border-2 border-[#E9DEFF] bg-white p-6 transition hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{template.icon}</div>

                  <div className="flex-1">
                    <h3 className="text-xl font-black text-[#4B367C]">
                      {template.name}
                    </h3>

                    <p className="mt-1 text-sm font-extrabold text-[#9B7BE8]">
                      🕒 {formatRelativeTime(template.last_opened_at)}
                    </p>

                    <p className="mt-2 text-sm text-[#6B5A95]">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-extrabold">
                    📋 {template.step_count} pasos
                  </span>

                  <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-extrabold">
                    ⏱ {template.estimated_minutes} min
                  </span>

                  {template.open_count > 1 && (
                    <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-extrabold">
                      👀 Abierta {template.open_count} veces
                    </span>
                  )}
                </div>

                <button
                  className="mt-6 w-full rounded-2xl bg-[#9B7BE8] py-3 font-extrabold text-white"
                  onClick={() => onSelect?.(template.template_id)}
                >
                  Continuar
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {!hasActiveFilters &&
        !loadingRecommendations &&
        recommendations.length > 0 && (
          <section className="space-y-5">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#9B7BE8]">
                Selección inteligente
              </p>

              <h2 className="mt-1 text-2xl font-black text-[#4B367C]">
                ✨ Recomendadas para este momento
              </h2>

              <p className="mt-1 text-sm font-semibold text-[#7D6BA8]">
               FloFlo seleccionó estas experiencias según el aprendizaje observado hasta ahora.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((template) => (
                <article
                  key={`recommendation-${template.template_id}`}
                  className="flex h-full flex-col rounded-[2rem] border-2 border-[#CAB8FF] bg-gradient-to-br from-[#FBF9FF] to-white p-6 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">
                        {template.icon || "✨"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-[#4B367C]">
                          {template.name}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#6B5A95]">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    <FavoriteButton
                      templateId={template.template_id}
                      initialFavorite={template.is_favorite}
                      onChange={(isFavorite) =>
                        handleFavoriteChange(template.template_id, isFavorite)
                      }
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#EEE7FF] px-3 py-1 text-xs font-extrabold text-[#5F4A8B]">
                      🤖 Seleccionada por FloFlo
                    </span>

                    {template.estimated_minutes && (
                      <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-extrabold text-[#5F4A8B]">
                        ⏱ {template.estimated_minutes} min
                      </span>
                    )}

                    <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-extrabold text-[#5F4A8B]">
                      📋 {template.step_count || 0} pasos
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#F7F3FF] p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-[#9B7BE8]">
                      ¿Por qué aparece aquí?
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#5F4A8B]">
                      {template.reason}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelect?.(template.template_id)}
                    className="mt-auto pt-6"
                  >
                    <span className="block w-full rounded-2xl bg-[#7C5CE6] px-5 py-3 text-center font-extrabold text-white transition hover:bg-[#6849CF]">
                      Ver experiencia
                    </span>
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

      {!hasActiveFilters && favoriteTemplates.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
              ⭐
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#4B367C]">Favoritas</h2>

              <p className="text-sm font-semibold text-[#7D6BA8]">
                {favoriteTemplates.length}{" "}
                {favoriteTemplates.length === 1
                  ? "experiencia"
                  : "experiencias"}
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {favoriteTemplates.map((template) => (
              <article
                key={`favorite-${template.id}`}
                className="flex h-full flex-col rounded-[2rem] border-2 border-[#F3D77A] bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FFF9E8] text-4xl">
                      {template.icon || "✨"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-[#4B367C]">
                        {template.name}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#6B5A95]">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <FavoriteButton
                    templateId={template.id}
                    initialFavorite={template.is_favorite}
                    onChange={(isFavorite) =>
                      handleFavoriteChange(template.id, isFavorite)
                    }
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {template.estimated_minutes && (
                    <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-extrabold text-[#5F4A8B]">
                      ⏱ {template.estimated_minutes} min
                    </span>
                  )}

                  <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-extrabold text-[#5F4A8B]">
                    📋 {template.step_count || 0} pasos
                  </span>

                  {template.learning_context_name && (
                    <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-extrabold text-[#5F4A8B]">
                      {template.learning_context_icon || "📍"}{" "}
                      {template.learning_context_name}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelect?.(template.id)}
                  className="mt-auto pt-6"
                >
                  <span className="block w-full rounded-2xl bg-[#9B7BE8] px-5 py-3 text-center font-extrabold text-white transition hover:bg-[#8768D6]">
                    Ver experiencia
                  </span>
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {filteredCategories.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-[#DCCCF8] bg-white p-10 text-center">
          <div className="text-5xl">🔎</div>

          <h2 className="mt-4 text-2xl font-black text-[#4B367C]">
            No encontramos experiencias
          </h2>

          <p className="mt-2 text-[#6B5A95]">
            Prueba otra búsqueda o elimina algunos filtros.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-2xl bg-[#9B7BE8] px-5 py-3 font-extrabold text-white"
          >
            Mostrar todas
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <section key={category.id}>
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="mb-5 flex w-full items-center justify-between gap-4 rounded-2xl px-2 py-2 text-left transition hover:bg-[#F7F3FF]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    {category.icon}
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-[#4B367C]">
                      {category.name}
                    </h2>

                    <p className="text-sm font-semibold text-[#7D6BA8]">
                      {category.templates.length}{" "}
                      {category.templates.length === 1
                        ? "experiencia"
                        : "experiencias"}
                    </p>
                  </div>
                </div>

                <span className="text-2xl font-black text-[#7C5CE6]">
                  {isCategoryOpen(category.id) ? "⌃" : "⌄"}
                </span>
              </button>

              {isCategoryOpen(category.id) && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {category.templates.map((template) => (
                    <article
                      key={template.id}
                      className="flex h-full flex-col rounded-[2rem] border-2 border-[#E7DEFF] bg-white p-6 transition hover:-translate-y-1 hover:border-[#9B7BE8] hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F7F3FF] text-4xl">
                            {template.icon || "✨"}
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-xl font-black text-[#4B367C]">
                              {template.name}
                            </h3>

                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#6B5A95]">
                              {template.description}
                            </p>
                          </div>
                        </div>

                        <FavoriteButton
                          templateId={template.id}
                          initialFavorite={template.is_favorite}
                          onChange={(isFavorite) =>
                            handleFavoriteChange(template.id, isFavorite)
                          }
                        />
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {template.estimated_minutes && (
                          <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-extrabold text-[#5F4A8B]">
                            ⏱ {template.estimated_minutes} min
                          </span>
                        )}

                        <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-extrabold text-[#5F4A8B]">
                          📋 {template.step_count || 0} pasos
                        </span>

                        {template.learning_context_name && (
                          <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-extrabold text-[#5F4A8B]">
                            {template.learning_context_icon || "📍"}{" "}
                            {template.learning_context_name}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelect?.(template.id)}
                        className="mt-auto pt-6"
                      >
                        <span className="block w-full rounded-2xl bg-[#9B7BE8] px-5 py-3 text-center font-extrabold text-white transition hover:bg-[#8768D6]">
                          Ver experiencia
                        </span>
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutineExperienceLibrary;
