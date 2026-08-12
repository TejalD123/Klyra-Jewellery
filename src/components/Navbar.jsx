import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  User,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
  UserCircle,
  Package,
  Bell,
  Truck,
  LogOut,
} from "lucide-react";
import { logout } from "../features/auth/services/Auth.slice"; // <-- apne actual path se adjust karo
import "./styles/Navbar.css";
import { openCartSidebar } from "../features/cart/services/cart.slice";

const NAV_LINKS = [
  { label: "Categories", to: "/categories" },
  { label: "Jewellery", to: "/search" },
  { label: "About Us", to: "/about-us" },
  { label: "Contact Us", to: "/contact-us" },
];

const PROFILE_MENU = [
  { label: "My Profile", to: "/account", icon: UserCircle },
  { label: "My Orders", to: "/account/orders", icon: Package },
  { label: "Track Order", to: "/track-order", icon: Truck },
  { label: "Wishlist", to: "/wishlist", icon: Heart },
  { label: "Notifications", to: "/account/notifications", icon: Bell },
];

// NEW — quick jump-in chips shown inside the search overlay before the
// user types anything. Purely cosmetic/navigational, no backend call.
const QUICK_SEARCHES = ["Rings", "Earrings", "Necklaces", "Bracelets", "Bestsellers"];

