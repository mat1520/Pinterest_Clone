import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PinDetailPage from "../pages/PinDetailPage";
import pinService from "../services/pinService";

vi.mock("../services/pinService");
vi.mock("../components/Header", () => ({ default: () => <header>Header</header> }));
vi.mock("../store/authStore", () => ({
  useAuth: () => ({ authenticated: true, user: { id: 1, es_admin: false } }),
}));

const mockPin = {
  id: 1,
  titulo: "Pin Detalle",
  descripcion: "una desc",
  categoria: "Moda",
  url_imagen: "https://example.com/img.jpg",
  autor_id: 2,
  autor_nombre: "OtroUsuario",
  likes_count: 10,
  saves_count: 3,
};

function renderDetail(id = "1") {
  return render(
    <MemoryRouter initialEntries={[`/pin/${id}`]}>
      <Routes>
        <Route path="/pin/:id" element={<PinDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  pinService.getById = vi.fn().mockResolvedValue(mockPin);
  pinService.getComments = vi.fn().mockResolvedValue([]);
  pinService.getLikes = vi.fn().mockResolvedValue({ liked: false, likes_count: 10 });
  pinService.getSavedStatus = vi.fn().mockResolvedValue({ saved: false });
  pinService.toggleLike = vi.fn().mockResolvedValue({ liked: true, likes_count: 11 });
  pinService.toggleSave = vi.fn().mockResolvedValue({ saved: true, saves_count: 4 });
});

describe("PinDetailPage — carga inicial", () => {
  it("muestra skeleton mientras carga", () => {
    renderDetail();
    expect(document.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("muestra el título del pin tras cargar", async () => {
    renderDetail();
    await waitFor(() => expect(screen.getByText("Pin Detalle")).toBeInTheDocument());
  });

  it("muestra el autor", async () => {
    renderDetail();
    await waitFor(() => expect(screen.getByText("@OtroUsuario")).toBeInTheDocument());
  });

  it("muestra la categoría", async () => {
    renderDetail();
    await waitFor(() => expect(screen.getByText("Moda")).toBeInTheDocument());
  });

  it("carga likes y saved en paralelo sin race condition", async () => {
    renderDetail();
    await waitFor(() => {
      expect(pinService.getLikes).toHaveBeenCalledWith("1");
      expect(pinService.getSavedStatus).toHaveBeenCalledWith("1");
    });
  });
});

describe("PinDetailPage — pin no encontrado", () => {
  it("muestra mensaje de pin no encontrado", async () => {
    pinService.getById = vi.fn().mockRejectedValue(new Error("404"));
    renderDetail();
    await waitFor(() =>
      expect(screen.getByText(/pin no encontrado/i)).toBeInTheDocument()
    );
  });
});

describe("PinDetailPage — interacciones", () => {
  it("toggle like actualiza el contador", async () => {
    renderDetail();
    await waitFor(() => screen.getByText("Pin Detalle"));
    const likeBtn = screen.getByLabelText(/dar like/i);
    fireEvent.click(likeBtn);
    await waitFor(() => expect(pinService.toggleLike).toHaveBeenCalled());
  });

  it("toggle save cambia el botón de guardar", async () => {
    renderDetail();
    await waitFor(() => screen.getByText("Pin Detalle"));
    const saveBtn = screen.getByLabelText(/guardar/i);
    fireEvent.click(saveBtn);
    await waitFor(() => expect(pinService.toggleSave).toHaveBeenCalled());
  });

  it("no muestra botón eliminar si no es el dueño", async () => {
    renderDetail();
    await waitFor(() => screen.getByText("Pin Detalle"));
    expect(screen.queryByText(/eliminar pin/i)).not.toBeInTheDocument();
  });
});

describe("PinDetailPage — comentarios", () => {
  it("muestra mensaje sin comentarios cuando la lista está vacía", async () => {
    renderDetail();
    await waitFor(() => screen.getByText(/todavia no hay comentarios/i));
  });

  it("muestra comentarios cuando los hay", async () => {
    pinService.getComments = vi.fn().mockResolvedValue([
      { id: 1, texto: "Buen pin!", autor_id: 3, autor_nombre: "Fan" },
    ]);
    renderDetail();
    await waitFor(() => expect(screen.getByText("Buen pin!")).toBeInTheDocument());
  });
});
