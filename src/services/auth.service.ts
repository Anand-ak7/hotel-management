import { api } from "./api";
import type { LoginResponse } from "../types";

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },
};