const GemMark = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
  >
    <path d="M6 4h12l3 5-9 11L3 9l3-5Z" />
    <path d="M3 9h18M8.5 4 12 9l3.5-5M12 9l-3.2 11M12 9l3.2 11" />
  </svg>
);

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // ---- NEW: full-screen search overlay state ----
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef(null);

  const navigate = useNavigate();

  const dispatch = useDispatch();
  // yeh line apne rootReducer mein authSlice jis key se register hai us se match honi chahiye
  const { user, token } = useSelector((state) => state.auth);
  const isLoggedIn = !!token;

  const profileRef = useRef(null);
  const { totalItems } = useSelector((state) => state.cart);
  // wishlist badge count
 const wishlistCount = useSelector((state) => state.wishlist?.productIds?.length || 0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // NEW: search overlay also locks body scroll, same as the mobile panel
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  // NEW: autofocus input the moment the overlay opens
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  // NEW: close the overlay on Escape
  useEffect(() => {
    if (!searchOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    setMobileOpen(false);
  };

  // NEW: shared submit handler for the overlay form + quick-search chips
  const runSearch = (term) => {
    const trimmed = (term ?? searchValue).trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    setSearchOpen(false);
    setSearchValue("");
  };

  const displayName = user?.name || user?.fullName || "User";

  return (
    <header className="navbar">
      <div className="navbar-main">
        <div className="navbar-main__inner">
          <div className="navbar-left">
            <button
              aria-label="Toggle menu"
              className="navbar-icon-btn navbar-mobile-toggle"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>

            <Link to="/" className="navbar-brand">
              <GemMark className="navbar-brand__icon" />
              <span className="navbar-brand__text">KLYRA</span>
            </Link>
          </div>

          <nav className="navbar-links">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="navbar-link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="navbar-actions">
            {/* CHANGED: search icon now opens the full-screen overlay */}
            <button
              aria-label="Search"
              className="navbar-icon-btn navbar-desktop-only"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="navbar-icon-btn"
            >
              <Heart size={19} strokeWidth={1.5} />
              <span className="navbar-badge">{wishlistCount}</span>
            </Link>

            <div className="navbar-desktop-only">
              {isLoggedIn ? (
                <div className="navbar-profile" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    aria-label="Account menu"
                    className="navbar-profile__trigger"
                  >
                    <span className="navbar-profile__avatar">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className={`navbar-profile__chevron ${profileOpen ? "navbar-profile__chevron--open" : ""}`}
                    />
                  </button>

                  {profileOpen && (
                    <div className="navbar-profile__dropdown">
                      <div className="navbar-profile__header">
                        <p className="navbar-profile__name">{displayName}</p>
                      </div>
                      <div className="navbar-profile__menu">
                        {PROFILE_MENU.map(({ label, to, icon: Icon }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setProfileOpen(false)}
                            className="navbar-profile__item"
                          >
                            <Icon size={16} strokeWidth={1.5} />
                            {label}
                          </Link>
                        ))}
                      </div>
                      <div className="navbar-profile__menu navbar-profile__logout">
                        <button
                          onClick={handleLogout}
                          className="navbar-profile__item"
                        >
                          <LogOut size={16} strokeWidth={1.5} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  aria-label="Login"
                  className="navbar-icon-btn"
                >
                  <User size={19} strokeWidth={1.5} />
                </Link>
              )}
            </div>

            <button
              aria-label="Cart"
              onClick={() => dispatch(openCartSidebar())}
              className="navbar-icon-btn"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              <span className="navbar-badge">{totalItems || 0}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ---- NEW: full-screen search overlay (desktop + mobile both use
           this — the old mobile-panel inline field is removed in favor
           of one consistent experience everywhere) ---- */}
      <div className={`search-overlay ${searchOpen ? "search-overlay--open" : ""}`}>
        <div className="search-overlay__backdrop" onClick={() => setSearchOpen(false)} />

        <div className="search-overlay__panel">
          <button
            type="button"
            className="search-overlay__close"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            <X size={22} strokeWidth={1.5} />
          </button>

          <form
            className="search-overlay__form"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
          >
            <Search size={22} strokeWidth={1.5} className="search-overlay__form-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="search-overlay__input"
              placeholder="Search necklaces, rings, earrings…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>

          <div className="search-overlay__quick">
            <span className="search-overlay__quick-label">Quick jump</span>
            <div className="search-overlay__quick-chips">
              {QUICK_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="search-overlay__quick-chip"
                  onClick={() => runSearch(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`navbar-mobile-overlay ${mobileOpen ? "navbar-mobile-overlay--open" : ""}`}
      >
        <div
          className="navbar-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />

        <aside
          className={`navbar-mobile-panel ${mobileOpen ? "navbar-mobile-panel--open" : ""}`}
        >
          <div className="navbar-mobile-panel__header">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="navbar-brand"
            >
              <GemMark className="navbar-brand__icon" />
              <span className="navbar-brand__text">KLYRA</span>
            </Link>
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="navbar-mobile-close"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="navbar-mobile-body">
            {/* CHANGED: mobile "search" row now opens the same full-screen
                overlay instead of its own separate inline field */}
            <button
              type="button"
              className="navbar-mobile-search-trigger"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search size={16} strokeWidth={1.5} />
              Search necklaces, rings, earrings…
            </button>

            <div className="navbar-mobile-account">
              {isLoggedIn ? (
                <>
                  <div className="navbar-mobile-account__row">
                    <span className="navbar-mobile-account__avatar">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                    <p className="navbar-mobile-account__name">{displayName}</p>
                  </div>
                  <div className="navbar-mobile-account__menu">
                    {PROFILE_MENU.map(({ label, to, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        className="navbar-mobile-account__item"
                      >
                        <Icon size={16} strokeWidth={1.5} />
                        {label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="navbar-mobile-account__item"
                    >
                      <LogOut size={16} strokeWidth={1.5} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="navbar-mobile-login"
                >
                  <User size={16} strokeWidth={1.5} />
                  Login / Register
                </Link>
              )}
            </div>

            <nav className="navbar-mobile-nav">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="navbar-mobile-nav__link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="navbar-mobile-utility">
              <Link
                to="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="navbar-mobile-utility__link"
              >
                <Heart size={16} strokeWidth={1.5} />
                Wishlist
              </Link>
              <Link
                to="/stores"
                onClick={() => setMobileOpen(false)}
                className="navbar-mobile-utility__link"
              >
                Store Locator
              </Link>
              <Link
                to="/track-order"
                onClick={() => setMobileOpen(false)}
                className="navbar-mobile-utility__link"
              >
                Track Order
              </Link>
              <Link
                to="/care-guide"
                onClick={() => setMobileOpen(false)}
                className="navbar-mobile-utility__link"
              >
                Care &amp; Guide
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
};

export default Navbar;