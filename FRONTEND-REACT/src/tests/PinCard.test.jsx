import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../store/authStore", () => ({
  useAuth: () => ({ authenticated: true }),
}));

vi.mock("../services/pinService", () => ({
  default: {
    getLikes: vi.fn(),
    toggleLike: vi.fn(),
    toggleSave: vi.fn(),
  },
}));

import PinCard from "../components/PinCard";
import pinService from "../services/pinService";

const mockPin = {
  id: 1,
  titulo: "Mi Pin de Prueba",
  descripcion: "descripcion",
  categoria: "Arte",
  url_imagen: "https://example.com/img.jpg",
  autor_id: 1,
  autor_nombre: "Tester",
  likes_count: 5,
  saves_count: 2,
};

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <PinCard pin={mockPin} {...props} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  pinService.getLikes.mockResolvedValue({ liked: false, likes_count: 5 });
  pinService.toggleLike.mockResolvedValue({ liked: true, likes_count: 6 });
  pinService.toggleSave.mockResolvedValue({ saved: true, saves_count: 3 });
});

describe("PinCard — renderizado", () => {
  it("muestra el título del pin", () => {
    renderCard();
    expect(screen.getByText("Mi Pin de Prueba")).toBeInTheDocument();
  });

  it("muestra el autor", () => {
    renderCard();
    expect(screen.getByText("@Tester")).toBeInTheDocument();
  });

  it("muestra la categoría", () => {
    renderCard();
    expect(screen.getByText("Arte")).toBeInTheDocument();
  });

  it("muestra la imagen con alt correcto", () => {
    renderCard();
    const img = screen.getByAltText("Mi Pin de Prueba");
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("example.com");
  });

  it("muestra el contador de likes del pin", () => {
    renderCard();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});

describe("PinCard — like", () => {
  it("carga estado liked real al montar", async () => {
    renderCard();
    await waitFor(() => expect(pinService.getLikes).toHaveBeenCalledWith(1));
  });

  it("toggle like llama a pinService.toggleLike", async () => {
    renderCard();
    await waitFor(() => expect(pinService.getLikes).toHaveBeenCalled());
    const likeBtn = screen.getByLabelText(/like/i);
    fireEvent.click(likeBtn);
    await waitFor(() => expect(pinService.toggleLike).toHaveBeenCalledWith(1));
  });
});

describe("PinCard — save", () => {
  it("con initialSaved=true muestra botón quitar guardado", () => {
    renderCard({ initialSaved: true });
    expect(screen.getByLabelText(/quitar guardado/i)).toBeInTheDocument();
  });

  it("con initialSaved=false muestra botón guardar", () => {
    renderCard({ initialSaved: false });
    expect(screen.getByLabelText(/guardar/i)).toBeInTheDocument();
  });

  it("toggle save llama a pinService.toggleSave", async () => {
    renderCard();
    await waitFor(() => expect(pinService.getLikes).toHaveBeenCalled());
    const saveBtn = screen.getByLabelText(/guardar/i);
    fireEvent.click(saveBtn);
    await waitFor(() => expect(pinService.toggleSave).toHaveBeenCalledWith(1));
  });
});
