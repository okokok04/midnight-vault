import { useState } from "react";
import type { EscrowRecord } from "../types/escrow";
import { CopyButton } from "./CopyButton";
import { StatusBadge } from "./StatusBadge";
import { CheckCircleIcon, ClockIcon } from "./Icons";


function shorten(value: string, head = 8, tail = 6): string {
  return value.length > head + tail + 1
    ? `${value.slice(0, head)}…${value.slice(-tail)}`
    : value;
}

function formatAda(lovelace: number): string {
  return `${(lovelace / 1_000_000).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ADA`;
}

export function EscrowCard({
  escrow,
  onRelease,
  onRefund,
  onResolve,
}: {
  escrow: EscrowRecord;
  onRelease: (id: string) => Promise<unknown>;
  onRefund: (id: string) => Promise<unknown>;
  onResolve: (id: string, paySeller: boolean) => Promise<unknown>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLocked = escrow.status === "locked";
  const deadlinePassed = Date.now() >= escrow.deadlineUnixMs;

  const msRemaining = escrow.deadlineUnixMs - Date.now();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  // Step indices: 1 = Initialized, 2 = Locked, 3 = In Dispute/Review, 4 = Finalized
  const isSettled = escrow.status === "released" || escrow.status === "refunded" || escrow.status === "resolved";

  return (
    <div className="card escrow-card">
      {/* Visual Step Progress Tracker */}
      <div className="escrow-lifecycle-stepper">
        <div className="step-item step-completed">
          <div className="step-dot"><CheckCircleIcon width="12" height="12" /></div>
          <div className="step-label">1. Created</div>
        </div>
        <div className={`step-connector ${isLocked || isSettled ? "connector-active" : ""}`} />
        <div className={`step-item ${isLocked ? "step-active" : isSettled ? "step-completed" : ""}`}>
          <div className="step-dot">{isSettled ? <CheckCircleIcon width="12" height="12" /> : "2"}</div>
          <div className="step-label">2. Funds Locked</div>
        </div>
        <div className={`step-connector ${isSettled ? "connector-active" : ""}`} />
        <div className={`step-item ${isLocked && !deadlinePassed ? "step-waiting" : isSettled ? "step-completed" : ""}`}>
          <div className="step-dot">{isSettled ? <CheckCircleIcon width="12" height="12" /> : "3"}</div>
          <div className="step-label">3. Deliver & Review</div>
        </div>
        <div className={`step-connector ${isSettled ? "connector-active" : ""}`} />
        <div className={`step-item ${isSettled ? "step-active-final" : ""}`}>
          <div className="step-dot">{isSettled ? <CheckCircleIcon width="12" height="12" /> : "4"}</div>
          <div className="step-label">4. Settled</div>
        </div>
      </div>

      <div className="escrow-row" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <StatusBadge status={escrow.status} />
          <strong style={{ fontSize: "1.2rem", fontFeatureSettings: '"tnum"', color: "#ffffff", letterSpacing: "-0.01em" }}>
            {formatAda(escrow.milestoneAmountLovelace)}
          </strong>
          {isLocked && (
            <span className="deadline-badge" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <ClockIcon width="12" height="12" />
              {deadlinePassed ? (
                <span style={{ color: "var(--danger)" }}>Refund window open</span>
              ) : (
                <span>{daysRemaining}d remaining</span>
              )}
            </span>
          )}
        </div>
        {isLocked && (
          <div className="actions">
            <button
              className="primary"
              disabled={busy}
              onClick={() => run(() => onRelease(escrow.id))}
              title="Buyer releases milestone payout to seller"
            >
              Release to seller
            </button>
            <button
              className="danger"
              disabled={busy || !deadlinePassed}
              title={
                deadlinePassed
                  ? "Refund the buyer (deadline passed)"
                  : "Available once the deadline has passed"
              }
              onClick={() => run(() => onRefund(escrow.id))}
            >
              Refund buyer
            </button>
            <button
              disabled={busy}
              onClick={() => run(() => onResolve(escrow.id, true))}
              title="Arbiter rules in favor of Seller"
            >
              Arbiter → seller
            </button>
            <button
              disabled={busy}
              onClick={() => run(() => onResolve(escrow.id, false))}
              title="Arbiter rules in favor of Buyer"
            >
              Arbiter → buyer
            </button>
          </div>
        )}
      </div>

      <div className="escrow-meta" style={{ marginTop: "1rem" }}>
        <span><strong>Buyer:</strong> {shorten(escrow.buyerAddress)}</span>
        <span><strong>Seller:</strong> {shorten(escrow.sellerAddress)}</span>
        <span><strong>Arbiter:</strong> {shorten(escrow.arbiterAddress)}</span>
        <span><strong>Deadline:</strong> {new Date(escrow.deadlineUnixMs).toLocaleString()}</span>
      </div>
      <div className="escrow-meta" style={{ marginTop: "0.45rem" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <strong>Script:</strong> <code className="hash">{shorten(escrow.scriptAddress)}</code>{" "}
          <CopyButton value={escrow.scriptAddress} />
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <strong>Lock Tx:</strong> <code className="hash">{shorten(escrow.lockTxHash)}</code>{" "}
          <CopyButton value={escrow.lockTxHash} />
        </span>
        {escrow.settleTxHash && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <strong>Settle Tx:</strong>{" "}
            <code className="hash">{shorten(escrow.settleTxHash)}</code>{" "}
            <CopyButton value={escrow.settleTxHash} />
          </span>
        )}
      </div>

      {error && <div className="error-banner" role="alert" style={{ marginTop: "0.85rem", marginBottom: 0 }}>{error}</div>}
    </div>
  );
}

