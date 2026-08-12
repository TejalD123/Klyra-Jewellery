import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getActiveBanners } from "../services/banner.api";
import "../styles/Hero.css";

const FALLBACK_BANNER = {
  title: "Crafted for Generations",
  subtitle: "Exquisite jewellery that celebrates elegance, heritage, and the art of fine craftsmanship.",
  ctaText: "Explore Collections",
  ctaLink: "/collections",
  image: null,
};

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getActiveBanners("hero");
        setBanners(res.data.data || []);
      } catch (err) {
        console.error("Failed to load hero banners:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return <section className="hero hero--loading" />;
  }

  const banner = banners[active] || FALLBACK_BANNER;

  return (
    <section className="hero">
      {/* Full-bleed image — covers the entire section, not just half */}
      <div className="hero__media">
        {banner.image ? (
          <img src={banner.image} alt={banner.title} />
        ) : (
          <>
            <div className="hero__media-fallback-bg" />
            <div className="hero__media-fallback-center">
              <div className="hero__media-fallback-circle">
                <span className="hero__media-fallback-label">Hero Product Image</span>
              </div>
            </div>
          </>
        )}
        <div className="hero__overlay" />
      </div>

      <div className="hero__grid">
        <div className="hero__content">
          <span
            className="hero__eyebrow"
            style={banner.textColor ? { color: banner.textColor } : undefined}
          >
            Timeless Beauty
          </span>
          <h1
            className="hero__title"
            style={banner.textColor ? { color: banner.textColor } : undefined}
          >
            {banner.title}
          </h1>
          <p
            className="hero__subtitle"
            style={banner.textColor ? { color: banner.textColor } : undefined}
          >
            {banner.subtitle}
          </p>
          <Link
            to={banner.ctaLink || "/collections"}
            className="hero__cta"
            style={banner.buttonColor ? { backgroundColor: banner.buttonColor } : undefined}
          >
            {banner.ctaText || "Explore Collections"}
            <ArrowRight size={15} strokeWidth={2} />
          </Link>

          {banners.length > 1 && (
            <div className="hero__dots">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to banner ${i + 1}`}
                  className={`hero__dot ${i === active ? "hero__dot--active" : ""}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;