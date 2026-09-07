import axios from "axios";

const API = "https://agricole-backend.onrender.com/api/auth";

export const login = async (data) => {
  return axios.post(`${API}/login`, data);
};

export const verifyOtp = async (data) => {
  return axios.post(`${API}/verifier-otp`, data);
};

export const register = async (data) => {
  return axios.post(`${API}/inscription`, data);
};

// =======================
// Gestion de session
// =======================

export const saveSession = (user, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem("session", JSON.stringify(user));
  } else {
    sessionStorage.setItem("session", JSON.stringify(user));
  }
};

export const getSession = () => {
  const session =
    localStorage.getItem("session") || sessionStorage.getItem("session");

  return session ? JSON.parse(session) : null;
};

export const clearSession = () => {
  localStorage.removeItem("session");
  sessionStorage.removeItem("session");
};

export const demanderReinitialisation = (email) =>
  axios.post("https://agricole-backend.onrender.com/api/auth/forgot-password", {
    email,
  });

export const reinitialiserMotDePasse = (token, nouveauMotDePasse) =>
  axios.post("https://agricole-backend.onrender.com/api/auth/reset-password", {
    token,
    nouveauMotDePasse,
  });

export const inscrireAgriculteur = (data) =>
  axios.post(`${API}/inscription`, data);

export const resendOtp = async (email) => {
  return axios.post(`${API}/renvoyer-otp`, {
    email,
  });
};
