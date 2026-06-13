import { useRef, useState } from "react";
import pinService from "../services/pinService";

function PinUploadModal({ onClose, onCreated }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  function handleFileChange(file) {
    if (!file) return;
    setArchivo(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!archivo) {
      setError("Selecciona una imagen antes de continuar.");
      return;
    }
    if (!titulo.trim()) {
      setError("El titulo no puede estar vacio.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const pin = await pinService.create(
        titulo.trim(),
        archivo,
        categoria,
        descripcion.trim()
      );
      onCreated(pin);
      onClose();
    } catch {
      setError("Error al subir el pin. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <dialog className="modal" open>
      <div className="modal__contenedor">
        <h2 className="modal__titulo">Crear pin</h2>
        <form className="modal__formulario" onSubmit={handleSubmit}>
          <div
            className={`dropzone ${archivo ? "dropzone--active" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            role="button"
            tabIndex="0"
          >
            {preview ? (
              <img className="dropzone__preview" src={preview} alt="Vista previa" />
            ) : (
              <p className="dropzone__texto">Arrastra una imagen aqui o haz clic para seleccionar</p>
            )}
            <input
              ref={inputRef}
              className="dropzone__input"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
          </div>

          <label className="formulario__label">
            Titulo
            <input
              className="formulario__input"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Escribe un titulo"
              required
              minLength="1"
              maxLength="100"
            />
          </label>

          <label className="formulario__label">
            Categoría
            <select
              className="formulario__input"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Selecciona una categoría (opcional)</option>
              {["Moda", "Comida", "Viajes", "Decoracion", "Arte"].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="formulario__label">
            Descripción
            <textarea
              className="formulario__input formulario__input--textarea"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="¿De qué trata tu pin? (opcional)"
              maxLength="500"
            />
          </label>

          {uploading && (
            <div className="upload-progress">
              <div className="upload-progress__bar" />
            </div>
          )}

          {error && <p className="formulario__error">{error}</p>}

          <div className="modal__acciones">
            <button
              type="button"
              className="boton boton--gris boton--sm"
              onClick={onClose}
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="boton boton--sm"
              disabled={uploading}
            >
              {uploading ? "Subiendo..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default PinUploadModal;
