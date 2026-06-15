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

function validateAge(fecha) {
  if (!fecha) return "La fecha de nacimiento es obligatoria.";
  const birth = new Date(fecha);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const mDiff = today.getMonth() - birth.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 18) return "Debes tener al menos 18 a\u00f1os para registrarte.";
  if (age > 100) return "La fecha de nacimiento no es v\u00e1lida.";
  return null;
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
  const [error, setError] = useState(null);
  const [birthdateError, setBirthdateError] = useState(null);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.clave), [form.clave]);
  const maxDate = useMemo(getMaxDate, []);
  const minDate = useMemo(getMinDate, []);

  const allValid = useMemo(
    () => PASSWORD_PATTERNS.every((p) => p.test(form.clave)),
    [form.clave]
  );

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBirthdateError(null);
    if (!allValid) {
      setError("La contrasena no cumple con todos los requisitos de seguridad.");
      return;
    }
    const ageErr = validateAge(form.fecha_nacimiento);
    if (ageErr) {
      setBirthdateError(ageErr);
      return;
    }
    if (!aceptaTerminos) {
      setError("Debes aceptar los T\u00e9rminos y Condiciones para registrarte.");
      return;
    }
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
              onChange={(e) => {
                handleChange(e);
                setBirthdateError(validateAge(e.target.value));
              }}
              min={minDate}
              max={maxDate}
              required
            />
            {birthdateError && (
              <p className="formulario__error formulario__error--campo">
                {birthdateError}
              </p>
            )}
          </label>
          {error && <p className="formulario__error">{error}</p>}
          <label className="formulario__checkbox-label">
            <input
              id="input-terminos"
              className="formulario__checkbox-input"
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
            />
            <span className="formulario__checkbox-custom" />
            <span className="formulario__checkbox-texto">
              Acepto los{" "}
              <Link className="formulario__enlace" to="/terms">
                Términos y Condiciones
              </Link>
            </span>
          </label>
          <button
            id="btn-submit-register"
            className="boton"
            type="submit"
            disabled={loading || !aceptaTerminos}
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
