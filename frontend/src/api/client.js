export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function readStoredAccessToken() {
  return window.localStorage.getItem("jobPortalAccessToken");
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

function buildErrorMessage(payload, fallbackStatus) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (Array.isArray(payload) && payload.length > 0) {
    return payload.join(", ");
  }

  if (payload && typeof payload === "object") {
    const firstValue = Object.values(payload)[0];
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return firstValue.join(", ");
    }
    if (typeof firstValue === "string" && firstValue.trim()) {
      return firstValue;
    }
  }

  return `Request failed with status ${fallbackStatus}`;
}

export async function apiRequest(path, options = {}) {
  const {
    body,
    headers: incomingHeaders,
    skipAuth = false,
    token,
    ...fetchOptions
  } = options;

  const headers = {
    ...(incomingHeaders || {}),
  };

  const authToken = token ?? (skipAuth ? null : readStoredAccessToken());
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let requestBody = body;
  if (body != null && !(body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
    body: requestBody,
  });

  const payload = await parseResponseBody(response);
  if (!response.ok) {
    throw new ApiError(
      buildErrorMessage(payload, response.status),
      response.status,
      payload,
    );
  }

  return payload;
}
