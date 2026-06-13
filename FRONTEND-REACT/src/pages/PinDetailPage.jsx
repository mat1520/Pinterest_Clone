import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import pinService from "../services/pinService";
import Header from "../components/Header";

function PinDetailPage() {
  const { id } = useParams();
  const { authenticated, user } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState(null);
  const [comments, setComments] = useState([]);
  const [texto, setTexto] = useState("");
  const [loadingPin, setLoadingPin] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([pinService.getById(id), pinService.getComments(id)])
      .then(([pinData, commentsData]) => {
        setPin(pinData);
        setComments(commentsData);
      })
      .catch(() => {
        setPin(null);
      })
      .finally(() => setLoadingPin(false));
  }, [id]);

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

  async function handleDelete() {
    if (!window.confirm("¿Seguro que deseas eliminar este pin? Esta acción no se puede deshacer.")) return;
    try {
      await pinService.delete(id);
      navigate("/");
    } catch (err) {
      alert("Hubo un error al eliminar el pin.");
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
            <Link className="formulario__enlace" to="/">
              Volver al inicio
            </Link>
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
                className="publicacion__imagen"
                src={pin.url_imagen}
                alt={pin.titulo}
                loading="eager"
                decoding="sync"
                fetchpriority="high"
              />
            </figure>
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
                className="boton boton--sm boton--gris"
                style={{ marginTop: "16px", color: "var(--color-accent)" }}
                onClick={handleDelete}
              >
                Eliminar pin
              </button>
            )}
          </article>

          <aside className="comentarios">
            <h2 className="comentarios__titulo">Comentarios</h2>
            {comments.length === 0 ? (
              <p style={{ color: "var(--color-muted)", fontSize: "14px" }}>
                Todavia no hay comentarios. Se el primero.
              </p>
            ) : (
              <ul className="comentarios__lista">
                {comments.map((c) => (
                  <li key={c.id} className="comentario">
                    <p className="comentario__autor">@{c.autor_nombre}</p>
                    <p className="comentario__texto">{c.texto}</p>
                  </li>
                ))}
              </ul>
            )}

            {authenticated ? (
              <form className="comentarios__form" onSubmit={handleComment}>
                <label className="comentarios__label" htmlFor="campo-comentario">
                  Agrega un comentario
                </label>
                <textarea
                  id="campo-comentario"
                  className="comentarios__campo"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escribe algo..."
                />
                <button className="boton boton--sm" type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Comentar"}
                </button>
              </form>
            ) : (
              <p className="formulario__texto">
                <Link className="formulario__enlace" to="/login">
                  Inicia sesion
                </Link>{" "}
                para comentar.
              </p>
            )}
          </aside>
        </section>
      </main>
    </>
  );
}

export default PinDetailPage;
