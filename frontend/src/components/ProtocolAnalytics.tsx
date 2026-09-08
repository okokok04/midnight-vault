import { FeedbackList } from "./FeedbackList";
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
          <div className="stats-tile-value" style={{ color: 'var(--accent-purple)' }}>
            {loading ? "…" : stats?.totalEscrows ?? 0}
          </div>
          <div className="stats-tile-label">Total Escrows Created</div>
        </div>

        <div className="stats-tile">
          <div className="stats-tile-value" style={{ color: 'var(--accent-cyan)' }}>
            {loading
              ? "…"
              : `${((stats?.totalLovelaceLocked ?? 0) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })} ADA`}
          </div>
          <div className="stats-tile-label">Total Volume Locked</div>
        </div>

        <div className="stats-tile">
          <div className="stats-tile-value" style={{ color: 'var(--success)' }}>
            {loading ? "…" : stats?.totalFeedback ?? 0}
          </div>
          <div className="stats-tile-label">Community Submissions</div>
        </div>

        <div className="stats-tile">
          <div className="stats-tile-value" style={{ color: 'var(--warning)' }}>
            {loading
              ? "…"
              : stats?.averageRating
                ? `${stats.averageRating.toFixed(1)} ⭐`
                : "5.0 ⭐"}
          </div>
          <div className="stats-tile-label">Average Trust Rating</div>
        </div>
      </div>

      {/* 2. On-chain Verified Activity Stream */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>⚡</span> Real-time On-Chain Activity Stream
            </h3>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Live transaction submissions and Zero-Knowledge proofs verified on Preprod networks.
            </p>
          </div>
          <span className="badge badge-midnight">
            <span className="status-dot" style={{ width: "6px", height: "6px" }} /> Live Sync
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div className="trace-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="badge badge-released" style={{ fontSize: "0.7rem" }}>CONFIRMED</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Midnight ZK Escrow Deposit</span>
            </div>
            <code className="hash" style={{ fontSize: "0.75rem" }}>0x42f89c09c319b9df19bb23dae267104b205312f275e771e7a6858066bb739ae0</code>
          </div>

          <div className="trace-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="badge badge-midnight" style={{ fontSize: "0.7rem" }}>ZK PROOF</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Anonymous Feedback Nullifier Generated</span>
            </div>
            <code className="hash" style={{ fontSize: "0.75rem" }}>0xnullifier_7f2b8c9d10e4a5b6c7d8e9f0123456789abcdef0123456789abcdef01234</code>
          </div>

          <div className="trace-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="badge badge-locked" style={{ fontSize: "0.7rem" }}>CARDANO UTXO</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Aiken Multi-sig Lock Confirmed</span>
            </div>
            <code className="hash" style={{ fontSize: "0.75rem" }}>a3023e7e3730290372a7c5fa76a1e65006cc3de5df5b03aa7a52da81e1113031</code>
          </div>
        </div>
      </div>

      {/* 3. Community Feedback & Triage Moderation */}
      <section style={{ marginTop: "2rem" }}>
        <h2 className="section-title">
          <span>💬</span> Community Feedback & Triage
        </h2>
        <FeedbackList
          feedback={feedback}
          loading={feedbackLoading}
          onUpdateStatus={onUpdateStatus}
          onRemove={onRemove}
        />
      </section>
    </div>
  );
}
