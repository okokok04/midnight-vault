import { ShieldIcon, SparklesIcon, LockIcon, LayersIcon, ArrowRightIcon } from "./Icons";

interface Props {
  activeTab: "midnight" | "survey" | "cardano" | "analytics" | "docs" | "about";
  setActiveTab: (tab: "midnight" | "survey" | "cardano" | "analytics" | "docs" | "about") => void;
}

export function HeroBanner({ setActiveTab }: Props) {
  return (
    <section className="hero-banner" data-testid="hero-banner">
      <div className="hero-header-row">
        <div className="hero-title-group">
          <div className="hero-badge">
            <span className="status-dot" />
            <span>Dual-Ledger Protocol Live</span>
            <span className="hero-badge-pill">Cardano Aiken + Midnight ZK</span>
          </div>

          <h2 className="hero-title">
            Trustless Milestone Escrow &amp; <span className="hero-gradient-text">Zero-Knowledge Privacy</span>
          </h2>

          <p className="hero-subtitle">
            Non-custodial freelance &amp; milestone settlement on Cardano with off-chain Zero-Knowledge witness proofs on Midnight Network.
          </p>
        </div>

        <div className="hero-actions">
          <button
            className="primary hero-btn"
            onClick={() => setActiveTab("midnight")}
          >
            <SparklesIcon width="14" height="14" />
            <span>Launch ZK Escrow</span>
            <ArrowRightIcon width="12" height="12" />
          </button>

          <button
            className="secondary-btn hero-btn"
            onClick={() => setActiveTab("docs")}
          >
            <LayersIcon width="14" height="14" />
            <span>Protocol Specs</span>
          </button>

          <button
            className="secondary-btn hero-btn"
            onClick={() => setActiveTab("about")}
          >
            <ShieldIcon width="14" height="14" />
            <span>Security</span>
          </button>
        </div>
      </div>

      {/* Feature Command Strip */}
      <div className="hero-pillars">
        <div className="hero-pillar-item" onClick={() => setActiveTab("midnight")}>
          <div className="pillar-icon-wrapper">
            <LockIcon width="14" height="14" />
          </div>
          <div>
            <div className="pillar-title">Client-Side ZK Witness</div>
            <div className="pillar-desc">Private keys never leave browser memory.</div>
          </div>
        </div>

        <div className="hero-pillar-item" onClick={() => setActiveTab("cardano")}>
          <div className="pillar-icon-wrapper">
            <ShieldIcon width="14" height="14" />
          </div>
          <div>
            <div className="pillar-title">100% Non-Custodial</div>
            <div className="pillar-desc">Aiken Plutus V3 multi-signature verification.</div>
          </div>
        </div>

        <div className="hero-pillar-item" onClick={() => setActiveTab("survey")}>
          <div className="pillar-icon-wrapper">
            <SparklesIcon width="14" height="14" />
          </div>
          <div>
            <div className="pillar-title">ZK Nullifiers</div>
            <div className="pillar-desc">Sybil-resistant anonymous rating protocol.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
