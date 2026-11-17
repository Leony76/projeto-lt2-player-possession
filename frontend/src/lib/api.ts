import axios, { type InternalAxiosRequestConfig } from "axios";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL         : import.meta.env.VITE_API_URL,
  withCredentials : true,
});

const refreshClient = axios.create({
  baseURL         : import.meta.env.VITE_API_URL,
  withCredentials : true,
});


let refreshPromise: Promise<void> | null = null;

const isAuthEndpoint = (url?: string) => {
  return [
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/sign-out",
    "/auth/refresh",
  ].some(endpoint => url?.includes(endpoint));
};

api.interceptors.response.use(
  response => response,

  async error => {

    const originalRequest = error.config as RetryConfig | undefined;

    const status = error.response?.status;
    const code = error.response?.data?.code;

    const shouldRefresh = [
      "ACCESS_TOKEN_EXPIRED",
      "ACCESS_TOKEN_MISSING",
    ].includes(code);

    if (
      status !== 401 ||
      !shouldRefresh ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post("/auth/refresh")
          .then(() => undefined)
          .finally(() => {
            refreshPromise = null;
          })
        ;
      }

      await refreshPromise;

      return api(originalRequest);

    } catch (refreshError : unknown) {
      window.dispatchEvent(new Event("session-expired"));

      return Promise.reject(refreshError);
    }
  }
);