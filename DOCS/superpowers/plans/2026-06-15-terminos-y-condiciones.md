# Términos y Condiciones Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Add a public Terms and Conditions page derived from the ethics report's "Normas derivadas del sistema" sections.

**Architecture:** New static page component at `/terms` route, following the existing auth-page layout pattern (standalone, no Header). The page content is sourced entirely from the ethics report's usage rules, content policies, and user responsibilities. A link to terms is added to the registration form.

**Tech Stack:** React 19, react-router-dom 7, Vitest + Testing Library, JSX, vanilla CSS (single index.css)

---

## File Structure

- **Create:** `FRONTEND-REACT/src/pages/TermsPage.jsx` — The Terms & Conditions page component
- **Modify:** `FRONTEND-REACT/src/App.jsx` — Add lazy import + route for `/terms`
- **Modify:** `FRONTEND-REACT/src/index.css` — Add `.terminos` section styles
- **Modify:** `FRONTEND-REACT/src/pages/RegisterPage.jsx` — Add link to terms
- **Create:** `FRONTEND-REACT/src/tests/TermsPage.test.jsx` — Tests for the terms page

### Task 1: Términos y Condiciones page component

**Files:**
- Create: `FRONTEND-REACT/src/pages/TermsPage.jsx`
- Test: `FRONTEND-REACT/src/tests/TermsPage.test.jsx`

- [ ] **Step 1: Write the failing test**

Write `FRONTEND-REACT/src/tests/TermsPage.test.jsx`:

```jsx
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

  it("renders section: Políticas de Contenido", () => {
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
    expect(screen.getByText(/contenido prohibido/i)).toBeInTheDocument();
  });

  it("renders a link back to register page", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /registro/i });
    expect(link).toHaveAttribute("href", "/register");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/TermsPage.test.jsx --reporter=verbose`
Expected: FAIL — `TermsPage` module not found (cannot find page file)

- [ ] **Step 3: Write minimal implementation**

Create `FRONTEND-REACT/src/pages/TermsPage.jsx`:

```jsx
import { Link } from "react-router-dom";

function TermsPage() {
  return (
    <main className="terminos">
      <section className="terminos__contenedor">
        <Link to="/register" className="terminos__volver">Volver al registro</Link>
        <h1 className="terminos__titulo">Terminos y Condiciones</h1>
        <p className="terminos__intro">
          Al utilizar Pinterest Clone, aceptas las siguientes normas derivadas de
          nuestro compromiso con la etica y la responsabilidad profesional.
        </p>

        <section className="terminos__seccion">
          <h2 className="terminos__subtitulo">Reglas de Uso</h2>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Registro veraz</h3>
            <p>
              Los usuarios deben proporcionar informacion real durante su registro,
              incluyendo su fecha de nacimiento, confirmando ser mayores de edad
              (18+ anos). El sistema valida este requisito tanto en el frontend como
              en el backend.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Respeto a la comunidad</h3>
            <p>
              Esta estrictamente prohibido el uso de la seccion de comentarios para
              hostigamiento, discurso de odio, spam o cualquier forma de violencia
              digital.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Uso personal e intransferible</h3>
            <p>
              La cuenta es personal e intransferible. El usuario es responsable de
              mantener la confidencialidad de sus credenciales.
            </p>
          </article>
        </section>

        <section className="terminos__seccion">
          <h2 className="terminos__subtitulo">Politicas de Contenido</h2>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Propiedad intelectual</h3>
            <p>
              Los usuarios solo pueden subir contenido multimedia del cual posean
              los derechos de autor o cuenten con permisos explicitos. Solo el autor
              o un administrador puede eliminar un Pin.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Contenido prohibido</h3>
            <p>
              No se tolerara la publicacion de material explicito (NSFW), violencia
              grafica, promocion de actividades ilegales o imagenes que vulneren la
              privacidad de terceros (doxxing).
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Moderacion</h3>
            <p>
              La plataforma se reserva el derecho, a traves de sus administradores,
              de eliminar cualquier Pin o comentario que viole estas politicas, en
              cumplimiento del deber de no maleficencia.
            </p>
          </article>
        </section>

        <section className="terminos__seccion">
          <h2 className="terminos__subtitulo">Responsabilidades del Usuario</h2>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Seguridad de la cuenta</h3>
            <p>
              El usuario es responsable de todas las actividades que ocurran bajo su
              sesion. El sistema registra todos los eventos de inicio de sesion
              mediante un logger de auditoria.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Reporte de vulnerabilidades</h3>
            <p>
              Si el usuario detecta un comportamiento anomalo o contenido prohibido,
              es su responsabilidad moral reportarlo a los administradores.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Uso etico de la API</h3>
            <p>
              Queda prohibido el uso de bots, scrapers o ingenieria inversa. El
              rate limiting (10 peticiones/minuto) es la barrera tecnica que
              respalda esta politica.
            </p>
          </article>
        </section>

        <p className="terminos__pie">
          Al hacer clic en &quot;Continuar&quot; durante el registro, aceptas estos
          terminos y condiciones.
        </p>
      </section>
    </main>
  );
}

export default TermsPage;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/TermsPage.test.jsx --reporter=verbose`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add FRONTEND-REACT/src/pages/TermsPage.jsx FRONTEND-REACT/src/tests/TermsPage.test.jsx
git commit -m "feat: add Terms and Conditions page component and tests"
```

### Task 2: Route registration

**Files:**
- Modify: `FRONTEND-REACT/src/App.jsx`
- Test: `FRONTEND-REACT/src/tests/TermsPage.test.jsx`

- [ ] **Step 1: Add lazy import and route**

In `FRONTEND-REACT/src/App.jsx`:

After line 9 (`const ProfilePage = lazy(...)`), add:
```jsx
const TermsPage = lazy(() => import("./pages/TermsPage"));
```

After line 27 (`<Route path="/profile" element={<ProfilePage />} />`), add:
```jsx
<Route path="/terms" element={<TermsPage />} />
```

- [ ] **Step 2: Update the terms page test to verify routing**

Append to `FRONTEND-REACT/src/tests/TermsPage.test.jsx`:

```jsx
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

