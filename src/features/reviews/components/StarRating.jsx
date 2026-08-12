import "../styles/review.css";

// Read-only star display (e.g. 4.3 -> filled/half/empty stars). Uses
// currentColor so it inherits the gold accent wherever it's placed.
export default function StarRating({ value = 0, size = 14, showValue = false }) {
  const rounded = Math.round(value * 2) / 2; // nearest half star

  return (
    <span className="star-rating" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span className="star-rating__stars">
        {[1, 2, 3, 4, 5].map((n) => {
          const fill = rounded >= n ? 1 : rounded >= n - 0.5 ? 0.5 : 0;
          return (
            <svg key={n} width={size} height={size} viewBox="0 0 20 20" style={{ marginRight: 1 }}>
              <defs>
                <linearGradient id={`star-fill-${n}-${value}`}>
                  <stop offset={`${fill * 100}%`} stopColor="currentColor" />
                  <stop offset={`${fill * 100}%`} stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.8L10 14.9l-5.21 2.74 1-5.8-4.21-4.1 5.82-.85L10 1.5z"
                fill={`url(#star-fill-${n}-${value})`}
                stroke="currentColor"
                strokeWidth="0.8"
              />
            </svg>
          );
        })}
      </span>
      {showValue && <span className="star-rating__value">{value.toFixed(1)}</span>}
    </span>
  );
}