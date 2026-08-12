import { Gem, ShieldCheck, PackageCheck } from "lucide-react";
import "./style/aboutus.css";

// Thin gold zigzag — the page's recurring signature divider, standing in
// for a gem's facet edge. Reused between every section.
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

const CRAFT_STEPS = [
  {
    n: "01",
    title: "Design",
    text: "Every piece starts as a sketch, then a hand-carved wax model, refined until the proportions feel inevitable rather than added.",
  },
  {
    n: "02",
    title: "Cast & Set",
    text: "Metal is cast in small batches and stones are set by hand under magnification, one prong at a time.",
  },
  {
    n: "03",
    title: "Polish & Inspect",
    text: "Each piece is polished, measured, and checked against its original design before it ever reaches a box.",
  },
];

const VALUES = [
  {
    icon: PackageCheck,
    title: "Made to last",
    text: "Solid metals and responsibly sourced stones, built for decades, not seasons.",
  },
  {
    icon: ShieldCheck,
    title: "Honest pricing",
    text: "No inflated markups for a name — you pay for material and craft, not marketing.",
  },
  {
    icon: Gem,
    title: "Small batches",
    text: "We'd rather make less and make it well than chase volume.",
  },
];

const MILESTONES = [
  { year: "2019", text: "Klyra begins as a single bench in a two-room workshop." },
  { year: "2021", text: "First collection sells out in nine days, entirely by word of mouth." },
  { year: "2023", text: "We open our own casting studio to keep every step in-house." },
  { year: "2026", text: "Still hand-finishing every piece we ship." },
];

export default function AboutUs() {
  return (
    <div className="klyra-about">
      <section className="klyra-hero">
        <p className="klyra-eyebrow">The Klyra Story</p>
        <h1>
          Jewelry that's built,
          <br />
          not just bought.
        </h1>
        <p className="klyra-hero-sub">
          We're a small studio that designs, casts, and finishes every piece by hand —
          because a ring you'll wear for thirty years deserves more than a mold and a rush order.
        </p>
        <FacetDivider />
      </section>

      <section className="klyra-story">
        <div className="klyra-story-text klyra-fade-in">
          <p className="klyra-eyebrow">Our Story</p>
          <h2>Started at a workbench, not a boardroom.</h2>
          <p>
            Klyra began with one goldsmith, one bench, and a frustration with how most
            fine jewelry gets made — outsourced, marked up, and designed for a catalog
            photo rather than a life. We set out to do the opposite: keep the work close,
            keep the pricing honest, and keep every piece something we'd wear ourselves.
          </p>
          <p>
            Today the studio has grown, but the process hasn't changed. Every design is
            still sketched by hand. Every stone is still set under a loupe. We just have
            better tools for it now.
          </p>
        </div>
        <div className="klyra-story-frame klyra-fade-in" role="img" aria-label="Portrait of the Klyra workshop">
          <span className="klyra-story-corner klyra-story-corner--tl" aria-hidden="true" />
          <span className="klyra-story-corner klyra-story-corner--br" aria-hidden="true" />
          <div className="klyra-story-image" />
        </div>
      </section>

      <FacetDivider className="klyra-section-divider" />

      <section className="klyra-craft">
        <p className="klyra-eyebrow center">How It's Made</p>
        <h2 className="center">Three steps, no shortcuts.</h2>
        <div className="klyra-craft-grid">
          {CRAFT_STEPS.map((step) => (
            <div key={step.n} className="klyra-craft-card">
              <span className="klyra-craft-num">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="klyra-values">
        <p className="klyra-eyebrow center">What We Won't Compromise On</p>
        <div className="klyra-values-grid">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="klyra-value-card">
                <span className="klyra-value-icon">
                  <Icon size={18} strokeWidth={1.6} />
                </span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <FacetDivider className="klyra-section-divider" />

      <section className="klyra-timeline">
        <p className="klyra-eyebrow center">Along the Way</p>
        <div className="klyra-timeline-track">
          {MILESTONES.map((m, i) => (
            <div
              key={m.year}
              className={`klyra-timeline-item ${i === MILESTONES.length - 1 ? "is-current" : ""}`}
            >
              <span className="klyra-timeline-year">{m.year}</span>
              <span className="klyra-timeline-dot" />
              <p>{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="klyra-cta">
        <h2>See what we've been making.</h2>
        <p>Every piece in the shop was designed and finished by the same small team.</p>
        <a href="/products" className="klyra-cta-btn">
          Shop the Collection
        </a>
      </section>
    </div>
  );
}