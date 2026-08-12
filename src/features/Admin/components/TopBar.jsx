import "../styles/topbar.css"

export default function Topbar({ title, subtitle, actions }) {
  return (
    <header
      className="admin-topbar"

      style={{
        height: "var(--admin-topbar-h)",
        background: "var(--admin-cream)",
        borderBottom: "1px solid var(--admin-border)",
      }}
    >
      <div>
        <h1 className="admin-topbar__title">{title}</h1>
        {subtitle && (
          <p className="admin-topbar__subtitle">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">{actions}</div>
    </header>
  );
}