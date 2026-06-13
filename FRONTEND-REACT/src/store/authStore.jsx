import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((userData) => {
        setUser(userData);
        setAuthenticated(true);
      })
      .catch(() => {
        setUser(null);
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (correo, clave) => {
    await authService.login(correo, clave);
    const userData = await authService.getCurrentUser();
    setUser(userData);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setAuthenticated(false);
    setUser(null);
  }, []);

  const register = useCallback(
    async (nombre, correo, clave, fecha_nacimiento) => {
      await authService.register(nombre, correo, clave, fecha_nacimiento);
    },
    []
  );

  const value = useMemo(
    () => ({ authenticated, user, login, logout, register, loading }),
    [authenticated, user, login, logout, register, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
