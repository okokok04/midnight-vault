import { ShieldIcon, LockIcon, SparklesIcon, LayersIcon } from "./Icons";

export function AboutView() {
  return (
    <div className="about-container" data-testid="about-view">
      {/* About Header */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="badge badge-midnight" style={{ marginBottom: "0.5rem" }}>About StellarVault Protocol</span>
            <h2 style={{ margin: 0, fontSize: "1.45rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <ShieldIcon width="22" height="22" />
              <span>Decentralized Trust for Global Remote Work</span>
            </h2>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>
              The first non-custodial milestone escrow and Zero-Knowledge anonymous reputation protocol engineered for the next era of global freelance collaboration.
            </p>
          </div>
        </div>
      </div>

      <div className="about-grid">
        {/* Mission & Problem */}
        <div className="card">
          <h3 className="section-title">
            <SparklesIcon width="20" height="20" />
            <span>The Cross-Border Trust Dilemma</span>
          </h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Traditional freelance platforms charge 10–20% intermediary fees, retain arbitrary custody of funds, and leave users vulnerable to unilateral account freezes. Furthermore, public blockchain alternatives leak private financial transactions, client counterparties, and work history.
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, marginTop: "0.75rem" }}>
            <strong>StellarVault solves this natively:</strong> funds are custodied solely by mathematically verified smart contracts, and reputation is established anonymously through Zero-Knowledge nullifiers without disclosing sensitive business relationships.
          </p>
        </div>

        {/* Security & Threat Model */}
        <div className="card">
          <h3 className="section-title">
            <LockIcon width="20" height="20" />
            <span>Cryptographic Security &amp; Audit Model</span>
          </h3>
          <ul className="about-list">
            <li>
              <strong>Non-Custodial Invariant:</strong> Neither the frontend nor the backend server can ever withdraw or redirect locked escrow funds.
            </li>
            <li>
              <strong>Double-Spend Prevention:</strong> Strict UTxO consuming logic in Aiken and state transitions in Compact prevent multiple settlements.
            </li>
            <li>
              <strong>Arbitration Safety Valve:</strong> Named arbiters cannot seize funds for themselves; they can only direct payment to either the buyer or seller.
            </li>
            <li>
              <strong>Zero Leakage Witness:</strong> Participant secrets and private keys never leave local browser memory.
            </li>
          </ul>
        </div>
      </div>

      {/* Protocol Roadmap */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h3 className="section-title">
          <LayersIcon width="20" height="20" />
          <span>Protocol Roadmap &amp; Evolution</span>
        </h3>

        <div className="roadmap-grid">
          <div className="roadmap-card completed">
            <div className="roadmap-badge">Phase 1 • Live</div>
            <div className="roadmap-title">Preprod Launch &amp; Aiken Validator</div>
            <p className="roadmap-desc">Plutus V3 milestone validator on Cardano Preprod, Express REST API, and CIP-30 wallet integration.</p>
          </div>

          <div className="roadmap-card completed">
            <div className="roadmap-badge">Phase 2 • Live</div>
            <div className="roadmap-title">Midnight Compact ZK Engine</div>
            <p className="roadmap-desc">Privacy-preserving milestone escrow in Compact, Lace DApp Connector, and ZK nullifier anonymous survey.</p>
          </div>

          <div className="roadmap-card in-progress">
            <div className="roadmap-badge in-progress-badge">Phase 3 • In Progress</div>
            <div className="roadmap-title">Multi-Milestone Streaming</div>
            <p className="roadmap-desc">Sequential milestone schedules, automatic streaming releases, and decentralized arbitration DAO voting.</p>
          </div>

          <div className="roadmap-card planned">
            <div className="roadmap-badge planned-badge">Phase 4 • Planned</div>
            <div className="roadmap-title">Mainnet &amp; Cross-Chain Bridge</div>
            <p className="roadmap-desc">Mainnet rollout on Cardano and Midnight with zero-knowledge cross-chain state verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
