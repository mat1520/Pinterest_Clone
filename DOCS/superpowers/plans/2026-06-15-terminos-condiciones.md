# Terms and Conditions Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Terms and Conditions page with content derived from the ethics report (informe_ETICA.pdf) and link it from the registration flow.

**Architecture:** New static page component (TermsPage.jsx) follows the existing auth-page pattern (centered layout, no Header, standalone route `/terminos`). A registration checkbox with link to terms is added to RegisterPage. The page content comes from the "Normas derivadas del sistema" section of the ethics report: Usage Rules, Content Policies, and User Responsibilities.

**Tech Stack:** React 19, react-router-dom 7, Vitest + Testing Library, CSS (single index.css file, BEM-like naming in Spanish).

---
## Files

### Create:
- `FRONTEND-REACT/src/pages/TermsPage.jsx` — Static terms & conditions page component
- `FRONTEND-REACT/src/tests/TermsPage.test.jsx` — Tests for TermsPage

### Modify:
- `FRONTEND-REACT/src/App.jsx:5-28` — Add lazy import and route for `/terminos`
- `FRONTEND-REACT/src/pages/RegisterPage.jsx:94-95` — Add terms checkbox and link below the form title
- `FRONTEND-REACT/src/index.css` — Add CSS classes for terms page styling (append at end)

---

### Task 1: Create TermsPage component

**Files:**
- Create: `FRONTEND-REACT/src/pages/TermsPage.jsx`
- Test: `FRONTEND-REACT/src/tests/TermsPage.test.jsx`

- [ ] **Step 1: Write the failing test**

```javascript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TermsPage from "../pages/TermsPage";

function renderTerms() {
  return render(
    <MemoryRouter>
      <TermsPage />
    </MemoryRouter>
  );
}

describe("TermsPage — contenido", () => {
  it("muestra el titulo principal", () => {
    renderTerms();
    expect(screen.getByText("Terminos y Condiciones")).toBeInTheDocument();
  });

  it("muestra la seccion Reglas de Uso", () => {
    renderTerms();
    expect(screen.getByText("Reglas de Uso")).toBeInTheDocument();
  });

  it("muestra la seccion Politicas de Contenido", () => {
    renderTerms();
    expect(screen.getByText("Politicas de Contenido")).toBeInTheDocument();
  });

  it("muestra la seccion Responsabilidades del Usuario", () => {
    renderTerms();
    expect(screen.getByText("Responsabilidades del Usuario")).toBeInTheDocument();
  });

  it("incluye un enlace de regreso al registro", () => {
    renderTerms();
    const link = screen.getByRole("link", { name: /volver al registro/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/register");
  });

  it("muestra la regla de mayoria de edad (18+)", () => {
    renderTerms();
    expect(screen.getByText(/18\+/i)).toBeInTheDocument();
  });

  it("no renderiza el Header", () => {
    renderTerms();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/TermsPage.test.jsx 2>&1 | head -30`
Expected: FAIL — "Cannot find module" or similar error since the file doesn't exist yet

- [ ] **Step 3: Write the TermsPage component**

