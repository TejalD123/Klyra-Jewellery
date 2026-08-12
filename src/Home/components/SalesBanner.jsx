import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getActiveBanners } from "../services/banner.api";
import "../styles/SalesBanner.css";

// Dummy fallback data — backend cha shape dakhavण्यासाठी
const DUMMY_BANNERS = [
  {
    _id: "1",
    title: "End of Season Sale",
    subtitle: "Up to 40% off on select pieces",
    ctaText: "Shop Now",
    ctaLink: "/collections/sale",
    image: null,
    backgroundColor: null,
  },
  {
    _id: "2",
    title: "New Arrivals",
    subtitle: "Fresh designs just in",
    ctaText: "Explore",
    ctaLink: "/collections/new",
    image: null,
    backgroundColor: null,
  },
  {
    _id: "3",
    title: "Bridal Collection",
    subtitle: "Timeless pieces for your big day",
    ctaText: "View Collection",
    ctaLink: "/collections/bridal",
    image: null,
    backgroundColor: null,
  },
];

const SalesBanner = () => {
  const [banners, setBanners] = useState(DUMMY_BANNERS);

  useEffect(() => {
    (async () => {
      try {
        const res = await getActiveBanners("sale");
        const data = res.data.data;
        if (data && data.length > 0) {
          setBanners(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load sale banners:", err);
      }
    })();
  }, []);

  if (!banners || banners.length === 0) return null;

  const [main, ...rest] = banners;

  return (
    <section className="salebanner">
      <div className="salebanner__inner">
        {/* Left: bada rectangle banner */}
        {main && (
          <Link
            to={main.ctaLink || "/collections"}
            className="salebanner__card salebanner__card--main"
            style={main.backgroundColor ? { backgroundColor: main.backgroundColor } : undefined}
          >
            {main.image && <img src={main.image} alt={main.title} className="salebanner__card-img" />}
            <div className="salebanner__card-overlay">
              <p className="salebanner__card-text">
                <strong>{main.title}</strong>
                {main.subtitle && <span className="salebanner__card-subtitle">{main.subtitle}</span>}
              </p>
              <span className="salebanner__card-link">{main.ctaText || "Shop Now"}</span>
            </div>
          </Link>
        )}

        {/* Right: 2 chhote banners stacked */}
        <div className="salebanner__side">
          {rest.map((banner) => (
            <Link
              key={banner._id}
              to={banner.ctaLink || "/collections"}
              className="salebanner__card salebanner__card--small"
              style={banner.backgroundColor ? { backgroundColor: banner.backgroundColor } : undefined}
            >
              {banner.image && <img src={banner.image} alt={banner.title} className="salebanner__card-img" />}
              <div className="salebanner__card-overlay">
                <p className="salebanner__card-text">
                  <strong>{banner.title}</strong>
                  {banner.subtitle && <span className="salebanner__card-subtitle">{banner.subtitle}</span>}
                </p>
                <span className="salebanner__card-link">{banner.ctaText || "Shop Now"}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesBanner;