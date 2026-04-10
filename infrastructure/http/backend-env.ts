const DEFAULT_BACKEND_API_BASE_URL = "http://localhost:3001/";

export function getBackendApiBaseUrl() {
  const value =
    process.env.BACKEND_API_BASE_URL?.trim() || DEFAULT_BACKEND_API_BASE_URL;

  return value.endsWith("/") ? value : `${value}/`;
}
