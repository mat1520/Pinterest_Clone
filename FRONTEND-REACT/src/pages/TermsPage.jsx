import { Link } from "react-router-dom";

function TermsPage() {
  return (
    <main className="terminos">
      <section className="terminos__contenedor">
        <Link to="/register" className="terminos__volver">Volver al registro</Link>
        <h1 className="terminos__titulo">Términos y Condiciones</h1>
        <p className="terminos__intro">
          Al utilizar Pinterest Clone, aceptas las siguientes normas derivadas de
          nuestro compromiso con la ética y la responsabilidad profesional.
        </p>

        <section className="terminos__seccion">
          <h2 className="terminos__subtitulo">Reglas de Uso</h2>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Registro veraz</h3>
            <p>
              Los usuarios deben proporcionar informacion real durante su registro,
              incluyendo su fecha de nacimiento, confirmando ser mayores de edad
              (18+ años). El sistema valida este requisito tanto en el frontend como
              en el backend.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Respeto a la comunidad</h3>
            <p>
              Está estrictamente prohibido el uso de la sección de comentarios para
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
          <h2 className="terminos__subtitulo">Políticas de Contenido</h2>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Propiedad intelectual</h3>
            <p>
              Los usuarios solo pueden subir contenido multimedia del cual posean
              los derechos de autor o cuenten con permisos explícitos. Solo el autor
              o un administrador puede eliminar un Pin.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Contenido prohibido</h3>
            <p>
              No se tolerará la publicación de material explícito (NSFW), violencia
              gráfica, promoción de actividades ilegales o imágenes que vulneren la
              privacidad de terceros (doxxing).
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Moderación</h3>
            <p>
              La plataforma se reserva el derecho, a través de sus administradores,
              de eliminar cualquier Pin o comentario que viole estas políticas, en
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
               sesión. El sistema registra todos los eventos de inicio de sesión
              mediante un logger de auditoria.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Reporte de vulnerabilidades</h3>
            <p>
              Si el usuario detecta un comportamiento anómalo o contenido prohibido,
              es su responsabilidad moral reportarlo a los administradores.
            </p>
          </article>

          <article className="terminos__articulo">
            <h3 className="terminos__encabezado">Uso ético de la API</h3>
            <p>
              Queda prohibido el uso de bots, scrapers o ingeniería inversa. El
              rate limiting (10 peticiones/minuto) es la barrera técnica que
              respalda esta política.
            </p>
          </article>
        </section>

        <p className="terminos__pie">
          Al hacer clic en &quot;Continuar&quot; durante el registro, aceptas estos
          términos y condiciones.
        </p>
      </section>
    </main>
  );
}

export default TermsPage;
