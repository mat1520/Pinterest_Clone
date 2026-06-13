import api from "./api";

const pinService = {
  async getAll(query = "", autorId = null, offset = 0, limit = 20) {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (autorId) params.append("autor_id", autorId);
    params.append("offset", offset);
    params.append("limit", limit);

    const { data } = await api.get(`/pins?${params.toString()}`);
    return data;
  },

  async delete(pinId) {
    await api.delete(`/pins/${pinId}`);
  },

  async getById(pinId) {
    const { data } = await api.get(`/pins/${pinId}`);
    return data;
  },

  async create(titulo, archivo, categoria = "", descripcion = "") {
    const form = new FormData();
    form.append("titulo", titulo);
    form.append("archivo", archivo);
    if (categoria) form.append("categoria", categoria);
    if (descripcion) form.append("descripcion", descripcion);

    const { data } = await api.post("/pins", form);
    return data;
  },

  async getComments(pinId) {
    const { data } = await api.get(`/pins/${pinId}/comments`);
    return data;
  },

  async createComment(pinId, texto) {
    const { data } = await api.post(`/pins/${pinId}/comments`, { texto });
    return data;
  },

  async deleteComment(pinId, commentId) {
    await api.delete(`/pins/${pinId}/comments/${commentId}`);
  },

  async toggleLike(pinId) {
    const { data } = await api.post(`/pins/${pinId}/like`);
    return data;
  },

  async getLikes(pinId) {
    const { data } = await api.get(`/pins/${pinId}/likes`);
    return data;
  },

  async toggleSave(pinId) {
    const { data } = await api.post(`/pins/${pinId}/save`);
    return data;
  },

  async getSavedStatus(pinId) {
    const { data } = await api.get(`/pins/${pinId}/save`);
    return data;
  },

  async getSaved() {
    const { data } = await api.get("/pins/saved");
    return data;
  },
};

export default pinService;
