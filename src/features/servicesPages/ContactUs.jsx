import { useState } from "react";
import "./style/contactus.css";
// ⚠️ Adjust this import path to match where query.api.js actually lives
// in your project (same file used by the admin Queries page).
import { queryAPI } from "../query/services/query.api";

const FacetDivider = ({ className = "" }) => (
  <svg
    className={`klyra-facet-divider ${className}`}
    viewBox="0 0 220 10"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <polyline
      points="0,5 27,1 55,9 82,1 110,9 137,1 165,9 192,1 220,5"
      fill="none"
      stroke="var(--gold)"
      strokeWidth="1.4"
    />
  </svg>
);

const SUBJECTS = ["Order help", "Product question", "Custom piece", "Press / partnership", "Something else"];

const INITIAL_FORM = { name: "", email: "", subject: SUBJECTS[0], message: "" };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactUs() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Tell us your name";
    if (!form.email.trim()) next.email = "We need an email to reply to";
    else if (!emailPattern.test(form.email)) next.email = "That email doesn't look right";
    if (!form.message.trim()) next.message = "Add a message so we know how to help";
    else if (form.message.trim().length < 10) next.message = "A little more detail helps — a few more words?";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("sending");
    try {
      await queryAPI.submit(form);
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setErrors((er) => ({
        ...er,
        submit: err.response?.data?.message || "Couldn't send your message. Please try again.",
      }));
    }
  };

  const sendAnother = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus("idle");
  };

  return (
    <div className="klyra-contact">
      <section className="klyra-contact-hero">
        <p className="klyra-eyebrow">Get in Touch</p>
        <h1>We reply ourselves. No ticket numbers.</h1>
        <p className="klyra-contact-hero-sub">
          Question about an order, a piece, or something custom — write to us directly
          and someone from the studio will get back to you within a day.
        </p>
        <FacetDivider />
      </section>

      <section className="klyra-contact-grid">
        <div className="klyra-contact-form-card">
          {status === "sent" ? (
            <div className="klyra-contact-success klyra-fade-in">
              <p className="klyra-eyebrow">Message sent</p>
              <h2>Thank you, {form.name.split(" ")[0] || "friend"}.</h2>
              <p>We've got your message and will reply at {form.email} within a day.</p>
              <button type="button" className="klyra-ghost-btn" onClick={sendAnother}>
                Send another message
              </button>
            </div>
          ) : (
            <form className="klyra-contact-form" onSubmit={handleSubmit} noValidate>
              {errors.submit && <p className="klyra-form-error">{errors.submit}</p>}

              <div className="klyra-field-row">
                <label className="klyra-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <em>{errors.name}</em>}
                </label>

                <label className="klyra-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <em>{errors.email}</em>}
                </label>
              </div>

              <label className="klyra-field">
                <span>What's this about?</span>
                <select value={form.subject} onChange={handleChange("subject")}>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label className="klyra-field">
                <span>Message</span>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={handleChange("message")}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && <em>{errors.message}</em>}
              </label>

              <button type="submit" className="klyra-solid-btn" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>

        <div className="klyra-contact-info">
          <div>
            <p className="klyra-eyebrow gold">Studio</p>
            <p className="klyra-info-line">
              14 Ferozeshah Road
              <br />
              Mumbai, Maharashtra 400001
            </p>
          </div>

          <FacetDivider className="klyra-facet-divider-small" />

          <div>
            <p className="klyra-eyebrow gold">Reach us</p>
            <p className="klyra-info-line">
              <a href="mailto:hello@klyra.com">hello@klyra.com</a>
              <br />
              <a href="tel:+912212345678">+91 22 1234 5678</a>
            </p>
          </div>

          <FacetDivider className="klyra-facet-divider-small" />

          <div>
            <p className="klyra-eyebrow gold">Studio hours</p>
            <p className="klyra-info-line">
              Mon – Sat, 10am – 7pm IST
              <br />
              Closed Sundays
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}