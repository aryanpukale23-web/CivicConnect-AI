const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("civicconnect_token");
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("civicconnect_token", token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("civicconnect_token");
    localStorage.removeItem("civicconnect_user");
  }
};

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errData = await response.json();
      errorDetail = errData.detail || JSON.stringify(errData);
    } catch {
      errorDetail = await response.text() || response.statusText;
    }
    throw new Error(errorDetail);
  }

  // Handle 204 or empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
