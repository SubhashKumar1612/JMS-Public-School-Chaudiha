import { createContext, useEffect, useMemo, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("jms_token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("jms_user") || "null"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    token ? localStorage.setItem("jms_token", token) : localStorage.removeItem("jms_token");
    user ? localStorage.setItem("jms_user", JSON.stringify(user)) : localStorage.removeItem("jms_user");
  }, [token, user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, loading, isAuthenticated: Boolean(token), login, logout }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