```javascript
import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "Reglas de Uso",
    rules: [
      {
        heading: "Registro veraz",
        text: "Los usuarios deben proporcionar informacion real durante su registro, incluyendo su fecha de nacimiento, confirmando ser mayores de edad (18+ anos). El sistema valida este requisito tanto en el frontend como en el backend.",
      },
      {
        heading: "Respeto a la comunidad",
        text: "Queda estrictamente prohibido el uso de la seccion de comentarios para hostigamiento, discurso de odio, spam o cualquier forma de violencia digital.",
      },
      {
        heading: "Uso personal e intransferible",
        text: "La cuenta es personal e intransferible. El usuario es responsable de mantener la confidencialidad de sus credenciales.",
      },
    ],
  },
  {
    title: "Politicas de Contenido",
    rules: [
      {
        heading: "Propiedad intelectual",
        text: "Los usuarios solo pueden subir contenido multimedia del cual posean los derechos de autor o cuenten con permisos explicitos. Solo el autor o un administrador puede eliminar un Pin.",
      },
      {
        heading: "Contenido prohibido",
        text: "No se tolerara la publicacion de material explicito (NSFW), violencia grafica, promocion de actividades ilegales o imagenes que vulneren la privacidad de terceros (doxxing).",
      },
      {
        heading: "Moderacion",
        text: "La plataforma se reserva el derecho, a traves de sus administradores, de eliminar cualquier Pin o comentario que viole estas politicas, en cumplimiento del deber de no maleficencia.",
      },
    ],
  },
  {
    title: "Responsabilidades del Usuario",
    rules: [
      {
        heading: "Seguridad de la cuenta",
        text: "El usuario es responsable de todas las actividades que ocurran bajo su sesion. El sistema registra todos los eventos de inicio de sesion mediante un logger de auditoria.",
      },
      {
        heading: "Reporte de vulnerabilidades",
        text: "Si el usuario detecta un comportamiento anormal o contenido prohibido, es su responsabilidad moral reportarlo a los administradores.",
      },
      {
        heading: "Uso etico de la API",
        text: "Queda prohibido el uso de bots, scrapers o ingenieria inversa. El rate limiting (10 peticiones/minuto) es la barrera tecnica que respalda esta politica.",
      },
    ],
  },
];

function TermsPage() {
  return (
    <main className="terminos">
      <section className="terminos__contenedor">
        <h1 className="terminos__titulo">Terminos y Condiciones</h1>
        <p className="terminos__fecha">Ultima actualizacion: 15 de junio de 2026</p>

        <p className="terminos__intro">
          Estas normas de convivencia digital rigen el uso de la plataforma Pinterest
          Clone. Al registrarte y utilizar el servicio, aceptas cumplir con cada una
          de las disposiciones detalladas a continuacion, las cuales derivan de
          decisiones etico-tecnicas documentadas en el informe etico del proyecto.
        </p>

        {SECTIONS.map((section) => (
          <div key={section.title} className="terminos__seccion">
            <h2 className="terminos__seccion-titulo">{section.title}</h2>
            {section.rules.map((rule) => (
              <div key={rule.heading} className="terminos__regla">
                <h3 className="terminos__regla-titulo">{rule.heading}</h3>
                <p className="terminos__regla-texto">{rule.text}</p>
              </div>
            ))}
          </div>
        ))}

        <div className="terminos__footer">
          <Link className="terminos__volver" to="/register">
            Volver al registro
          </Link>
        </div>
      </section>
    </main>
  );
}

export default TermsPage;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/TermsPage.test.jsx 2>&1 | head -30`
Expected: PASS — all 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add FRONTEND-REACT/src/pages/TermsPage.jsx FRONTEND-REACT/src/tests/TermsPage.test.jsx
git commit -m "feat: add TermsPage component with ethics-derived content"
```

---

### Task 2: Add route for /terminos in App.jsx

**Files:**
- Modify: `FRONTEND-REACT/src/App.jsx:5-28`

- [ ] **Step 1: Write the failing test**

Add to `FRONTEND-REACT/src/tests/TermsPage.test.jsx`:

```javascript
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import App from "../App";

