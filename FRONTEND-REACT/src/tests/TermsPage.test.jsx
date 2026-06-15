import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TermsPage from "../pages/TermsPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <TermsPage />
    </MemoryRouter>
  );
}

describe("TermsPage", () => {
  it("renders the main heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /terminos y condiciones/i })).toBeInTheDocument();
  });

  it("renders section: Reglas de Uso", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /reglas de uso/i })).toBeInTheDocument();
  });

  it("renders section: Politicas de Contenido", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /politicas de contenido/i })).toBeInTheDocument();
  });

  it("renders section: Responsabilidades del Usuario", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /responsabilidades del usuario/i })).toBeInTheDocument();
  });

  it("renders age requirement (18+) rule", () => {
    renderPage();
    expect(screen.getByText(/mayores de edad/i)).toBeInTheDocument();
  });

  it("renders intellectual property rule", () => {
    renderPage();
    expect(screen.getByText(/propiedad intelectual/i)).toBeInTheDocument();
  });

  it("renders prohibited content rule", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /^contenido prohibido$/i })).toBeInTheDocument();
  });

  it("renders a link back to register page", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /registro/i });
    expect(link).toHaveAttribute("href", "/register");
  });
});
