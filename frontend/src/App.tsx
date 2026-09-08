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
        <div>
          <h1>StellarVault</h1>
          <p>
            Trustless milestone escrow for freelance work on Cardano Preprod &
            privacy-preserving Compact ZK DApp on Midnight Network.
          </p>
        </div>
        {activeTab === "cardano" && <WalletConnect wallet={wallet} />}
      </header>

      {/* Network / DApp Navigation Tabs */}
      <nav className="nav-tabs" aria-label="Network DApp Tabs">
        <button
          className={`nav-tab-button ${activeTab === "midnight" ? "active" : ""}`}
          onClick={() => setActiveTab("midnight")}
        >
          🌌 Midnight Privacy Escrow (Compact ZK)
        </button>
        <button
          className={`nav-tab-button ${activeTab === "cardano" ? "active" : ""}`}
          onClick={() => setActiveTab("cardano")}
        >
          🔵 Cardano Preprod Escrow (Aiken)
        </button>
      </nav>

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

          <section style={{ marginTop: "2rem" }}>
            <h2 className="section-title">Escrows</h2>
            <EscrowList
              escrows={escrows}
              loading={loading}
              onRelease={releaseEscrow}
              onRefund={refundEscrow}
              onResolve={resolveEscrow}
            />
          </section>

          <section style={{ marginTop: "2rem" }}>
            <FeedbackForm onSubmit={submitFeedback} />
          </section>

          <section style={{ marginTop: "2rem" }}>
            <h2 className="section-title">Recent feedback</h2>
            <FeedbackList
              feedback={feedback}
              loading={feedbackLoading}
              onUpdateStatus={updateStatus}
              onRemove={removeFeedback}
            />
          </section>
        </>
      )}
    </>
  );
}
