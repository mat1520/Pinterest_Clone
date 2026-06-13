import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import pinService from "../services/pinService";
import PinCard from "./PinCard";

const SKELETON_HEIGHTS = [220, 300, 180, 260, 340, 200, 280, 150, 310, 230, 190, 270];

function PinGridSkeleton() {
  return (
    <section className="muro">
      {SKELETON_HEIGHTS.map((h, i) => (
        <article key={i} className="pin">
          <span
            className="pin__placeholder skeleton"
            style={{ height: `${h}px` }}
          />
        </article>
      ))}
    </section>
  );
}

function PinGrid({ autorId = null }) {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get("q") || "";

  useEffect(() => {
    setLoading(true);
    pinService
      .getAll(q, autorId)
      .then(setPins)
      .catch(() => setError("No se pudieron cargar los pins."))
      .finally(() => setLoading(false));
  }, [q, autorId]);

  if (loading) return <PinGridSkeleton />;

  if (error) {
    return (
      <section className="estado-vacio">
        <p className="estado-vacio__titulo">{error}</p>
        <p>Verifica que el servidor este activo e intenta de nuevo.</p>
      </section>
    );
  }

  if (pins.length === 0) {
    return (
      <section className="estado-vacio">
        <p className="estado-vacio__titulo">Todavia no hay pins</p>
        <p>Sube el primero para comenzar a explorar ideas.</p>
      </section>
    );
  }

  return (
    <section className="muro">
      {pins.map((pin) => (
        <PinCard key={pin.id} pin={pin} />
      ))}
    </section>
  );
}

export default PinGrid;
