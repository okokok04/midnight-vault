import { useState } from "react";
import { EscrowForm } from "./components/EscrowForm";
import { EscrowList } from "./components/EscrowList";
import { FeedbackForm } from "./components/FeedbackForm";
import { FeedbackList } from "./components/FeedbackList";
import { StatsBar } from "./components/StatsBar";
import { Navbar } from "./components/Navbar";
import { HeroBanner } from "./components/HeroBanner";
import { MidnightEscrowPanel } from "./components/MidnightEscrowPanel";
import { MidnightFeedbackPanel } from "./components/MidnightFeedbackPanel";
import { ProtocolAnalytics } from "./components/ProtocolAnalytics";
import { DocsView } from "./components/DocsView";
import { AboutView } from "./components/AboutView";
import { Footer } from "./components/Footer";
import { SparklesIcon, VoteIcon, ShieldIcon, BarChartIcon, LayersIcon } from "./components/Icons";
import { useEscrows } from "./hooks/useEscrows";
import { useFeedback } from "./hooks/useFeedback";
import { useStats } from "./hooks/useStats";
import { useWallet } from "./hooks/useWallet";

export function App() {
  const [activeTab, setActiveTab] = useState<"midnight" | "survey" | "cardano" | "analytics" | "docs" | "about">("midnight");
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

      {/* Master Hero Banner (shown on main interactive tabs) */}
      {(activeTab === "midnight" || activeTab === "cardano") && (
        <HeroBanner activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Segmented Master Navigation Tabs */}
      <nav className="nav-tabs" aria-label="Network DApp Tabs">
        <button
          className={`nav-tab-button ${activeTab === "midnight" ? "active" : ""}`}
          onClick={() => setActiveTab("midnight")}
        >
          <SparklesIcon width="16" height="16" />
          <span>Midnight Privacy Escrow (Compact ZK)</span>
        </button>

        <button
          className={`nav-tab-button ${activeTab === "survey" ? "active" : ""}`}
          onClick={() => setActiveTab("survey")}
        >
          <VoteIcon width="16" height="16" />
          <span>Anonymous ZK Survey</span>
        </button>

        <button
          className={`nav-tab-button ${activeTab === "cardano" ? "active" : ""}`}
          onClick={() => setActiveTab("cardano")}
        >
          <ShieldIcon width="16" height="16" />
          <span>Cardano Preprod Escrow (Aiken)</span>
        </button>

        <button
          className={`nav-tab-button ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <BarChartIcon width="16" height="16" />
          <span>Protocol Analytics</span>
        </button>

        <button
          className={`nav-tab-button ${activeTab === "docs" ? "active" : ""}`}
          onClick={() => setActiveTab("docs")}
        >
          <LayersIcon width="16" height="16" />
          <span>Docs &amp; Specs</span>
        </button>

        <button
          className={`nav-tab-button ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          <ShieldIcon width="16" height="16" />
          <span>About &amp; Security</span>
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

        {activeTab === "docs" && <DocsView />}

        {activeTab === "about" && <AboutView />}

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
                <ShieldIcon width="20" height="20" />
                <span>Active Milestone Escrows</span>
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
                <span>Recent Feedback</span>
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

      <Footer setActiveTab={setActiveTab} />
    </>
  );
}
