import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../services/api";
import authService from "../services/authService";

vi.mock("../services/api");

beforeEach(() => vi.clearAllMocks());

describe("authService.register", () => {
  it("llama POST /auth/register con los datos correctos", async () => {
    api.post = vi.fn().mockResolvedValue({ data: { id: 1, correo: "a@b.com" } });
    await authService.register("Ana", "a@b.com", "Pass1!", "2000-01-01");
    expect(api.post).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({ correo: "a@b.com", nombre: "Ana" })
    );
  });

  it("lanza error si el servidor rechaza", async () => {
    api.post = vi.fn().mockRejectedValue({ response: { status: 409 } });
    await expect(authService.register("X", "dup@b.com", "P1!", "2000-01-01")).rejects.toBeTruthy();
  });
});

describe("authService.login", () => {
  it("llama POST /auth/login con correo y clave", async () => {
    api.post = vi.fn().mockResolvedValue({ data: {} });
    await authService.login("a@b.com", "Pass1!");
    expect(api.post).toHaveBeenCalledWith(
      "/auth/login",
      expect.objectContaining({ correo: "a@b.com", clave: "Pass1!" })
    );
  });
});

describe("authService.logout", () => {
  it("llama POST /auth/logout", async () => {
    api.post = vi.fn().mockResolvedValue({ data: {} });
    await authService.logout();
    expect(api.post).toHaveBeenCalledWith("/auth/logout");
  });
});

describe("authService.getCurrentUser", () => {
  it("llama GET /users/me", async () => {
    api.get = vi.fn().mockResolvedValue({ data: { id: 1, nombre: "Ana" } });
    const res = await authService.getCurrentUser();
    expect(api.get).toHaveBeenCalledWith("/users/me");
    expect(res.nombre).toBe("Ana");
  });

  it("lanza error si no autenticado (401)", async () => {
    api.get = vi.fn().mockRejectedValue({ response: { status: 401 } });
    await expect(authService.getCurrentUser()).rejects.toBeTruthy();
  });
});
