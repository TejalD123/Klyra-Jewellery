import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaYoutube, FaXTwitter } from "react-icons/fa6";
import { ChevronDown } from "lucide-react";
import "./styles/Footer.css";

const GemMark = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M6 4h12l3 5-9 11L3 9l3-5Z" />
    <path d="M3 9h18M8.5 4 12 9l3.5-5M12 9l-3.2 11M12 9l3.2 11" />
  </svg>
);

// Each link has its own `to` path. Update these to match your actual
// routes.
const FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All Jewellery", to: "/shop" },
      { label: "Rings", to: "/categories/rings" },
      { label: "Earrings", to: "/categories/earrings" },
      { label: "Bracelets", to: "/categories/bracelets" },
      { label: "Chains & Necklaces", to: "/categories/necklaces" },
    ],
  },
  {
    heading: "Customer Service",
    links: [
      { label: "Track Order", to: "/account/track-order" },
      { label: "Shipping & Returns", to: "/shipping-returns" },
      { label: "Returns & Exchange", to: "/returns-exchange" },
      { label: "Care & Guide", to: "/care-guide" },
      { label: "FAQs", to: "/faqs" },
    ],
  },
  {
    heading: "About Us",
    links: [
      { label: "Our Story", to: "/about-us" },
      { label: "Craftsmanship", to: "/craftsmanship" },
      { label: "Sustainability", to: "/sustainability" },
      { label: "Blog", to: "/blog" },
      { label: "Careers", to: "/careers" },
    ],
  },
];

const PAYMENT_ICONS = ["VISA", "MASTERCARD", "AMEX", "UPI"];

const SOCIAL_LINKS = [
  { Icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
  { Icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { Icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
  { Icon: FaXTwitter, href: "https://twitter.com", label: "X (Twitter)" },
];

const Footer = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleColumn = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div>
            <Link to="/" className="footer__brand">
              <GemMark className="footer__brand-icon" />
              <span className="footer__brand-text">KLYRA</span>
            </Link>

            <p className="footer__desc">
              Fine jewellery that tells your story — timeless designs, crafted with care, made for every occasion.
            </p>

            <div className="footer__socials">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.Icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="footer__social-btn"
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={col.heading} className="footer__col">
                <button
                  type="button"
                  className="footer__col-heading-btn"
                  onClick={() => toggleColumn(index)}
                  aria-expanded={isOpen}
                >
                  {col.heading}
                  <ChevronDown
                    size={14}
                    className={`footer__col-chevron ${isOpen ? "footer__col-chevron--open" : ""}`}
                  />
                </button>

                <div className={`footer__col-content ${isOpen ? "footer__col-content--open" : ""}`}>
                  <div className="footer__col-content-inner">
                    <ul className="footer__col-links">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <Link to={link.to}>{link.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="footer__divider" />

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Klyra Jewellery. All Rights Reserved.</p>
          <div className="footer__payments">
            {PAYMENT_ICONS.map((item) => (
              <span key={item} className="footer__payment-chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;