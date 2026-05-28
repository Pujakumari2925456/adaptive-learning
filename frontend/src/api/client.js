import axios from "axios";

// In production (Vercel), VITE_API_URL points to Railway backend
// In development, proxy handles /api → localhost:8000
const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({ baseURL: BASE_URL + "/api" });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────
// export const register = (data) => api.post('/auth/register', data)
export const register = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const login = (usernameOrParams, password) => {
  // Accept either (URLSearchParams) or (username, password)
  let params;
  if (usernameOrParams instanceof URLSearchParams) {
    params = usernameOrParams;
  } else {
    params = new URLSearchParams();
    params.append("username", usernameOrParams);
    params.append("password", password);
  }
  return api.post("/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

export const getMe = () => api.get("/auth/me");

// ── Topics ────────────────────────────────────────────────────────
export const getAllTopics = () => api.get("/topics/all");
export const getGraphData = () => api.get("/topics/graph");
export const getLearningPath = (known) =>
  api.post("/topics/learning-path", { known_topic_ids: known });
export const markKnown = (known) =>
  api.post("/topics/mark-known", { known_topic_ids: known });
export const getMyProgress = () => api.get("/topics/my-progress");

// ── Quiz ──────────────────────────────────────────────────────────
export const generateQuiz = (topicId) => api.get(`/quiz/generate/${topicId}`);
export const submitQuiz = (data) => api.post("/quiz/submit", data);

// ── Progress / Dashboard ──────────────────────────────────────────
export const getDashboard = () => api.get("/progress/dashboard");
