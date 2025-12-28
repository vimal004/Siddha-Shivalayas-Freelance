import axios from "axios";

// Get the stored token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Get the stored user data
export const getUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Check if user is admin
export const isAdmin = () => {
  const user = getUser();
  return user?.role === "admin";
};

// Check if user is staff
export const isStaff = () => {
  const user = getUser();
  return user?.role === "staff";
};

// Get user role
export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

// Login function
export const login = async (email, password) => {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });

  const { token, user } = response.data;

  // Store token and user info
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return { token, user };
};

// Logout function
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Get auth headers for API requests
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create axios instance with auth headers
export const createAuthAxios = () => {
  const instance = axios.create();

  instance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token expired or invalid - logout and redirect
        if (error.response?.status === 401) {
          logout();
          window.location.href = "/";
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Authenticated axios instance
export const authAxios = createAuthAxios();

export default {
  getToken,
  getUser,
  isAuthenticated,
  isAdmin,
  isStaff,
  getUserRole,
  login,
  logout,
  getAuthHeaders,
  authAxios,
};
