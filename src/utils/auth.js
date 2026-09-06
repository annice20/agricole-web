import axios from "axios";

// Clé unique alignée avec l'intercepteur
const STORAGE_KEY = "session";

export const saveSession = (userData, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } else {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }
};

export const getSession = () => {
  try {
    const data =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

export const updateSessionUser = (updates) => {
  const enLocal = !!localStorage.getItem(STORAGE_KEY);
  const storage = enLocal ? localStorage : sessionStorage;
  const data = storage.getItem(STORAGE_KEY);
  if (!data) return;
  const session = JSON.parse(data);
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...session, ...updates }));
};
