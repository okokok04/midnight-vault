import { WalletConnect } from "./WalletConnect";
import type { WalletState } from "../hooks/useWallet";

interface Props {
  activeTab: "midnight" | "cardano" | "survey" | "analytics";
  setActiveTab?: (tab: "midnight" | "cardano" | "survey" | "analytics") => void;
  wallet: WalletState;
}

export function Navbar({ activeTab, wallet }: Props) {
  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-logo" aria-hidden="true">
          {activeTab === "midnight" ? "🌌" : activeTab === "cardano" ? "🛡️" : activeTab === "survey" ? "🗳️" : "📊"}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h1>StellarVault</h1>
            <span className="badge badge-midnight" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
              v0.3 ZK-Beta
            </span>
          </div>
          <p>
            Trustless milestone escrow on Cardano & Zero-Knowledge privacy protocol on Midnight Network.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <div className="network-pill">
          <span className="status-dot" aria-label="Network online" />
          <span>Preprod Live</span>
        </div>
        {activeTab === "cardano" && <WalletConnect wallet={wallet} />}
      </div>
    </header>
  );
}
