import { ShieldIcon, ExternalLinkIcon, SparklesIcon, VoteIcon, BarChartIcon, LayersIcon } from "./Icons";

interface Props {
  setActiveTab: (tab: "midnight" | "survey" | "cardano" | "analytics" | "docs" | "about") => void;
}

export function Footer({ setActiveTab }: Props) {
  return (
    <footer className="master-footer" data-testid="master-footer">
      <div className="footer-top-grid">
        {/* Column 1: Brand & Overview */}
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <div className="brand-logo footer-logo">
              <ShieldIcon width="20" height="20" />
            </div>
            <div>
              <div className="brand-title" style={{ fontSize: "1.2rem", color: "#ffffff" }}>StellarVault Protocol</div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-dim)" }}>Protocol v0.3 • ZK-Beta</div>
            </div>
          </div>
          <p className="footer-desc">
            Trustless milestone escrow on Cardano paired with Zero-Knowledge selective disclosure on Midnight Network.
          </p>
          <div className="network-pill" style={{ display: "inline-flex", marginTop: "0.85rem" }}>
            <span className="status-dot" />
            <span>Cardano &amp; Midnight Preprod</span>
          </div>
        </div>

        {/* Column 2: Protocol dApps */}
        <div className="footer-col">
          <div className="footer-heading">Protocol dApps</div>
          <ul className="footer-links">
            <li>
              <button type="button" onClick={() => setActiveTab("midnight")} className="footer-nav-link">
                <SparklesIcon width="14" height="14" />
                <span>Compact Privacy Escrow</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setActiveTab("survey")} className="footer-nav-link">
                <VoteIcon width="14" height="14" />
                <span>ZK Anonymous Survey</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setActiveTab("cardano")} className="footer-nav-link">
                <ShieldIcon width="14" height="14" />
                <span>Cardano Aiken Escrow</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setActiveTab("analytics")} className="footer-nav-link">
                <BarChartIcon width="14" height="14" />
                <span>Protocol Analytics</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Documentation & Specs */}
        <div className="footer-col">
          <div className="footer-heading">Developers &amp; Specs</div>
          <ul className="footer-links">
            <li>
              <button type="button" onClick={() => setActiveTab("docs")} className="footer-nav-link">
                <LayersIcon width="14" height="14" />
                <span>Documentation Hub</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setActiveTab("about")} className="footer-nav-link">
                <ShieldIcon width="14" height="14" />
                <span>Security &amp; Privacy Model</span>
              </button>
            </li>
            <li>
              <a href="https://github.com/okokok04/stellarvault" target="_blank" rel="noreferrer" className="footer-nav-link">
                <span>GitHub Repository</span>
                <ExternalLinkIcon width="12" height="12" />
              </a>
            </li>
            <li>
              <a href="https://docs.midnight.network" target="_blank" rel="noreferrer" className="footer-nav-link">
                <span>Midnight Network Docs</span>
                <ExternalLinkIcon width="12" height="12" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Explorers & Networks */}
        <div className="footer-col">
          <div className="footer-heading">Explorers &amp; Tools</div>
          <ul className="footer-links">
            <li>
              <a href="https://indexer.preprod.midnight.network" target="_blank" rel="noreferrer" className="footer-nav-link">
                <span>Midnight Indexer</span>
                <ExternalLinkIcon width="12" height="12" />
              </a>
            </li>
            <li>
              <a href="https://preprod.cardanoscan.io" target="_blank" rel="noreferrer" className="footer-nav-link">
                <span>Cardanoscan Preprod</span>
                <ExternalLinkIcon width="12" height="12" />
              </a>
            </li>
            <li>
              <a href="https://x.com/manh71546" target="_blank" rel="noreferrer" className="footer-nav-link">
                <span>X / Twitter Community</span>
                <ExternalLinkIcon width="12" height="12" />
              </a>
            </li>
            <li>
              <a href="https://midnight-tmnight-preprod.nethermind.dev/" target="_blank" rel="noreferrer" className="footer-nav-link">
                <span>Midnight tNIGHT Faucet</span>
                <ExternalLinkIcon width="12" height="12" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>© 2026 StellarVault Protocol</span>
          <span>•</span>
          <span style={{ color: "var(--text-dim)" }}>Open Source MIT License</span>
        </div>

        <div className="footer-socials">
          <a href="https://github.com/okokok04/stellarvault" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://x.com/manh71546" target="_blank" rel="noreferrer">
            Twitter
          </a>
          <button type="button" onClick={() => setActiveTab("docs")} style={{ background: "none", border: "none", color: "var(--text-muted)", padding: 0, fontSize: "inherit" }}>
            Documentation
          </button>
        </div>
      </div>
    </footer>
  );
}
