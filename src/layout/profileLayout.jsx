import { NavLink, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { UserCircle, Package, Truck, Bell, LogOut } from "lucide-react";
import { logout } from "../features/auth/services/Auth.slice";
import "./styles/profileLayout.css";

// Wishlist yahan include nahi — wo already standalone /wishlist route hai
const ACCOUNT_NAV = [
  { label: "My Profile", to: "/account", icon: UserCircle, end: true },
  { label: "My Orders", to: "/account/orders", icon: Package },
  { label: "Track Order", to: "/track-order", icon: Truck },
  { label: "Notifications", to: "/account/notifications", icon: Bell },
];

const ProfileLayout = () => {
  const dispatch = useDispatch();

  return (
    <div className="account-layout">
      <aside className="account-sidebar">
        <h2 className="account-sidebar__title">My Account</h2>
        <nav className="account-sidebar__nav">
          {ACCOUNT_NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `account-sidebar__link ${isActive ? "account-sidebar__link--active" : ""}`
              }
            >
              <Icon size={17} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
          <button onClick={() => dispatch(logout())} className="account-sidebar__link account-sidebar__logout">
            <LogOut size={17} strokeWidth={1.5} />
            Logout
          </button>
        </nav>
      </aside>

      <div className="account-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;