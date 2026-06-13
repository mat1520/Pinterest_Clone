import api from "./api";

const pinService = {
  async getAll(query = "", autorId = null) {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (autorId) params.append("autor_id", autorId);
    
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

    const { data } = await api.post("/pins", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
};

export default pinService;
