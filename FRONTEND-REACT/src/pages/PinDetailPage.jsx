import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import pinService from "../services/pinService";
import Header from "../components/Header";

function HeartFilled({ count }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function HeartOutline() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BookmarkFilled() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BookmarkOutline() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function PinDetailPage() {
  const { id } = useParams();
  const { authenticated, user } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState(null);
  const [comments, setComments] = useState([]);
  const [texto, setTexto] = useState("");
  const [loadingPin, setLoadingPin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [pinData, commentsData] = await Promise.all([
          pinService.getById(id),
          pinService.getComments(id),
        ]);
        if (cancelled) return;
        setPin(pinData);
        setComments(commentsData);
        setLikesCount(pinData.likes_count || 0);

        if (authenticated) {
          try {
            const [likesData, saveData] = await Promise.all([
              pinService.getLikes(id),
              pinService.getSavedStatus(id),
            ]);
            if (cancelled) return;
            setLiked(likesData.liked);
            setLikesCount(likesData.likes_count);
            setSaved(saveData.saved);
          } catch {}
        }
      } catch {
        if (!cancelled) setPin(null);
      } finally {
        if (!cancelled) setLoadingPin(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, authenticated]);

  async function handleComment(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    setSubmitting(true);
    try {
      const comment = await pinService.createComment(id, texto.trim());
      setComments((prev) => [...prev, comment]);
      setTexto("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePin() {
    if (!window.confirm("¿Seguro que deseas eliminar este pin? Esta accion no se puede deshacer.")) return;
    try {
      await pinService.delete(id);
      navigate("/");
    } catch {
      alert("Hubo un error al eliminar el pin.");
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      await pinService.deleteComment(id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      alert("Error al eliminar el comentario.");
    }
  }

  async function handleLike() {
    if (!authenticated) return navigate("/login");
    try {
      const res = await pinService.toggleLike(id);
      setLiked(res.liked);
      setLikesCount(res.likes_count);
    } catch {}
  }

  async function handleSave() {
    if (!authenticated) return navigate("/login");
    try {
      const res = await pinService.toggleSave(id);
      setSaved(res.saved);
    } catch {}
  }

  function handleShare() {
    const url = `${window.location.origin}/pin/${id}`;
    if (navigator.share) {
      navigator.share({ title: pin?.titulo, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  if (loadingPin) {
    return (
      <>
        <Header />
        <main>
          <section className="detalle">
            <article className="publicacion">
              <span className="skeleton" style={{ display: "block", height: "520px", borderRadius: "8px" }} />
            </article>
            <aside className="comentarios">
              <span className="skeleton" style={{ display: "block", height: "200px", borderRadius: "8px" }} />
            </aside>
          </section>
        </main>
      </>
    );
  }

  if (!pin) {
    return (
      <>
        <Header />
        <main>
          <section className="estado-vacio">
            <p className="estado-vacio__titulo">Pin no encontrado</p>
            <Link className="formulario__enlace" to="/">Volver al inicio</Link>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <section className="detalle">
          <article className="publicacion">
            <figure className="publicacion__figura">
              <img
                className={`publicacion__imagen${imgLoaded ? " publicacion__imagen--loaded" : ""}`}
                src={pin.url_imagen}
                alt={pin.titulo}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                onLoad={() => setImgLoaded(true)}
              />
            </figure>
            <div className="publicacion__acciones">
              <button
                className={`publicacion__accion ${liked ? "publicacion__accion--activo" : ""}`}
                onClick={handleLike}
                aria-label={liked ? "Quitar like" : "Dar like"}
              >
                {liked ? <HeartFilled count={likesCount} /> : <HeartOutline />}{likesCount > 0 && <span style={{ marginLeft: 4 }}>{likesCount}</span>}
              </button>
              <button
                className={`publicacion__accion ${saved ? "publicacion__accion--activo" : ""}`}
                onClick={handleSave}
                aria-label={saved ? "Quitar guardado" : "Guardar"}
              >
                {saved ? <BookmarkFilled /> : <BookmarkOutline />} Guardar
              </button>
              <button className="publicacion__accion" onClick={handleShare} aria-label="Compartir">
                ↗ Compartir
              </button>
            </div>
            <h1 className="publicacion__titulo">{pin.titulo}</h1>
            {pin.categoria && (
              <span className="publicacion__categoria-badge">{pin.categoria}</span>
            )}
            {pin.descripcion && (
              <p className="publicacion__descripcion">{pin.descripcion}</p>
            )}
            <p className="publicacion__autor">@{pin.autor_nombre}</p>
            {(user?.id === pin.autor_id || user?.es_admin) && (
              <button
                className="boton boton--sm boton--gris boton--peligro"
                onClick={handleDeletePin}
              >
                Eliminar pin
              </button>
            )}
          </article>

          <aside className="comentarios">
            <h2 className="comentarios__titulo">Comentarios</h2>
            {comments.length === 0 ? (
              <p className="comentarios__vacio">
                Todavia no hay comentarios. Se el primero.
              </p>
            ) : (
              <ul className="comentarios__lista">
                {comments.map((c) => (
                  <li key={c.id} className="comentario">
                    <div className="comentario__cabecera">
                      <p className="comentario__autor">@{c.autor_nombre}</p>
                      {(user?.id === c.autor_id || user?.es_admin) && (
                        <button
                          className="comentario__eliminar"
                          onClick={() => handleDeleteComment(c.id)}
                          aria-label="Eliminar comentario"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                    <p className="comentario__texto">{c.texto}</p>
                  </li>
                ))}
              </ul>
            )}

            {authenticated ? (
              <form className="comentarios__form" onSubmit={handleComment}>
                <label className="sr-only" htmlFor="campo-comentario">Agrega un comentario</label>
                <textarea
                  id="campo-comentario"
                  className="comentarios__campo"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escribe algo..."
                  maxLength={500}
                />
                <button className="boton boton--sm" type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Comentar"}
                </button>
              </form>
            ) : (
              <p className="formulario__texto">
                <Link className="formulario__enlace" to="/login">Inicia sesion</Link> para comentar.
              </p>
            )}
          </aside>
        </section>
      </main>
    </>
  );
}

export default PinDetailPage;