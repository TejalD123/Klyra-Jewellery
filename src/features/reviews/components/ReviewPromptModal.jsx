import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getReviewEligibility, submitReview } from "../services/reviews.api"; // ⚠️ adjust path if different
import "../styles/reviewprompt.css";

const StarPicker = ({ value, onChange }) => (
  <div className="review-prompt__stars">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        className={`review-prompt__star ${n <= value ? "is-filled" : ""}`}
        onClick={() => onChange(n)}
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
      >
        ★
      </button>
    ))}
  </div>
);

// item = one order item: { product, name, image, ... } from order.items
// onClose = user dismissed without submitting ("Maybe Later" / blocked state / already reviewed)
// onSubmitted = review posted successfully
// onProductClick = optional — reuse the page's existing product-navigation logic
export default function ReviewPromptModal({ item, onClose, onSubmitted, onProductClick }) {
  const [checking, setChecking] = useState(true);
  // null while checking; otherwise { canReview, hasPurchased, alreadyReviewed } or { canReview:false, failed:true }
  const [eligibility, setEligibility] = useState(null);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // item.product can be a plain string ID or a populated object depending
  // on how the order API returns it — normalize once so eligibility check
  // and submit always send a real ID, never a stringified object.
  const productId = typeof item?.product === "string" ? item.product : item?.product?._id;

  // Confirm eligibility fresh (covers the case where they already reviewed
  // this item through the product page directly, in another tab, etc.)
  useEffect(() => {
    let cancelled = false;

    if (!productId) {
      // eslint-disable-next-line no-console
      console.error("ReviewPromptModal: no product id found on item", item);
      setChecking(false);
      setEligibility({ canReview: false, noProductId: true });
      return;
    }

    setChecking(true);
    getReviewEligibility(productId)
      .then((res) => {
        if (cancelled) return;
        setEligibility(res.data?.data || { canReview: false });
      })
      .catch((err) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error("ReviewPromptModal: eligibility check failed", err);
        setEligibility({ canReview: false, failed: true });
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Naav takा");
    if (rating < 1) return setError("Rating निवडा");

    setSubmitting(true);
    try {
      await submitReview(productId, { name, rating, comment });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Review submit nahi zala");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Checking state — visible spinner instead of a blank/invisible gap =====
  if (checking) {
    return (
      <div className="review-prompt-overlay">
        <div className="review-prompt-card">
          <button type="button" className="review-prompt__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
          <p className="review-prompt__eyebrow">Checking…</p>
          <h2 className="review-prompt__title">One second</h2>
        </div>
      </div>
    );
  }

  // ===== Not eligible — show WHY instead of vanishing silently =====
  if (!eligibility?.canReview) {
    const message = eligibility?.alreadyReviewed
      ? "You've already reviewed this product — thank you!"
      : eligibility?.failed
      ? "Couldn't check review eligibility right now. Please try again in a bit."
      : eligibility?.hasPurchased === false
      ? "Only customers who've purchased this product can leave a review."
      : eligibility?.noProductId
      ? "This item isn't linked to a reviewable product."
      : "You can't review this product right now.";

    return (
      <div className="review-prompt-overlay">
        <div className="review-prompt-card">
          <button type="button" className="review-prompt__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
          <p className="review-prompt__eyebrow">Your order was delivered</p>
          <h2 className="review-prompt__title">How was it?</h2>
          <p className="review-prompt__error">{message}</p>
          <div className="review-prompt__actions">
            <button type="button" className="review-prompt__skip" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-prompt-overlay">
      <div className="review-prompt-card">
        <button type="button" className="review-prompt__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <p className="review-prompt__eyebrow">Your order was delivered</p>
        <h2 className="review-prompt__title">How was it?</h2>

        <button
          type="button"
          className="review-prompt__product"
          onClick={() => onProductClick?.(item)}
        >
          <div className="review-prompt__product-thumb">
            {item.image && <img src={item.image} alt={item.name} />}
          </div>
          <span className="review-prompt__product-name">{item.name}</span>
        </button>

        <form onSubmit={handleSubmit} className="review-prompt__form">
          {error && <p className="review-prompt__error">{error}</p>}

          <div className="review-prompt__row">
            <label>Your Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya S." />
          </div>

          <div className="review-prompt__row">
            <label>Rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div className="review-prompt__row">
            <label>Review (optional)</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this piece…"
            />
          </div>

          <div className="review-prompt__actions">
            <button type="button" className="review-prompt__skip" onClick={onClose}>
              Maybe Later
            </button>
            <button type="submit" className="review-prompt__submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}