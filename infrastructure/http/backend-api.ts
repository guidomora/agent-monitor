import axios from "axios";
import { getBackendApiBaseUrl } from "@/infrastructure/http/backend-env";

export const backendApi = axios.create({
  baseURL: getBackendApiBaseUrl(),
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});
