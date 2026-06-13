import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(
    authService.isAuthenticated
  );
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    if (authenticated) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch {
        setAuthenticated(false);
        setUser(null);
        authService.logout();
      }
    } else {
      setUser(null);
    }
  }, [authenticated]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (correo, clave) => {
    await authService.login(correo, clave);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
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
    () => ({ authenticated, user, login, logout, register }),
    [authenticated, user, login, logout, register]
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
