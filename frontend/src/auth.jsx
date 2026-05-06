import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "./api/client";

const ACCESS_TOKEN_KEY = "jobPortalAccessToken";
const REFRESH_TOKEN_KEY = "jobPortalRefreshToken";
const USER_KEY = "jobPortalUser";

const AuthContext = createContext(null);

function persistSession({ access, refresh, user }) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSessionStorage() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

function readSessionStorage() {
  const access = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  const userRaw = window.localStorage.getItem(USER_KEY);

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  return { access, refresh, user };
}

async function fetchCurrentUser() {
  return apiRequest("/auth/me/");
}

async function refreshTokens(refreshToken) {
  return apiRequest("/auth/refresh/", {
    method: "POST",
    skipAuth: true,
    body: { refresh: refreshToken },
  });
}

export function dashboardPathForRole(role) {
  if (role === "employer") {
    return "/dashboard/employer";
  }
  if (role === "admin") {
    return "/dashboard/admin";
  }
  return "/dashboard/seeker";
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const storedSession = readSessionStorage();
      if (!storedSession.access || !storedSession.refresh) {
        if (!cancelled) {
          clearSessionStorage();
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          setStatus("ready");
        }
        return;
      }

      setAccessToken(storedSession.access);
      setRefreshToken(storedSession.refresh);
      if (storedSession.user) {
        setUser(storedSession.user);
      }

      try {
        const currentUser = await fetchCurrentUser();
        if (cancelled) {
          return;
        }
        persistSession({
          access: storedSession.access,
          refresh: storedSession.refresh,
          user: currentUser,
        });
        setUser(currentUser);
        setStatus("ready");
      } catch {
        try {
          const refreshed = await refreshTokens(storedSession.refresh);
          const currentUser = await fetchCurrentUser();
          if (cancelled) {
            return;
          }
          persistSession({
            access: refreshed.access,
            refresh: refreshed.refresh,
            user: currentUser,
          });
          setAccessToken(refreshed.access);
          setRefreshToken(refreshed.refresh);
          setUser(currentUser);
          setStatus("ready");
        } catch {
          if (cancelled) {
            return;
          }
          clearSessionStorage();
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          setStatus("ready");
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(credentials) {
    const payload = await apiRequest("/auth/login/", {
      method: "POST",
      skipAuth: true,
      body: credentials,
    });
    persistSession(payload);
    setAccessToken(payload.access);
    setRefreshToken(payload.refresh);
    setUser(payload.user);
    setStatus("ready");
    return payload.user;
  }

  async function register(details) {
    const payload = await apiRequest("/auth/register/", {
      method: "POST",
      skipAuth: true,
      body: details,
    });
    persistSession(payload);
    setAccessToken(payload.access);
    setRefreshToken(payload.refresh);
    setUser(payload.user);
    setStatus("ready");
    return payload.user;
  }

  async function refreshSession() {
    if (!refreshToken) {
      throw new Error("No refresh token available.");
    }

    const refreshed = await refreshTokens(refreshToken);
    const currentUser = await fetchCurrentUser();
    persistSession({
      access: refreshed.access,
      refresh: refreshed.refresh,
      user: currentUser,
    });
    setAccessToken(refreshed.access);
    setRefreshToken(refreshed.refresh);
    setUser(currentUser);
    return currentUser;
  }

  function logout() {
    clearSessionStorage();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setStatus("ready");
  }

  const value = useMemo(
    () => ({
      status,
      user,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(user && accessToken),
      login,
      register,
      refreshSession,
      logout,
    }),
    [status, user, accessToken, refreshToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
