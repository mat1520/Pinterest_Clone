import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(correo, clave);
      navigate("/");
    } catch {
      setError("Credenciales incorrectas. Verifica tu correo y contrasena.");
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
        <h1 className="formulario__titulo">Te damos la bienvenida a Pinterest</h1>
        <form id="form-login" className="formulario__form" onSubmit={handleSubmit}>
          <label className="formulario__label">
            Correo electronico
            <input
              id="input-correo"
              className="formulario__input"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="Correo"
              required
            />
          </label>
          <label className="formulario__label">
            Contrasena
            <input
              id="input-clave"
              className="formulario__input"
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Contrasena"
              required
            />
          </label>
          {error && <p className="formulario__error">{error}</p>}
          <button
            id="btn-submit-login"
            className="boton"
            type="submit"
            disabled={loading}
          >
            {loading ? "Iniciando..." : "Iniciar sesion"}
          </button>
        </form>
        <p className="formulario__texto">
          No tienes cuenta?{" "}
          <Link className="formulario__enlace" to="/register">
            Registrate
          </Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
