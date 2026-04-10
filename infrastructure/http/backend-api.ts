import "server-only";
import axios from "axios";
import {
  getBackendApiBaseUrl,
  getInternalApiToken,
} from "@/infrastructure/http/backend-env";

export const backendApi = axios.create({
  baseURL: getBackendApiBaseUrl(),
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

backendApi.interceptors.request.use((config) => {
  const internalApiToken = getInternalApiToken();

  if (internalApiToken) {
    config.headers.set("x-internal-api-token", internalApiToken);
    config.headers.delete("Authorization");
  }

  return config;
});
