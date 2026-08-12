import "../styles/SearchPage.css";

// Renders "All / Gold / Silver / Platinum / Rose Gold" style tabs on
// laptop/tablet — same as before. On mobile it switches to a compact
// dropdown instead (tabs wrap and push the toolbar around on narrow
// screens once a category has more than 2-3 metal types).
// Both markups render together; CSS shows only the right one per
// breakpoint (see .metal-tabs / .metal-select in SearchPage.css).
export default function MetalTypeTabs({ metalTypes = [], value, onChange }) {
  if (!metalTypes.length) return null;

  return (
    <>
      {/* ---- Laptop / tablet: tab buttons ---- */}
      <div className="metal-tabs">
        <button
          type="button"
          className={`metal-tabs__tab ${!value ? "is-active" : ""}`}
          onClick={() => onChange("")}
        >
          All
        </button>
        {metalTypes.map((metal) => (
          <button
            key={metal}
            type="button"
            className={`metal-tabs__tab ${value === metal ? "is-active" : ""}`}
            onClick={() => onChange(metal)}
          >
            {metal.charAt(0).toUpperCase() + metal.slice(1)}
          </button>
        ))}
      </div>

      {/* ---- Mobile: dropdown ---- */}
      <select
        className="metal-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All Metals</option>
        {metalTypes.map((metal) => (
          <option key={metal} value={metal}>
            {metal.charAt(0).toUpperCase() + metal.slice(1)}
          </option>
        ))}
      </select>
    </>
  );
}