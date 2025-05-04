import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/", // adjust as needed
});

// Add the token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
