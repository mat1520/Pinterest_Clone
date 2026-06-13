import { memo } from "react";
import { useNavigate } from "react-router-dom";

function PinCard({ pin, priority = false }) {
  const navigate = useNavigate();

  function handleCardClick() {
    navigate(`/pin/${pin.id}`);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleCardClick();
  }

  return (
    <figure
      className="pin"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex="0"
    >
      <img
        className="pin__imagen"
        src={pin.url_imagen}
        alt={pin.titulo}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "low"}
      />
      <figcaption className="pin__contenido">
        <h2 className="pin__titulo">{pin.titulo}</h2>
        {pin.categoria && (
          <span className="pin__etiqueta">{pin.categoria}</span>
        )}
        <p className="pin__autor">@{pin.autor_nombre}</p>
      </figcaption>
    </figure>
  );
}

export default memo(PinCard);