describe("TermsPage — ruteo", () => {
  it("navega a /terminos y muestra la pagina", () => {
    render(
      <MemoryRouter initialEntries={["/terminos"]}>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Terminos y Condiciones")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/TermsPage.test.jsx 2>&1 | head -30`
Expected: FAIL — route not found

- [ ] **Step 3: Add lazy import and route in App.jsx**

Edit `App.jsx`:

```javascript
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./store/authStore";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const PinDetailPage = lazy(() => import("./pages/PinDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));

function PageSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }} />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pin/:id" element={<PinDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/terminos" element={<TermsPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/TermsPage.test.jsx 2>&1 | head -30`
Expected: PASS — all tests pass including the routing test

- [ ] **Step 5: Commit**

```bash
git add FRONTEND-REACT/src/App.jsx FRONTEND-REACT/src/tests/TermsPage.test.jsx
git commit -m "feat: add /terminos route to App"
```

---

### Task 3: Add terms checkbox and link on RegisterPage

**Files:**
- Modify: `FRONTEND-REACT/src/pages/RegisterPage.jsx:93-94`

- [ ] **Step 1: Write the failing test**

Add to `FRONTEND-REACT/src/tests/TermsPage.test.jsx` or create a new test. Let's add to the existing file:

```javascript
import RegisterPage from "../pages/RegisterPage";

vi.mock("../store/authStore", () => ({
  useAuth: () => ({ register: vi.fn() }),
}));

describe("RegisterPage — enlace a terminos", () => {
  function renderRegister() {
    return render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
  }

  it("muestra el checkbox de aceptacion de terminos", () => {
    renderRegister();
    expect(screen.getByLabelText(/acepto los terminos y condiciones/i)).toBeInTheDocument();
  });

  it("el checkbox esta deshabilitado por defecto", () => {
    renderRegister();
    expect(screen.getByLabelText(/acepto los terminos y condiciones/i)).not.toBeChecked();
  });

  it("incluye un enlace a /terminos", () => {
    renderRegister();
    const link = screen.getByRole("link", { name: /terminos y condiciones/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/terminos");
  });

  it("deshabilita el boton de submit si el checkbox no esta marcado", () => {
    renderRegister();
    const btn = screen.getByRole("button", { name: /continuar/i });
    const checkbox = screen.getByLabelText(/acepto los terminos y condiciones/i);
    expect(checkbox).not.toBeChecked();
    expect(btn).toBeDisabled();
  });

  it("habilita el boton de submit cuando se marca el checkbox", () => {
    renderRegister();
    const checkbox = screen.getByLabelText(/acepto los terminos y condiciones/i);
    checkbox.click();
    const btn = screen.getByRole("button", { name: /continuar/i });
    expect(btn).not.toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/TermsPage.test.jsx 2>&1 | head -40`
Expected: FAIL — "acepto los terminos" not found in RegisterPage

- [ ] **Step 3: Modify RegisterPage to add terms checkbox**

Edit `RegisterPage.jsx`. Changes:

1. Add `aceptoTerminos` to the form state (line ~38):
2. Add `handleCheckbox` function
3. Update `allValid` to include the checkbox
4. Add checkbox JSX between the date input and the error message (line ~177)
5. Disable the submit button when not accepted

Full modified file:

```javascript
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

const PASSWORD_PATTERNS = [
  { label: "8+ caracteres", test: (v) => v.length >= 8 },
  { label: "Mayuscula", test: (v) => /[A-Z]/.test(v) },
  { label: "Minuscula", test: (v) => /[a-z]/.test(v) },
  { label: "Numero", test: (v) => /\d/.test(v) },
  { label: "Caracter especial", test: (v) => /[!@#$%^&*()_+\-=\[\]{}|;':\",.\/<>?`~]/.test(v) },
];

function getPasswordStrength(clave) {
  const passed = PASSWORD_PATTERNS.filter((p) => p.test(clave)).length;
  if (passed <= 2) return { label: "Debil", level: "weak", pct: 33 };
  if (passed <= 3) return { label: "Media", level: "medium", pct: 66 };
  return { label: "Fuerte", level: "strong", pct: 100 };
}

function getMaxDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
}

function getMinDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 100);
  return d.toISOString().split("T")[0];
}

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    clave: "",
    fecha_nacimiento: "",
  });
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.clave), [form.clave]);
  const maxDate = useMemo(getMaxDate, []);
  const minDate = useMemo(getMinDate, []);

  const allValid = useMemo(
    () => PASSWORD_PATTERNS.every((p) => p.test(form.clave)) && aceptoTerminos,
    [form.clave, aceptoTerminos]
  );

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!allValid) {
      setError("La contrasena no cumple con todos los requisitos de seguridad.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(
        form.nombre,
        form.correo,
        form.clave,
        form.fecha_nacimiento
      );
      navigate("/login");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(". "));
      } else {
        setError(detail || "Error al registrar. Intenta con otro correo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="acceso">
      <section className="formulario">
        <img
          className="formulario__logo"
          src="/Pinterest_logo.png"
          alt="Pinterest"
        />
        <h1 className="formulario__titulo">Crea tu cuenta en Pinterest</h1>
        <p className="formulario__texto">Registrate para ver mas</p>
        <form id="form-register" className="formulario__form" onSubmit={handleSubmit}>
          <label className="formulario__label">
            Nombre
            <input
              id="input-nombre"
              className="formulario__input"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </label>
          <label className="formulario__label">
            Correo electronico
            <input
              id="input-correo"
              className="formulario__input"
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="Correo electronico"
              required
            />
          </label>
          <label className="formulario__label">
            Contrasena
            <input
              id="input-clave"
              className="formulario__input"
              type="password"
              name="clave"
              value={form.clave}
              onChange={handleChange}
              placeholder="Crea una contrasena"
              required
              minLength={8}
            />
            {form.clave.length > 0 && (
              <div className="formulario__password-strength">
                <div className="formulario__password-bar">
                  <div
                    className={`formulario__password-fill formulario__password-fill--${strength.level}`}
                    style={{ width: `${strength.pct}%` }}
                  />
                </div>
                <span className={`formulario__password-label formulario__password-label--${strength.level}`}>
                  {strength.label}
                </span>
              </div>
            )}
            {form.clave.length > 0 && (
              <ul className="formulario__password-rules">
                {PASSWORD_PATTERNS.map((p) => (
                  <li
                    key={p.label}
                    className={`formulario__password-rule ${p.test(form.clave) ? "formulario__password-rule--ok" : ""}`}
                  >
                    {p.test(form.clave)
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>}
                    {' '}{p.label}
                  </li>
                ))}
              </ul>
            )}
          </label>
          <label className="formulario__label">
            Fecha de nacimiento
            <input
              id="input-fecha"
              className="formulario__input"
              type="date"
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              min={minDate}
              max={maxDate}
              required
            />
          </label>
          <label className="formulario__checkbox-label">
            <input
              type="checkbox"
              checked={aceptoTerminos}
              onChange={(e) => setAceptoTerminos(e.target.checked)}
              className="formulario__checkbox"
            />
            <span>
              Acepto los{" "}
              <Link className="formulario__enlace" to="/terminos">
                Terminos y Condiciones
              </Link>
            </span>
          </label>
          {error && <p className="formulario__error">{error}</p>}
          <button
            id="btn-submit-register"
            className="boton"
            type="submit"
            disabled={loading || !aceptoTerminos}
          >
            {loading ? "Registrando..." : "Continuar"}
          </button>
        </form>
        <p className="formulario__texto">
          Ya tienes cuenta?{" "}
          <Link className="formulario__enlace" to="/login">
            Inicia sesion
          </Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run 2>&1 | head -40`
Expected: PASS — all tests pass (including PinDetailPage, ProfilePage, authService, pinService, and the new terms tests)

- [ ] **Step 5: Commit**

```bash
git add FRONTEND-REACT/src/pages/RegisterPage.jsx
git commit -m "feat: add terms acceptance checkbox to registration form"
```

---

### Task 4: Add CSS styles for TermsPage and checkbox

**Files:**
- Modify: `FRONTEND-REACT/src/index.css` (append at end of file, before EOF)

- [ ] **Step 1: Write the failing test**

Add to `FRONTEND-REACT/src/tests/TermsPage.test.jsx`:

```javascript
describe("TermsPage — estilos", () => {
  it("tiene la clase terminos en el main", () => {
    renderTerms();
    expect(document.querySelector("main.terminos")).toBeInTheDocument();
  });

  it("tiene la clase terminos__contenedor en la seccion", () => {
    renderTerms();
    expect(document.querySelector(".terminos__contenedor")).toBeInTheDocument();
  });

  it("tiene la clase terminos__seccion para cada bloque", () => {
    renderTerms();
    const sections = document.querySelectorAll(".terminos__seccion");
    expect(sections.length).toBe(3);
  });
});
```

Also add styles assertion to the RegisterPage tests in the same file:

```javascript
describe("RegisterPage — estilos del checkbox", () => {
  function renderRegister() {
    return render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
  }

  it("tiene la clase formulario__checkbox-label", () => {
    renderRegister();
    expect(document.querySelector(".formulario__checkbox-label")).toBeInTheDocument();
  });

  it("tiene la clase formulario__checkbox", () => {
    renderRegister();
    expect(document.querySelector(".formulario__checkbox")).toBeInTheDocument();
  });
});
```

Now run to see them fail:

Run: `TERM=xterm npx vitest run src/tests/TermsPage.test.jsx 2>&1 | tail -30`
Expected: The old tests pass, the style class checks also pass (since we already built the component with these classes in Task 1 and Task 3). Actually these tests should pass already since the className is part of the JSX. Let's verify.
Expected: PASS or FAIL — the class names are already in the JSX, so they pass.

- [ ] **Step 2: Run test to verify current state (tests may already pass since classNames are in JSX)**

Run: `TERM=xterm npx vitest run 2>&1 | tail -30`
Expected: All tests pass (classes are present in JSX)

- [ ] **Step 3: Add CSS styles to index.css**

Append to `FRONTEND-REACT/src/index.css` (before the final newline):

```css
/* Terms and Conditions */
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

.terminos__titulo {
  font-size: 28px;
  margin-bottom: 4px;
  line-height: 1.2;
}

.terminos__fecha {
  color: var(--color-muted);
  font-size: 13px;
  margin-bottom: 24px;
}

.terminos__intro {
  color: var(--color-muted);
  line-height: 1.6;
  margin-bottom: 32px;
  font-size: 15px;
}

.terminos__seccion {
  margin-bottom: 32px;
}

.terminos__seccion-titulo {
  font-size: 20px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent);
}

.terminos__regla {
  margin-bottom: 20px;
}

.terminos__regla-titulo {
  font-size: 16px;
  margin-bottom: 6px;
  color: var(--color-text);
}

.terminos__regla-texto {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-muted);
}

.terminos__footer {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.terminos__volver {
  display: inline-block;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: #fff;
  padding: 12px 28px;
  font-weight: 800;
  font-size: 14px;
  transition: transform var(--transition-base), filter var(--transition-base);
}

.terminos__volver:hover {
  filter: brightness(0.92);
  transform: translateY(-1px);
}

/* Terms checkbox */
.formulario__checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 400;
  color: var(--color-muted);
  text-align: left;
  cursor: pointer;
}

.formulario__checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
  cursor: pointer;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `TERM=xterm npx vitest run 2>&1 | tail -30`
Expected: PASS — all tests pass

- [ ] **Step 5: Commit**

```bash
git add FRONTEND-REACT/src/index.css
git commit -m "feat: add CSS styles for terms page and registration checkbox"
```

---

### Task 5: Run full test suite and lint

- [ ] **Step 1: Run full test suite**

Run: `TERM=xterm npx vitest run 2>&1`
Expected: PASS — all tests pass

- [ ] **Step 2: Run lint**

Run: `npx eslint . 2>&1`
Expected: No errors

- [ ] **Step 3: Run build to verify production build works**

Run: `npx vite build 2>&1`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: fix lint and test issues after terms page integration"
```
