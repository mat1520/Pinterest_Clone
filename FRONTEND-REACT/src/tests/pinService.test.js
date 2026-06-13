import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../services/api";
import pinService from "../services/pinService";

vi.mock("../services/api");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("pinService.getAll", () => {
  it("llama GET /pins con los params correctos", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { items: [], total: 0 } });
    const res = await pinService.getAll("gatos", 5, 0, 20);
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("q=gatos"));
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("autor_id=5"));
  });

  it("devuelve los datos del backend sin modificar", async () => {
    const mockData = { items: [{ id: 1, titulo: "Pin" }], total: 1 };
    api.get = vi.fn().mockResolvedValue({ data: mockData });
    const res = await pinService.getAll();
    expect(res).toEqual(mockData);
  });

  it("lanza error si la API falla", async () => {
    api.get = vi.fn().mockRejectedValue(new Error("Network Error"));
    await expect(pinService.getAll()).rejects.toThrow("Network Error");
  });
});

describe("pinService.getById", () => {
  it("llama GET /pins/:id", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { id: 42, titulo: "Test" } });
    const res = await pinService.getById(42);
    expect(api.get).toHaveBeenCalledWith("/pins/42");
    expect(res.id).toBe(42);
  });
});

describe("pinService.toggleLike", () => {
  it("llama POST /pins/:id/like y devuelve liked + likes_count", async () => {
    api.post = vi.fn().mockResolvedValue({ data: { liked: true, likes_count: 3 } });
    const res = await pinService.toggleLike(1);
    expect(api.post).toHaveBeenCalledWith("/pins/1/like");
    expect(res.liked).toBe(true);
    expect(res.likes_count).toBe(3);
  });
});

describe("pinService.getLikes", () => {
  it("llama GET /pins/:id/likes", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { liked: false, likes_count: 0 } });
    const res = await pinService.getLikes(7);
    expect(api.get).toHaveBeenCalledWith("/pins/7/likes");
    expect(res).toHaveProperty("liked");
    expect(res).toHaveProperty("likes_count");
  });
});

describe("pinService.toggleSave", () => {
  it("llama POST /pins/:id/save y devuelve saved + saves_count", async () => {
    api.post = vi.fn().mockResolvedValue({ data: { saved: true, saves_count: 2 } });
    const res = await pinService.toggleSave(5);
    expect(api.post).toHaveBeenCalledWith("/pins/5/save");
    expect(res.saved).toBe(true);
    expect(res.saves_count).toBe(2);
  });
});

describe("pinService.getSavedStatus", () => {
  it("llama GET /pins/:id/save", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { saved: true } });
    const res = await pinService.getSavedStatus(3);
    expect(api.get).toHaveBeenCalledWith("/pins/3/save");
    expect(res.saved).toBe(true);
  });
});

describe("pinService.getSaved", () => {
  it("llama GET /pins/saved", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { items: [], total: 0 } });
    await pinService.getSaved();
    expect(api.get).toHaveBeenCalledWith("/pins/saved");
  });
});

describe("pinService.delete", () => {
  it("llama DELETE /pins/:id", async () => {
    api.delete = vi.fn().mockResolvedValue({});
    await pinService.delete(99);
    expect(api.delete).toHaveBeenCalledWith("/pins/99");
  });
});

describe("pinService.getComments", () => {
  it("llama GET /pins/:id/comments", async () => {
    api.get = vi.fn().mockResolvedValue({ data: [] });
    await pinService.getComments(10);
    expect(api.get).toHaveBeenCalledWith("/pins/10/comments");
  });
});

describe("pinService.createComment", () => {
  it("llama POST /pins/:id/comments con texto", async () => {
    api.post = vi.fn().mockResolvedValue({ data: { id: 1, texto: "hola" } });
    const res = await pinService.createComment(10, "hola");
    expect(api.post).toHaveBeenCalledWith("/pins/10/comments", { texto: "hola" });
    expect(res.texto).toBe("hola");
  });
});

describe("pinService.deleteComment", () => {
  it("llama DELETE /pins/:id/comments/:cid", async () => {
    api.delete = vi.fn().mockResolvedValue({});
    await pinService.deleteComment(10, 5);
    expect(api.delete).toHaveBeenCalledWith("/pins/10/comments/5");
  });
});
