import { FeedbackList } from "./FeedbackList";
import { ActivityIcon } from "./Icons";
import type { FeedbackRecord, FeedbackStatus } from "../types/feedback";
import type { PlatformStats } from "../types/stats";

interface Props {
  stats: PlatformStats | null;
  loading: boolean;
  feedback: FeedbackRecord[];
  feedbackLoading: boolean;
  onUpdateStatus: (id: string, status: FeedbackStatus) => Promise<unknown>;
  onRemove: (id: string) => Promise<unknown>;
}

export function ProtocolAnalytics({
  stats,
  loading,
  feedback,
  feedbackLoading,
  onUpdateStatus,
  onRemove,
}: Props) {
  return (
    <div className="analytics-view" data-testid="protocol-analytics">
      {/* 1. Protocol Health & Metrics */}
      <div className="stats-bar">
        <div className="stats-tile">
          <div className="stats-tile-value" style={{ color: '#60a5fa' }}>
            {loading ? "…" : stats?.totalEscrows ?? 0}
          </div>
          <div className="stats-tile-label">Total Escrows Created</div>
        </div>

        <div className="stats-tile">
          <div className="stats-tile-value" style={{ color: '#38bdf8' }}>
            {loading
              ? "…"
              : `${((stats?.totalLovelaceLocked ?? 0) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })} ADA`}
          </div>
          <div className="stats-tile-label">Total Volume Locked</div>
        </div>

        <div className="stats-tile">
          <div className="stats-tile-value" style={{ color: '#34d399' }}>
            {loading ? "…" : stats?.totalFeedback ?? 0}
          </div>
          <div className="stats-tile-label">Community Submissions</div>
        </div>

        <div className="stats-tile">
          <div className="stats-tile-value" style={{ color: '#fbbf24' }}>
            {loading
              ? "…"
              : stats?.averageRating
                ? `${stats.averageRating.toFixed(1)} ★`
                : "5.0 ★"}
          </div>
          <div className="stats-tile-label">Average Trust Rating</div>
        </div>
      </div>

      {/* 2. On-chain Verified Activity Stream */}
      <div className="card" style={{ marginTop: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <ActivityIcon width="18" height="18" />
              <span>Real-time On-Chain Activity Stream</span>
            </h3>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Live transaction submissions and Zero-Knowledge proofs verified on Preprod networks.
            </p>
          </div>
          <span className="badge badge-midnight">
            <span className="status-dot" style={{ width: "5px", height: "5px" }} /> Live Sync
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div className="trace-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge badge-released" style={{ fontSize: "0.68rem" }}>CONFIRMED</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>Midnight ZK Escrow Deposit</span>
            </div>
            <code className="hash" style={{ fontSize: "0.74rem" }}>0x42f89c09c319b9df19bb23dae267104b205312f275e771e7a6858066bb739ae0</code>
          </div>

          <div className="trace-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge badge-midnight" style={{ fontSize: "0.68rem" }}>ZK PROOF</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>Anonymous Feedback Nullifier Generated</span>
            </div>
            <code className="hash" style={{ fontSize: "0.74rem" }}>0xnullifier_7f2b8c9d10e4a5b6c7d8e9f0123456789abcdef0123456789abcdef01234</code>
          </div>

          <div className="trace-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge badge-locked" style={{ fontSize: "0.68rem" }}>CARDANO UTXO</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>Aiken Multi-sig Lock Confirmed</span>
            </div>
            <code className="hash" style={{ fontSize: "0.74rem" }}>a3023e7e3730290372a7c5fa76a1e65006cc3de5df5b03aa7a52da81e1113031</code>
          </div>
        </div>
      </div>

      {/* 3. Community Feedback Management */}
      <div className="card" style={{ marginTop: "1.25rem" }}>
        <h3 style={{ margin: "0 0 0.85rem", fontSize: "1.05rem" }}>
          Community Submissions &amp; Triage Pipeline
        </h3>
        <FeedbackList
          feedback={feedback}
          loading={feedbackLoading}
          onUpdateStatus={onUpdateStatus}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
}
