import axios from "axios";

export const api = axios.create({
  baseURL         : import.meta.env.VITE_API_URL,
  withCredentials : true,
});

api.interceptors.response.use((response) => response,(error) => {
  
    const status = error.response?.status;
    const requestURL = error.config?.url;

    const isAuthEndpoint = [
      "/auth/sign-in",
      "/auth/sign-up",
      "/auth/sign-out",
      "/auth/me",
    ].some((endpoint) => requestURL?.includes(endpoint));

    if (status === 401 && !isAuthEndpoint) {
      window.dispatchEvent(new Event("session-expired"));
    }

    return Promise.reject(error);
  }
);