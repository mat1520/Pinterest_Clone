import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProfilePage from "../pages/ProfilePage";

vi.mock("../components/Header", () => ({ default: ({ onPinCreated }) => <header>Header</header> }));
vi.mock("../components/PinGrid", () => ({
  default: ({ savedOnly, autorId }) => (
    <div data-testid="pin-grid" data-saved={savedOnly} data-autor={autorId}>
      PinGrid
    </div>
  ),
}));

let mockAuth = { authenticated: false, user: null, loading: false };

vi.mock("../store/authStore", () => ({
  useAuth: () => mockAuth,
}));

function renderProfile() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProfilePage — no autenticado", () => {
  it("muestra mensaje de inicio sesión si no está autenticado", () => {
    mockAuth = { authenticated: false, user: null, loading: false };
    renderProfile();
    expect(screen.getByText(/inicia sesion/i)).toBeInTheDocument();
  });
});

describe("ProfilePage — loading", () => {
  it("muestra cargando durante hidratación", () => {
    mockAuth = { authenticated: false, user: null, loading: true };
    renderProfile();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it("no muestra mensaje de sesión mientras está loading", () => {
    mockAuth = { authenticated: false, user: null, loading: true };
    renderProfile();
    expect(screen.queryByText(/inicia sesion para ver tu perfil/i)).not.toBeInTheDocument();
  });
});

describe("ProfilePage — autenticado", () => {
  beforeEach(() => {
    mockAuth = {
      authenticated: true,
      user: { id: 1, nombre: "Ariel" },
      loading: false,
    };
  });

  it("muestra el nombre del usuario", () => {
    renderProfile();
    expect(screen.getByText(/Ariel/i)).toBeInTheDocument();
  });

  it("muestra tab 'Mis pines' activo por defecto con autorId", () => {
    renderProfile();
    expect(screen.getByText("Mis pines")).toBeInTheDocument();
    const grid = screen.getByTestId("pin-grid");
    expect(grid.dataset.autor).toBe("1");
    expect(grid.dataset.saved).toBeUndefined();
  });

  it("cambia a tab Guardados al hacer click", () => {
    renderProfile();
    fireEvent.click(screen.getByText("Guardados"));
    const grid = screen.getByTestId("pin-grid");
    expect(grid.dataset.saved).toBe("true");
  });

  it("vuelve a Mis pines al hacer click de nuevo con autorId", () => {
    renderProfile();
    fireEvent.click(screen.getByText("Guardados"));
    fireEvent.click(screen.getByText("Mis pines"));
    const grid = screen.getByTestId("pin-grid");
    expect(grid.dataset.autor).toBe("1");
    expect(grid.dataset.saved).toBeUndefined();
  });
});
