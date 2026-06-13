import { useState } from "react";
import { useAuth } from "../store/authStore";
import Header from "../components/Header";
import PinGrid from "../components/PinGrid";

function ProfilePage() {
  const { user, authenticated, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState("creados");

  if (loading) {
    return (
      <>
        <Header />
        <main className="acceso">
          <p>Cargando perfil...</p>
        </main>
      </>
    );
  }

  if (!authenticated) {
    return (
      <>
        <Header />
        <main className="acceso">
          <p>Inicia sesion para ver tu perfil.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header onPinCreated={() => setRefreshKey((k) => k + 1)} />
      <main>
        <section className="categorias">
          <h1 className="categorias__titulo">Perfil de {user.nombre}</h1>
          <nav className="perfil__tabs" aria-label="Secciones del perfil">
            <button
              className={`perfil__tab ${tab === "creados" ? "perfil__tab--activo" : ""}`}
              onClick={() => setTab("creados")}
            >
              Mis pines
            </button>
            <button
              className={`perfil__tab ${tab === "guardados" ? "perfil__tab--activo" : ""}`}
              onClick={() => setTab("guardados")}
            >
              Guardados
            </button>
          </nav>
        </section>
        {tab === "creados" ? (
          <PinGrid key={`creados-${refreshKey}`} autorId={user.id} />
        ) : (
          <PinGrid key={`guardados-${refreshKey}`} savedOnly />
        )}
      </main>
    </>
  );
}

export default ProfilePage;