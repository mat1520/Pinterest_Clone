import { useCallback, useEffect, useRef, useState, memo } from "react";
import { useLocation } from "react-router-dom";
import pinService from "../services/pinService";
import PinCard from "./PinCard";

const SKELETON_HEIGHTS = [220, 300, 180, 260, 340, 200, 280, 150, 310, 230, 190, 270];
const PAGE_SIZE = 20;

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

function PinGrid({ autorId = null, savedOnly = false }) {
  const [pins, setPins] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);
  const initialLoadDone = useRef(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get("q") || "";

  const fetchPins = useCallback(async (currentOffset, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      let result;
      if (savedOnly) {
        result = await pinService.getSaved();
      } else {
        result = await pinService.getAll(q, autorId, currentOffset, PAGE_SIZE);
      }
      if (append) {
        setPins((prev) => [...prev, ...result.items]);
      } else {
        setPins(result.items);
      }
      setTotal(result.total);
      setOffset(currentOffset + PAGE_SIZE);
      setError(null);
    } catch {
      if (!append) setError("No se pudieron cargar los pins.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [q, autorId, savedOnly]);

  useEffect(() => {
    initialLoadDone.current = false;
    setOffset(0);
    setPins([]);
    fetchPins(0, false);
  }, [fetchPins]);

  useEffect(() => {
    if (loading || loadingMore || !sentinelRef.current) return;
    const hasMore = offset < total;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && offset < total) {
          fetchPins(offset, true);
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, offset, total, fetchPins]);

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
        <p>{savedOnly ? "Guarda pins para verlos aqui." : "Sube el primero para comenzar a explorar ideas."}</p>
      </section>
    );
  }

  const hasMore = offset < total;

  return (
    <>
      <section className="muro">
        {pins.map((pin, index) => (
          <PinCard key={pin.id} pin={pin} priority={index < 4} initialSaved={savedOnly} />
        ))}
      </section>
      {loadingMore && <PinGridSkeleton />}
      {hasMore && !loadingMore && <div ref={sentinelRef} style={{ height: 1 }} />}
    </>
  );
}

export default memo(PinGrid);