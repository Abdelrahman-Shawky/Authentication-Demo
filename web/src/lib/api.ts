import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send/receive cookies with CORS (refresh_token)
});

// Module-level token and setter so interceptors can read it
let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };

// Attach Authorization when we have an access token
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// If a request returns 401, try a one-time refresh and retry
let refreshing = false;
let pending: Array<() => void> = [];

// Attempt to refresh token once
async function refreshAccessToken() {
  if (refreshing) {
    await new Promise<void>((res) => pending.push(res));
    return;
  }
  refreshing = true;
  try {
    const r = await api.post("/auth/refresh");
    setAccessToken(r.data.accessToken);
  } catch (e) {
    accessToken = null;
    throw e;
  } finally {
    refreshing = false;
    pending.forEach((fn) => fn());
    pending = [];
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config;
    if (!original) throw error;

    const status = error.response?.status;
    const url = original.url || "";
    const alreadyRetried = (original as any)._retried;

    // Don't refresh 
    if (
      url.startsWith("/auth/signin") ||
      url.startsWith("/auth/signup") ||
      url.startsWith("/auth/refresh") ||
      url.startsWith("/auth/logout")
    ) {
      throw error;
    }

    if (status === 401 && !alreadyRetried) {
      (original as any)._retried = true;
      await refreshAccessToken();
      if (accessToken) {
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${accessToken}`;
      }
      return api.request(original); // retry
    }
    throw error;
  }
);

export default api;
