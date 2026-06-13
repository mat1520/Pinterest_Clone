import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import pinService from "../services/pinService";

function HeartOutline() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function HeartFilled() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BookmarkOutline() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BookmarkFilled() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function PinCard({ pin, priority = false }) {
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(pin.likes_count || 0);
  const [saved, setSaved] = useState(false);

  function handleCardClick(e) {
    if (e.target.closest(".pin__accion")) return;
    navigate(`/pin/${pin.id}`);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.target.closest(".pin__accion")) handleCardClick(e);
  }

  async function handleLike(e) {
    e.stopPropagation();
    if (!authenticated) return navigate("/login");
    try {
      const res = await pinService.toggleLike(pin.id);
      setLiked(res.liked);
      setLikesCount(res.likes_count);
    } catch {}
  }

  async function handleSave(e) {
    e.stopPropagation();
    if (!authenticated) return navigate("/login");
    try {
      const res = await pinService.toggleSave(pin.id);
      setSaved(res.saved);
    } catch {}
  }

  function handleShare(e) {
    e.stopPropagation();
    const url = `${window.location.origin}/pin/${pin.id}`;
    if (navigator.share) {
      navigator.share({ title: pin.titulo, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  return (
    <figure
      className="pin"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex="0"
    >
      <div className="pin__media">
        <img
          className="pin__imagen"
          src={pin.url_imagen}
          alt={pin.titulo}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
        />
        <div className="pin__overlay">
          <div className="pin__overlay-acciones">
            <button
              className={`pin__accion pin__accion--like ${liked ? "pin__accion--activo" : ""}`}
              onClick={handleLike}
              aria-label={liked ? "Quitar like" : "Dar like"}
            >
              {liked ? <HeartFilled /> : <HeartOutline />}
              {likesCount > 0 && <span className="pin__accion-count">{likesCount}</span>}
            </button>
            <div className="pin__overlay-derecha">
              <button
                className={`pin__accion pin__accion--save ${saved ? "pin__accion--activo" : ""}`}
                onClick={handleSave}
                aria-label={saved ? "Quitar guardado" : "Guardar"}
              >
                {saved ? <BookmarkFilled /> : <BookmarkOutline />}
              </button>
              <button
                className="pin__accion pin__accion--share"
                onClick={handleShare}
                aria-label="Compartir"
              >
                <ShareIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="pin__contenido">
        <h2 className="pin__titulo">{pin.titulo}</h2>
        {pin.categoria && (
          <span className="pin__categoria-badge">{pin.categoria}</span>
        )}
        <p className="pin__autor">@{pin.autor_nombre}</p>
      </figcaption>
    </figure>
  );
}

export default memo(PinCard);