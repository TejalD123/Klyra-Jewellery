import "../styles/SearchPage.css";

export const SORT_OPTIONS = [
  { label: "Newest first", value: "-createdAt" },
  { label: "Oldest first", value: "createdAt" },
  { label: "Price: Low to High", value: "finalPrice" },
  { label: "Price: High to Low", value: "-finalPrice" },
  { label: "Top Rated", value: "-ratings.avgRating" },
  { label: "Bestselling", value: "-isBestseller -ratings.avgRating" },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <select className="sort-dropdown" value={value} onChange={(e) => onChange(e.target.value)}>
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          Sort: {opt.label}
        </option>
      ))}
    </select>
  );
}
