import { useState } from "react";
import type { EscrowRecord } from "../types/escrow";
import { CopyButton } from "./CopyButton";
import { StatusBadge } from "./StatusBadge";

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

  return (
    <div className="card escrow-card">
      <div className="escrow-row">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <StatusBadge status={escrow.status} />{" "}
          <strong style={{ fontSize: "1.1rem", fontFeatureSettings: '"tnum"' }}>{formatAda(escrow.milestoneAmountLovelace)}</strong>
        </div>
        {isLocked && (
          <div className="actions">
            <button
              className="primary"
              disabled={busy}
              onClick={() => run(() => onRelease(escrow.id))}
            >
              Release to seller
            </button>
            <button
              className="danger"
              disabled={busy || !deadlinePassed}
              title={
                deadlinePassed
                  ? "Refund the buyer"
                  : "Available once the deadline has passed"
              }
              onClick={() => run(() => onRefund(escrow.id))}
            >
              Refund buyer
            </button>
            <button
              disabled={busy}
              onClick={() => run(() => onResolve(escrow.id, true))}
            >
              Arbiter → seller
            </button>
            <button
              disabled={busy}
              onClick={() => run(() => onResolve(escrow.id, false))}
            >
              Arbiter → buyer
            </button>
          </div>
        )}
      </div>

      <div className="escrow-meta" style={{ marginTop: "0.85rem" }}>
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
