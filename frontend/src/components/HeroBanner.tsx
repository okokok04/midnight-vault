import { ShieldIcon, SparklesIcon, LockIcon, LayersIcon, ArrowRightIcon } from "./Icons";

interface Props {
  activeTab: "midnight" | "survey" | "cardano" | "analytics" | "docs" | "about";
  setActiveTab: (tab: "midnight" | "survey" | "cardano" | "analytics" | "docs" | "about") => void;
}

export function HeroBanner({ setActiveTab }: Props) {
  return (
    <section className="hero-banner" data-testid="hero-banner">
      <div className="hero-badge">
        <span className="status-dot" />
        <span>Dual-Ledger Protocol Live on Preprod</span>
        <span className="hero-badge-pill">Cardano + Midnight ZK</span>
      </div>

      <h2 className="hero-title">
        Trustless Milestone Escrow &amp; <span className="hero-gradient-text">Zero-Knowledge Privacy</span>
      </h2>

      <p className="hero-subtitle">
        Eliminate counterparty risk in cross-border freelance work. Payments locked on-chain with signature-verified multi-sig on Cardano, paired with selective zero-knowledge disclosure and confidential reputation on Midnight.
      </p>

      <div className="hero-actions">
        <button
          className="primary hero-btn"
          onClick={() => setActiveTab("midnight")}
        >
          <SparklesIcon width="16" height="16" />
          <span>Launch Privacy Escrow</span>
          <ArrowRightIcon width="14" height="14" />
        </button>

        <button
          className="hero-btn hero-btn-secondary"
          onClick={() => setActiveTab("docs")}
        >
          <LayersIcon width="16" height="16" />
          <span>Read Protocol Specs</span>
        </button>

        <button
          className="hero-btn hero-btn-tertiary"
          onClick={() => setActiveTab("about")}
        >
          <ShieldIcon width="16" height="16" />
          <span>Security &amp; Privacy Model</span>
        </button>
      </div>

      {/* Feature Pillars */}
      <div className="hero-pillars">
        <div className="hero-pillar-item" onClick={() => setActiveTab("midnight")}>
          <div className="pillar-icon-wrapper">
            <LockIcon width="16" height="16" />
          </div>
          <div>
            <div className="pillar-title">Zero-Knowledge Proofs</div>
            <div className="pillar-desc">Private witness keys stay strictly in browser memory.</div>
          </div>
        </div>

        <div className="hero-pillar-item" onClick={() => setActiveTab("cardano")}>
          <div className="pillar-icon-wrapper">
            <ShieldIcon width="16" height="16" />
          </div>
          <div>
            <div className="pillar-title">100% Non-Custodial</div>
            <div className="pillar-desc">Enforced purely by Aiken Plutus V3 smart contract logic.</div>
          </div>
        </div>

        <div className="hero-pillar-item" onClick={() => setActiveTab("survey")}>
          <div className="pillar-icon-wrapper">
            <SparklesIcon width="16" height="16" />
          </div>
          <div>
            <div className="pillar-title">ZK Nullifier Reputation</div>
            <div className="pillar-desc">Verifiable 1-person-1-vote feedback with zero address linkage.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
