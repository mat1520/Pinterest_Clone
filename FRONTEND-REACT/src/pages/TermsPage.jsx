import { Link } from "react-router-dom";

function TermsPage() {
  return (
    <main className="terminos">
      <section className="terminos__contenedor">
        <Link to="/register" className="terminos__volver">Volver al registro</Link>
        <h1 className="terminos__titulo">Terminos y Condiciones</h1>
        <p className="terminos__intro">
          Al utilizar Pinterest Clone, aceptas las siguientes normas derivadas de
          nuestro compromiso con la etica y la responsabilidad profesional.
        </p>

        <section className="terminos__seccion">
          <h2 className="terminos__subtitulo">Reglas de Uso</h2>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Registro veraz</h3>
            <p>
              Los usuarios deben proporcionar informacion real durante su registro,
              incluyendo su fecha de nacimiento, confirmando ser mayores de edad
              (18+ anos). El sistema valida este requisito tanto en el frontend como
              en el backend.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Respeto a la comunidad</h3>
            <p>
              Esta estrictamente prohibido el uso de la seccion de comentarios para
              hostigamiento, discurso de odio, spam o cualquier forma de violencia
              digital.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Uso personal e intransferible</h3>
            <p>
              La cuenta es personal e intransferible. El usuario es responsable de
              mantener la confidencialidad de sus credenciales.
            </p>
          </article>
        </section>

        <section className="terminos__seccion">
          <h2 className="terminos__subtitulo">Politicas de Contenido</h2>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Propiedad intelectual</h3>
            <p>
              Los usuarios solo pueden subir contenido multimedia del cual posean
              los derechos de autor o cuenten con permisos explicitos. Solo el autor
              o un administrador puede eliminar un Pin.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Contenido prohibido</h3>
            <p>
              No se tolerara la publicacion de material explicito (NSFW), violencia
              grafica, promocion de actividades ilegales o imagenes que vulneren la
              privacidad de terceros (doxxing).
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Moderacion</h3>
            <p>
              La plataforma se reserva el derecho, a traves de sus administradores,
              de eliminar cualquier Pin o comentario que viole estas politicas, en
              cumplimiento del deber de no maleficencia.
            </p>
          </article>
        </section>

        <section className="terminos__seccion">
          <h2 className="terminos__subtitulo">Responsabilidades del Usuario</h2>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Seguridad de la cuenta</h3>
            <p>
              El usuario es responsable de todas las actividades que ocurran bajo su
              sesion. El sistema registra todos los eventos de inicio de sesion
              mediante un logger de auditoria.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Reporte de vulnerabilidades</h3>
            <p>
              Si el usuario detecta un comportamiento anomalo o contenido prohibido,
              es su responsabilidad moral reportarlo a los administradores.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Uso etico de la API</h3>
            <p>
              Queda prohibido el uso de bots, scrapers o ingenieria inversa. El
              rate limiting (10 peticiones/minuto) es la barrera tecnica que
              respalda esta politica.
            </p>
          </article>
        </section>

        <p className="terminos__pie">
          Al hacer clic en &quot;Continuar&quot; durante el registro, aceptas estos
          terminos y condiciones.
        </p>
      </section>
    </main>
  );
}

export default TermsPage;
