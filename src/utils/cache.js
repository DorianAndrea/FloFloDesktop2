export const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    return JSON.parse(cached);
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export const setCachedData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Si localStorage falla, no rompemos la app
  }
};

export const removeCachedData = (key) => {
  localStorage.removeItem(key);
};