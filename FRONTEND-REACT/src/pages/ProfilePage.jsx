import { useState } from "react";
import { useAuth } from "../store/authStore";
import Header from "../components/Header";
import PinGrid from "../components/PinGrid";

function ProfilePage() {
  const { user, authenticated } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (!authenticated) {
    return (
      <>
        <Header />
        <main className="acceso">
          <p>Inicia sesión para ver tu perfil.</p>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="acceso">
          <p>Cargando perfil...</p>
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
          <p style={{ color: "var(--color-muted)", marginBottom: "20px" }}>Estos son los pines que has creado.</p>
        </section>
        <PinGrid key={refreshKey} autorId={user.id} />
      </main>
    </>
  );
}

export default ProfilePage;
