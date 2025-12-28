// API Base URL - adjust this for your deployment
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  VERIFY: `${API_BASE_URL}/auth/verify`,
  ME: `${API_BASE_URL}/auth/me`,

  // Stocks
  STOCKS: `${API_BASE_URL}/stocks`,

  // Patients
  PATIENTS: `${API_BASE_URL}/patients`,

  // Purchases
  PURCHASES: `${API_BASE_URL}/purchases`,

  // Bills
  GENERATE_BILL: `${API_BASE_URL}/generate-bill`,
  BILLS_HISTORY: `${API_BASE_URL}/bills-history`,
  BILLS: `${API_BASE_URL}/bills`,
  BILL_DOWNLOAD: (billId) => `${API_BASE_URL}/bills/download/${billId}`,
};

export default API_BASE_URL;
