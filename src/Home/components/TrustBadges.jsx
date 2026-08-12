import { Gem, ShieldCheck, Truck, Award } from "lucide-react";
import "../styles/TrustBadges.css";

const BADGES = [
  { icon: Gem, title: "Certified Diamonds", subtitle: "100% Authentic" },
  { icon: Award, title: "BIS Hallmarked", subtitle: "Assured Quality" },
  { icon: ShieldCheck, title: "Secure Payment", subtitle: "100% Protected" },
  { icon: Truck, title: "Free Delivery", subtitle: "Orders Above ₹4999" },
];

const TrustBadges = () => (
  <section className="trust">
    {/* ---- Desktop / tablet: static grid with a gold 4-side border box ---- */}
    <div className="trust__grid">
      {BADGES.map(({ icon: Icon, title, subtitle }) => (
        <div key={title} className="trust__item">
          <Icon size={26} strokeWidth={1.2} className="trust__icon" />
          <div>
            <p className="trust__title">{title}</p>
            <p className="trust__subtitle">{subtitle}</p>
          </div>
        </div>
      ))}
    </div>

    {/* ---- Mobile: continuous train-style marquee — badges scroll left
        in an unbroken loop. The list is duplicated back-to-back; the
        track animates exactly -50% (one full copy's width) then snaps
        back to 0, which is invisible mid-loop since copy #2 is
        identical to copy #1 sitting right where it started. ---- */}
    <div className="trust__marquee">
      <div className="trust__marquee-track">
        {[...BADGES, ...BADGES].map(({ icon: Icon, title, subtitle }, i) => (
          <div key={`${title}-${i}`} className="trust__marquee-item">
            <Icon size={20} strokeWidth={1.2} className="trust__icon" />
            <div>
              <p className="trust__title">{title}</p>
              <p className="trust__subtitle">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBadges;