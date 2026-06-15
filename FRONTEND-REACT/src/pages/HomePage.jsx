import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../constants";
import Header from "../components/Header";
import PinGrid from "../components/PinGrid";
import pinService from "../services/pinService";

function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [categories, setCategories] = useState(CATEGORIES);

  useEffect(() => {
    pinService
      .getCategories()
      .then((cats) => {
        if (cats.length > 0) setCategories(cats);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Header onPinCreated={() => setRefreshKey((k) => k + 1)} />
      <main>
        <section className="categorias">
          <nav className="categorias__lista" aria-label="Categorias">
            {categories.map(
              (categoria) => (
                <Link key={categoria} className="categorias__enlace" to={`/?q=${categoria}`}>
                  {categoria}
                </Link>
              )
            )}
          </nav>
        </section>
        <PinGrid key={refreshKey} />
      </main>
    </>
  );
}

export default HomePage;
