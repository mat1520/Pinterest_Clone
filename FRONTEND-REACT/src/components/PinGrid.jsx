import { useEffect, useRef, useState, memo } from "react";
import { useLocation } from "react-router-dom";
import pinService from "../services/pinService";
import PinCard from "./PinCard";

const SKELETON_HEIGHTS = [220, 300, 180, 260, 340, 200, 280, 150, 310, 230, 190, 270];
const INITIAL_BATCH = 12;
const BATCH_SIZE = 12;

function PinGridSkeleton() {
  return (
    <section className="muro">
      {SKELETON_HEIGHTS.map((h, i) => (
        <article key={i} className="pin">
          <span className="pin__placeholder skeleton" style={{ height: `${h}px` }} />
        </article>
      ))}
    </section>
  );
}

function PinGrid({ autorId = null }) {
  const [pins, setPins] = useState([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get("q") || "";

  useEffect(() => {
    setLoading(true);
    setVisibleCount(INITIAL_BATCH);
    pinService
      .getAll(q, autorId)
      .then(setPins)
      .catch(() => setError("No se pudieron cargar los pins."))
      .finally(() => setLoading(false));
  }, [q, autorId]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + BATCH_SIZE);
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [pins]);

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

  const visiblePins = pins.slice(0, visibleCount);
  const hasMore = visibleCount < pins.length;

  return (
    <>
      <section className="muro">
        {visiblePins.map((pin, index) => (
          <PinCard key={pin.id} pin={pin} priority={index < 4} />
        ))}
      </section>
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
    </>
  );
}

export default memo(PinGrid);
