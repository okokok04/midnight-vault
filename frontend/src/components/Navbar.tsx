import { WalletConnect } from "./WalletConnect";
import { ShieldIcon, SparklesIcon, VoteIcon, BarChartIcon, LayersIcon } from "./Icons";
import type { WalletState } from "../hooks/useWallet";

interface Props {
  activeTab: "midnight" | "cardano" | "survey" | "analytics" | "docs" | "about";
  setActiveTab: (tab: "midnight" | "cardano" | "survey" | "analytics" | "docs" | "about") => void;
  wallet: WalletState;
}

export function Navbar({ activeTab, setActiveTab, wallet }: Props) {
  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div
          className="brand-logo"
          aria-hidden="true"
          onClick={() => setActiveTab("midnight")}
          style={{ cursor: "pointer" }}
        >
          {activeTab === "midnight" ? (
            <SparklesIcon width="24" height="24" />
          ) : activeTab === "cardano" ? (
            <ShieldIcon width="24" height="24" />
          ) : activeTab === "survey" ? (
            <VoteIcon width="24" height="24" />
          ) : activeTab === "analytics" ? (
            <BarChartIcon width="24" height="24" />
          ) : (
            <LayersIcon width="24" height="24" />
          )}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h1
              onClick={() => setActiveTab("midnight")}
              style={{ cursor: "pointer" }}
            >
              MidnightVault
            </h1>
            <span className="badge badge-midnight" style={{ fontSize: "0.68rem", padding: "0.15rem 0.5rem" }}>
              v1.0 ZK-Beta
            </span>
          </div>
          <p>
            Zero-Knowledge privacy escrow &amp; confidential survey protocol on Midnight Network.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        {/* Quick Nav shortcuts */}
        <div className="navbar-quick-links">
          <button
            type="button"
            className={`nav-link-btn ${activeTab === "docs" ? "active" : ""}`}
            onClick={() => setActiveTab("docs")}
          >
            Docs
          </button>
          <button
            type="button"
            className={`nav-link-btn ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>
        </div>

        <div className="network-pill">
          <span className="status-dot" aria-label="Network online" />
          <span>Preprod Live</span>
        </div>
        {activeTab === "cardano" && <WalletConnect wallet={wallet} />}
      </div>
    </header>
  );
}
