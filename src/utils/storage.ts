const TOKEN_KEY = "hotel_token";
const ADMIN_KEY = "hotel_admin";

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getAdmin: () => {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setAdmin: (admin: unknown) =>
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin)),
  clearAdmin: () => localStorage.removeItem(ADMIN_KEY),
};
