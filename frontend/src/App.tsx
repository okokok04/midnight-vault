import { useState } from "react";
import { EscrowForm } from "./components/EscrowForm";
import { EscrowList } from "./components/EscrowList";
import { FeedbackForm } from "./components/FeedbackForm";
import { FeedbackList } from "./components/FeedbackList";
import { StatsBar } from "./components/StatsBar";
import { WalletConnect } from "./components/WalletConnect";
import { MidnightEscrowPanel } from "./components/MidnightEscrowPanel";
import { useEscrows } from "./hooks/useEscrows";
import { useFeedback } from "./hooks/useFeedback";
import { useStats } from "./hooks/useStats";
import { useWallet } from "./hooks/useWallet";

export function App() {
  const [activeTab, setActiveTab] = useState<"cardano" | "midnight">("midnight");
  const wallet = useWallet();
  const {
    escrows,
    loading,
    error,
    createEscrow,
    releaseEscrow,
    refundEscrow,
    resolveEscrow,
  } = useEscrows();
  const {
    feedback,
    loading: feedbackLoading,
    submitFeedback,
    updateStatus,
    removeFeedback,
  } = useFeedback();
  const { stats, loading: statsLoading } = useStats();

  return (
    <>
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-logo" aria-hidden="true">
            {activeTab === "midnight" ? "🌌" : "🛡️"}
          </div>
          <div>
            <h1>StellarVault</h1>
            <p>
              Trustless milestone escrow for freelance work on Cardano Preprod &
              privacy-preserving Compact ZK DApp on Midnight Network.
            </p>
          </div>
        </div>
        {activeTab === "cardano" && <WalletConnect wallet={wallet} />}
      </header>

      {/* Network / DApp Navigation Tabs */}
      <nav className="nav-tabs" aria-label="Network DApp Tabs">
        <button
          className={`nav-tab-button ${activeTab === "midnight" ? "active" : ""}`}
          onClick={() => setActiveTab("midnight")}
        >
          <span>🌌</span> Midnight Privacy Escrow (Compact ZK)
        </button>
        <button
          className={`nav-tab-button ${activeTab === "cardano" ? "active" : ""}`}
          onClick={() => setActiveTab("cardano")}
        >
          <span>🔵</span> Cardano Preprod Escrow (Aiken)
        </button>
      </nav>

      <main>
        {activeTab === "midnight" ? (
          <MidnightEscrowPanel />
        ) : (
          <>
            <StatsBar stats={stats} loading={statsLoading} />

            {error && <div className="error-banner" role="alert">{error}</div>}

            <EscrowForm
              onCreate={createEscrow}
              defaultBuyerAddress={wallet.address ?? undefined}
            />

            <section style={{ marginTop: "2.5rem" }}>
              <h2 className="section-title">
                <span>📋</span> Active Milestone Escrows
              </h2>
              <EscrowList
                escrows={escrows}
                loading={loading}
                onRelease={releaseEscrow}
                onRefund={refundEscrow}
                onResolve={resolveEscrow}
              />
            </section>

            <section style={{ marginTop: "2.5rem" }}>
              <FeedbackForm onSubmit={submitFeedback} />
            </section>

            <section style={{ marginTop: "2.5rem" }}>
              <h2 className="section-title">
                <span>💬</span> Recent Community Feedback
              </h2>
              <FeedbackList
                feedback={feedback}
                loading={feedbackLoading}
                onUpdateStatus={updateStatus}
                onRemove={removeFeedback}
              />
            </section>
          </>
        )}
      </main>

      <footer style={{ marginTop: "4rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
        <div>
          StellarVault Protocol © 2026 — Built with <a href="https://midnight.network" target="_blank" rel="noreferrer">Midnight Compact</a> & <a href="https://aiken-lang.org" target="_blank" rel="noreferrer">Aiken</a>
        </div>
        <div style={{ display: "flex", gap: "1.2rem" }}>
          <a href="https://github.com/okokok04/stellarvault" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://x.com/manh71546" target="_blank" rel="noreferrer">X (Twitter)</a>
          <a href="https://indexer.preprod.midnight.network" target="_blank" rel="noreferrer">Midnight Indexer</a>
        </div>
      </footer>
    </>
  );
}