describe("TermsPage — routing", () => {
  it("renders at /terms route", async () => {
    render(
      <MemoryRouter initialEntries={["/terms"]}>
        <Routes>
          <Route path="/terms" element={
            <Suspense fallback={<div>Loading...</div>}>
              <TermsPage />
            </Suspense>
          } />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByRole("heading", { name: /terminos y condiciones/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify**

Run: `npx vitest run src/tests/TermsPage.test.jsx --reporter=verbose`
Expected: PASS

- [ ] **Step 4: Run lint check**

Run: `npx eslint src/pages/TermsPage.jsx src/App.jsx`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add FRONTEND-REACT/src/App.jsx FRONTEND-REACT/src/tests/TermsPage.test.jsx
git commit -m "feat: add /terms route to App router"
```

### Task 3: CSS styles for Terms page

**Files:**
- Modify: `FRONTEND-REACT/src/index.css`
- Test: `FRONTEND-REACT/src/tests/TermsPage.test.jsx`

- [ ] **Step 1: Add terms page CSS**

Before the `@media` block (line 649), add to `FRONTEND-REACT/src/index.css`:

```css
/* Terms & Conditions */
.terminos {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 40px 24px;
  background: var(--color-surface);
}

.terminos__contenedor {
  width: 100%;
  max-width: 720px;
  animation: entrada 0.35s ease both;
}

.terminos__volver {
  display: inline-block;
  color: var(--color-accent);
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 20px;
  transition: opacity var(--transition-base);
}

.terminos__volver:hover {
  opacity: 0.8;
}

.terminos__titulo {
  font-size: 28px;
  margin-bottom: 12px;
  line-height: 1.2;
}

.terminos__intro {
  color: var(--color-muted);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 32px;
}

.terminos__seccion {
  margin-bottom: 32px;
}

.terminos__subtitulo {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent);
}

.terminos__articulo {
  margin-bottom: 20px;
}

.terminos__encabezado {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
}

.terminos__articulo p {
  color: var(--color-muted);
  font-size: 14px;
  line-height: 1.7;
}

.terminos__pie {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  color: var(--color-muted);
  font-size: 13px;
  text-align: center;
}
```

- [ ] **Step 2: Run tests to verify nothing broke**

Run: `npx vitest run --reporter=verbose`
Expected: All PASS

- [ ] **Step 3: Run lint**

Run: `npx eslint src/index.css` (or if no CSS linter is configured, skip)
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add FRONTEND-REACT/src/index.css
git commit -m "style: add Terms page CSS styles"
```

### Task 4: Link from Register page

**Files:**
- Modify: `FRONTEND-REACT/src/pages/RegisterPage.jsx`

- [ ] **Step 1: Add terms link to registration form**

In `FRONTEND-REACT/src/pages/RegisterPage.jsx`, after the form closing tag `</form>` (line 187), add:

```jsx
<p className="formulario__texto formulario__texto--small">
  Al registrarte, aceptas nuestros{" "}
  <Link className="formulario__enlace" to="/terms">
    Terminos y Condiciones
  </Link>
  .
</p>
```

Then add a CSS rule for `.formulario__texto--small` in `index.css` after `.formulario__texto` (line 299):

```css
.formulario__texto--small {
  font-size: 12px;
  line-height: 1.5;
}
```

- [ ] **Step 2: Run tests to verify existing tests still pass**

Run: `npx vitest run --reporter=verbose`
Expected: All PASS

- [ ] **Step 3: Run lint**

Run: `npx eslint FRONTEND-REACT/src/pages/RegisterPage.jsx`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add FRONTEND-REACT/src/pages/RegisterPage.jsx FRONTEND-REACT/src/index.css
git commit -m "feat: add terms link to registration page"
```

### Task 5: Run full test suite and final verification

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run --reporter=verbose`
Expected: All tests PASS (existing + new terms tests)

- [ ] **Step 2: Run lint on all modified files**

Run: `npx eslint FRONTEND-REACT/src/`
Expected: No errors

- [ ] **Step 3: Build to verify no compilation errors**

Run: `npx vite build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "chore: final review and fixes"
```
