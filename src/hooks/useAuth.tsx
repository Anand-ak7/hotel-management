import { createContext, useContext, useMemo, useState } from "react";
import { authService } from "../services/auth.service";
import type { Admin } from "../types";
import { storage } from "../utils/storage";

type AuthContextValue = {
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [admin, setAdmin] = useState<Admin | null>(storage.getAdmin());

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      token,
      isAuthenticated: Boolean(token),
      login: async (email, password) => {
        const response = await authService.login(email, password);
        storage.setToken(response.accessToken);
        storage.setAdmin(response.admin);
        setToken(response.accessToken);
        setAdmin(response.admin);
      },
      logout: () => {
        storage.clearToken();
        storage.clearAdmin();
        setToken(null);
        setAdmin(null);
      },
    }),
    [admin, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
