import { useNavigate } from "react-router-dom";

function PinCard({ pin }) {
  const navigate = useNavigate();

  function handleCardClick() {
    navigate(`/pin/${pin.id}`);
  }

  return (
    <figure className="pin" onClick={handleCardClick} role="button" tabIndex="0">
      <img
        className="pin__imagen"
        src={pin.url_imagen}
        alt={pin.titulo}
        loading="lazy"
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

export default PinCard;
