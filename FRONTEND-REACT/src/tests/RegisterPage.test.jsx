import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../store/authStore", () => ({
  useAuth: () => ({ register: mockRegister }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import RegisterPage from "../pages/RegisterPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
}

function fillValidForm() {
  fireEvent.change(screen.getByPlaceholderText("Tu nombre"), {
    target: { name: "nombre", value: "Ana" },
  });
  fireEvent.change(screen.getByPlaceholderText("Correo electronico"), {
    target: { name: "correo", value: "ana@test.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Crea una contrasena"), {
    target: { name: "clave", value: "Pass1!abcd" },
  });
  const today = new Date();
  const past = new Date(today.getFullYear() - 20, 0, 1);
  fireEvent.change(screen.getByLabelText("Fecha de nacimiento"), {
    target: { name: "fecha_nacimiento", value: past.toISOString().split("T")[0] },
  });
}

describe("RegisterPage — términos y condiciones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el checkbox de aceptar términos", () => {
    renderPage();
    expect(screen.getByLabelText(/Acepto los/)).toBeInTheDocument();
  });

  it("tiene el enlace a Términos y Condiciones", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /Términos y Condiciones/i });
    expect(link).toHaveAttribute("href", "/terms");
  });

  it("el botón de submit está deshabilitado si no se aceptan términos", () => {
    renderPage();
    expect(screen.getByText("Continuar")).toBeDisabled();
  });

  it("el botón de submit se habilita al marcar términos", () => {
    renderPage();
    const checkbox = screen.getByLabelText(/Acepto los/);
    fireEvent.click(checkbox);
    expect(screen.getByText("Continuar")).toBeEnabled();
  });
});

describe("RegisterPage — validación de edad", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra error si la fecha de nacimiento es menor de 18 años", () => {
    renderPage();
    const today = new Date();
    const minorDate = new Date(today.getFullYear() - 15, 0, 1);
    fireEvent.change(screen.getByLabelText("Fecha de nacimiento"), {
      target: { name: "fecha_nacimiento", value: minorDate.toISOString().split("T")[0] },
    });
    expect(screen.getByText(/Debes tener al menos 18 años/i)).toBeInTheDocument();
  });

  it("no muestra error de edad si la fecha es válida (+18)", () => {
    renderPage();
    const today = new Date();
    const adultDate = new Date(today.getFullYear() - 20, 0, 1);
    fireEvent.change(screen.getByLabelText("Fecha de nacimiento"), {
      target: { name: "fecha_nacimiento", value: adultDate.toISOString().split("T")[0] },
    });
    expect(screen.queryByText(/Debes tener al menos 18 años/i)).not.toBeInTheDocument();
  });

  it("bloquea el submit y muestra error de edad al enviar con menor de 18", async () => {
    renderPage();
    fillValidForm();
    const today = new Date();
    const minorDate = new Date(today.getFullYear() - 15, 0, 1);
    fireEvent.change(screen.getByLabelText("Fecha de nacimiento"), {
      target: { name: "fecha_nacimiento", value: minorDate.toISOString().split("T")[0] },
    });
    const checkbox = screen.getByLabelText(/Acepto los/);
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByText("Continuar"));
    expect(screen.getByText(/Debes tener al menos 18 años/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("no envía el formulario si no se aceptan términos (botón deshabilitado)", async () => {
    renderPage();
    fillValidForm();
    const btn = screen.getByText("Continuar");
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("envía el formulario con datos válidos, edad válida y términos aceptados", async () => {
    mockRegister.mockResolvedValueOnce({});
    renderPage();
    fillValidForm();
    const checkbox = screen.getByLabelText(/Acepto los/);
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByText("Continuar"));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledTimes(1);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
