import { useState } from "react";
import { EscrowForm } from "./components/EscrowForm";
import { EscrowList } from "./components/EscrowList";
import { FeedbackForm } from "./components/FeedbackForm";
import { FeedbackList } from "./components/FeedbackList";
import { StatsBar } from "./components/StatsBar";
import { Navbar } from "./components/Navbar";
import { MidnightEscrowPanel } from "./components/MidnightEscrowPanel";
import { MidnightFeedbackPanel } from "./components/MidnightFeedbackPanel";
import { ProtocolAnalytics } from "./components/ProtocolAnalytics";
import { useEscrows } from "./hooks/useEscrows";
import { useFeedback } from "./hooks/useFeedback";
import { useStats } from "./hooks/useStats";
import { useWallet } from "./hooks/useWallet";

export function App() {
  const [activeTab, setActiveTab] = useState<"midnight" | "survey" | "cardano" | "analytics">("midnight");
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
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} wallet={wallet} />

      {/* Luxury Web3 Tab Navigation */}
      <nav className="nav-tabs" aria-label="Network DApp Tabs">
        <button
          className={`nav-tab-button ${activeTab === "midnight" ? "active" : ""}`}
          onClick={() => setActiveTab("midnight")}
        >
          <span>🌌</span> Midnight Privacy Escrow (Compact ZK)
        </button>

        <button
          className={`nav-tab-button ${activeTab === "survey" ? "active" : ""}`}
          onClick={() => setActiveTab("survey")}
        >
          <span>🗳️</span> Anonymous ZK Survey
        </button>

        <button
          className={`nav-tab-button ${activeTab === "cardano" ? "active" : ""}`}
          onClick={() => setActiveTab("cardano")}
        >
          <span>🔵</span> Cardano Preprod Escrow (Aiken)
        </button>

        <button
          className={`nav-tab-button ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <span>📊</span> Protocol Analytics & Activity
        </button>
      </nav>

      <main>
        {activeTab === "midnight" && <MidnightEscrowPanel />}

        {activeTab === "survey" && <MidnightFeedbackPanel />}

        {activeTab === "analytics" && (
          <ProtocolAnalytics
            stats={stats}
            loading={statsLoading}
            feedback={feedback}
            feedbackLoading={feedbackLoading}
            onUpdateStatus={updateStatus}
            onRemove={removeFeedback}
          />
        )}

        {activeTab === "cardano" && (
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
                <span>💬</span> Recent Feedback
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

      <footer style={{ marginTop: "4.5rem", paddingTop: "1.75rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.25rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>🛡️</span>
          <span>StellarVault Protocol © 2026 — Multi-chain Zero-Knowledge & Multisig Milestone Escrow</span>
        </div>
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          <a href="https://github.com/okokok04/stellarvault" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://x.com/manh71546" target="_blank" rel="noreferrer">X (Twitter)</a>
          <a href="https://indexer.preprod.midnight.network" target="_blank" rel="noreferrer">Midnight Explorer</a>
          <a href="https://preprod.cardanoscan.io" target="_blank" rel="noreferrer">Cardanoscan</a>
        </div>
      </footer>
    </>
  );
}
