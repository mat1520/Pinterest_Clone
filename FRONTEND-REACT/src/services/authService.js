import api, { TOKEN_KEY } from "./api";

const authService = {
  async register(nombre, correo, clave, fecha_nacimiento) {
    const { data } = await api.post("/auth/register", {
      nombre,
      correo,
      clave,
      fecha_nacimiento,
    });
    return data;
  },

  async login(correo, clave) {
    const { data } = await api.post("/auth/login", { correo, clave });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },

  async getCurrentUser() {
    const { data } = await api.get("/users/me");
    return data;
  },
};

export default authService;
