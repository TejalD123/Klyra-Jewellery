import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getProductReviews, getReviewEligibility, submitReview } from "../services/reviews.api";
import StarRating from "./StarRating"; // adjust path if this lives elsewhere
import "../styles/review.css";

const StarPicker = ({ value, onChange }) => (
  <div className="review-form__stars">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        className={`review-form__star ${n <= value ? "is-filled" : ""}`}
        onClick={() => onChange(n)}
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
      >
        ★
      </button>
    ))}
  </div>
);

export default function ReviewsSection({ productId }) {
  const isLoggedIn = useSelector((s) => !!s.auth?.token);

  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [eligibility, setEligibility] = useState(null); // { canReview, hasPurchased, alreadyReviewed }
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadReviews = (page = 1) => {
    setLoading(true);
    getProductReviews(productId, { page, limit: 10 })
      .then((res) => {
        setReviews(res.data.data.reviews);
        setPagination(res.data.data.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!isLoggedIn) {
      setEligibility(null);
      return;
    }
    getReviewEligibility(productId)
      .then((res) => setEligibility(res.data.data))
      .catch(() => setEligibility(null));
  }, [productId, isLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) return setFormError("Naav takा");
    if (rating < 1) return setFormError("Rating निवडा");

    setSubmitting(true);
    try {
      await submitReview(productId, { name, rating, comment });
      setShowForm(false);
      setName("");
      setRating(0);
      setComment("");
      setEligibility((e) => ({ ...e, canReview: false, alreadyReviewed: true }));
      loadReviews(1);
    } catch (err) {
      setFormError(err.response?.data?.message || "Review submit nahi zala");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="reviews-section">
      <div className="reviews-section__header">
        <h2 className="reviews-section__heading">
          Customer Reviews {pagination.total > 0 && `(${pagination.total})`}
        </h2>

        {isLoggedIn && eligibility?.canReview && !showForm && (
          <button className="reviews-section__write-btn" onClick={() => setShowForm(true)}>
            Write a Review
          </button>
        )}
      </div>

      {isLoggedIn && eligibility && !eligibility.hasPurchased && (
        <p className="reviews-section__hint">
          Only customers who've purchased this product can leave a review.
        </p>
      )}
      {isLoggedIn && eligibility?.alreadyReviewed && (
        <p className="reviews-section__hint">You've already reviewed this product — thank you!</p>
      )}

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          {formError && <p className="review-form__error">{formError}</p>}
          <div className="review-form__row">
            <label>Your Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya S." />
          </div>
          <div className="review-form__row">
            <label>Rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div className="review-form__row">
            <label>Review</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this piece…"
            />
          </div>
          <div className="review-form__actions">
            <button type="button" className="review-form__cancel" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="review-form__submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="reviews-section__hint">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="reviews-section__empty">No reviews yet — be the first to share your experience.</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((r) => (
            <div key={r._id} className="review-item">
              <div className="review-item__top">
                <span className="review-item__name" data-initial={r.name?.[0]?.toUpperCase() || "?"}>
                  {r.name}
                </span>
                <StarRating value={r.rating} size={13} />
              </div>
              {r.comment && <p className="review-item__comment">{r.comment}</p>}
              <span className="review-item__date">
                {new Date(r.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="reviews-section__pagination">
          <button disabled={pagination.page <= 1} onClick={() => loadReviews(pagination.page - 1)}>
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => loadReviews(pagination.page + 1)}>
            Next
          </button>
        </div>
      )}
    </section>
  );
}