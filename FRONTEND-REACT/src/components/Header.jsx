import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import PinUploadModal from "./PinUploadModal";

function Header({ onPinCreated }) {
  const { authenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleSearch(e) {
    if (e.key === "Enter") {
      navigate(`/?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <>
      <header className="cabecera">
        <nav className="cabecera__nav">
          <Link to="/" className="cabecera__marca">
            <img
              className="cabecera__logo"
              src="/Pinterest_logo.png"
              alt="Pinterest"
            />
          </Link>

          <Link className="cabecera__enlace" to="/">
            Explorar
          </Link>

          <search className="cabecera__busqueda">
            <label className="sr-only" htmlFor="buscar">
              Buscar
            </label>
            <input
              className="cabecera__input"
              id="buscar"
              type="search"
              placeholder="Encuentra ideas"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </search>

          {authenticated ? (
            <>
              <Link
                to="/profile"
                className="boton boton--gris boton--sm"
              >
                Mi Perfil
              </Link>
              <button
                id="btn-crear-pin"
                className="boton boton--sm"
                onClick={() => setShowModal(true)}
              >
                Crear pin
              </button>
              <button
                id="btn-cerrar-sesion"
                className="boton boton--outline boton--sm"
                onClick={handleLogout}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                id="btn-iniciar-sesion"
                className="boton boton--gris boton--sm"
                to="/login"
              >
                Iniciar sesion
              </Link>
              <Link id="btn-registrarse" className="boton boton--sm" to="/register">
                Registrate
              </Link>
            </>
          )}
        </nav>
      </header>

      {showModal && (
        <PinUploadModal
          onClose={() => setShowModal(false)}
          onCreated={(pin) => {
            setShowModal(false);
            if (onPinCreated) onPinCreated(pin);
          }}
        />
      )}
    </>
  );
}

export default Header;
