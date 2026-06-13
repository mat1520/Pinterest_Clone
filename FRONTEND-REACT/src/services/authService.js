import api from "./api";

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
    await api.post("/auth/login", { correo, clave });
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async getCurrentUser() {
    const { data } = await api.get("/users/me");
    return data;
  },

  async checkAuthenticated() {
    try {
      await api.get("/users/me");
      return true;
    } catch {
      return false;
    }
  },
};

export default authService;
