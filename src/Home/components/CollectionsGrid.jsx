import { Link } from "react-router-dom";
import "../styles/CollectionsGrid.css";

const COLLECTIONS = [
  { name: "Heritage", slug: "heritage" },
  { name: "Diamond", slug: "diamond" },
  { name: "Gold", slug: "gold" },
  { name: "Earrings", slug: "earrings" },
];

const CollectionsGrid = () => {
  return (
    <section className="collections">
      <div className="collections__inner">
        <div className="collections__header">
          <span className="collections__eyebrow">Our Collections</span>
          <h2 className="collections__heading">Elegance in Every Detail</h2>
        </div>

        <div className="collections__grid">
          {COLLECTIONS.map((c) => (
            <Link key={c.slug} to={`/collections/${c.slug}`} className="collections__item">
              <div className="collections__card-image">
                <span className="collections__card-label">{c.name} Image</span>
              </div>
              <div className="collections__name">
                <p className="collections__name-title">{c.name} Collection</p>
                <span className="collections__name-cta">Shop Now →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsGrid;
