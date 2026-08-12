import { useState } from "react";
import { Mail } from "lucide-react";
import "../styles/Newsletter.css";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <section className="newsletter">
      <div className="newsletter__inner">
        <div className="newsletter__info">
          <div className="newsletter__icon-circle">
            <Mail size={17} strokeWidth={1.5} />
          </div>
          <div>
            <p className="newsletter__title">Join Our World of Elegance</p>
            <p className="newsletter__subtitle">Subscribe for special offers, new arrivals, and styling tips.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="newsletter__form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="newsletter__input"
          />
          <button type="submit" className="newsletter__submit">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
