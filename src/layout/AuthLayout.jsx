import { Link } from "react-router-dom";
import { Menu, ShoppingBag } from "lucide-react";
import "./styles/AuthLayout.css";

// headerVariant="full"    -> hamburger + wordmark + cart icon (Sign Up screen)
// headerVariant="minimal" -> plain centered wordmark, no icons (Sign In screen)
// showFooter               -> renders the small copyright line under the card

const AuthLayout = ({
  children,
  imageUrl,
  tagline,
  headerVariant = "full",
  showFooter = false,
}) => {
  return (
    <div className="auth-page">
      {/* <header className="auth-header">
        {headerVariant === "full" ? (
          <>
            <button aria-label="Menu" className="auth-header__icon-btn">
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <Link to="/" className="auth-header__brand">
              AURELIAN
            </Link>
            <Link to="/cart" aria-label="Cart" className="auth-header__icon-btn">
              <ShoppingBag size={20} strokeWidth={1.5} />
            </Link>
          </>
        ) : (
          <>
            <span className="auth-header__spacer" />
            <Link to="/" className="auth-header__brand" style={{ margin: "0 auto" }}>
              AURELIAN
            </Link>
            <span className="auth-header__spacer" />
          </>
        )}
      </header> */}

      <main className="auth-main">
        <div className="auth-card">
          <div
            className="auth-card-image"
            style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          >
            <div className="auth-card-image__overlay" />
            {tagline && <p className="auth-card-image__tagline">{tagline}</p>}
          </div>

          <div className="auth-card__form">{children}</div>
        </div>
      </main>

      {/* {showFooter && (
        <footer className="auth-footer">
          <p className="auth-footer__text">© 2024 AURELIAN FINE JEWELRY. ALL RIGHTS RESERVED.</p>
        </footer>
      )} */}

      <div id="recaptcha-container" />
    </div>
  );
};

export default AuthLayout;
