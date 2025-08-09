import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken } from "../lib/api";

type User = { id: string; email: string; name: string };

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  initialized: boolean;
  signup: (data: { email: string; name: string; password: string }) => Promise<void>;
  signin: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  function setTokenBoth(t: string | null) {
    setToken(t);
    setAccessToken(t);
  }

  // Try silent refresh
  useEffect(() => {
    (async () => {
      try {
        const r = await api.post("/auth/refresh"); // cookie-only
        setTokenBoth(r.data.accessToken);
        const me = await api.get<User>("/users/me");
        setUser(me.data);
      } catch {
        setTokenBoth(null);
        setUser(null);
      } finally {
        setInitialized(true);
      }
    })();
  }, []);

  async function signup(data: { email: string; name: string; password: string }) {
    const r = await api.post<{ user: User; accessToken: string }>("/auth/signup", data);
    setUser(r.data.user);
    setTokenBoth(r.data.accessToken);
  }

  async function signin(data: { email: string; password: string }) {
    const r = await api.post<{ user: User; accessToken: string }>("/auth/signin", data);
    setUser(r.data.user);
    setTokenBoth(r.data.accessToken);
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
    setTokenBoth(null);
  }

  return (
    <AuthCtx.Provider value={{ user, accessToken, initialized, signup, signin, logout }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
