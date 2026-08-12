import { NavLink } from "react-router-dom";
import "../styles/AdminMobileNav.css";

const TABS = [
  {
    to: "/admin/dashboard",
    label: "Home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 11l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/admin/categories",
    label: "Categories",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16M4 12h10M4 18h7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 3h12l1 5H5l1-5z" strokeLinejoin="round" />
        <path d="M5 8h14l-1.2 11a2 2 0 01-2 1.8H8.2A2 2 0 016.2 19L5 8z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/admin/notifications",
    label: "Alerts",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 9a6 6 0 1112 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 18.5a2.5 2.5 0 005 0" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/admin/queries",
    label: "Support",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 12a8 8 0 10-3.6 6.7L21 20l-1.1-3.6c.7-1.2 1.1-2.6 1.1-4.4z" strokeLinejoin="round" />
        <path d="M12 9v3M12 15h.01" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AdminMobileNav() {
  return (
    <nav className="admin-mobilenav">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `admin-mobilenav__item ${isActive ? "is-active" : ""}`}
        >
          {tab.icon}
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}