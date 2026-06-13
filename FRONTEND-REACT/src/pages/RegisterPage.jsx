import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

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
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
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
      setError(detail || "Error al registrar. Intenta con otro correo.");
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
            />
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
              required
            />
          </label>
          {error && <p className="formulario__error">{error}</p>}
          <button
            id="btn-submit-register"
            className="boton"
            type="submit"
            disabled={loading}
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
