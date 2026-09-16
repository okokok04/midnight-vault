import { useState, type FormEvent } from "react";
import type { CreateEscrowInput } from "../types/escrow";
import { LockIcon, SparklesIcon, ShieldIcon } from "./Icons";

interface FormState {
  buyerAddress: string;
  sellerAddress: string;
  arbiterAddress: string;
  milestoneAmountAda: string;
  deadline: string;
}

const EMPTY_FORM: FormState = {
  buyerAddress: "",
  sellerAddress: "",
  arbiterAddress: "",
  milestoneAmountAda: "",
  deadline: "",
};

const DEADLINE_PRESETS = [
  { label: "+1 day", days: 1 },
  { label: "+3 days", days: 3 },
  { label: "+7 days", days: 7 },
  { label: "+14 days", days: 14 },
];

const MILESTONE_TEMPLATES = [
  {
    title: "Fullstack DApp MVP",
    ada: "250",
    days: 14,
    buyer: "addr_test1qrx86...buyer",
    seller: "addr_test1qpk92...dev",
    arbiter: "addr_test1qzn44...arbiter",
  },
  {
    title: "Smart Contract Audit",
    ada: "500",
    days: 7,
    buyer: "addr_test1qrx86...buyer",
    seller: "addr_test1q99k2...auditor",
    arbiter: "addr_test1qzn44...arbiter",
  },
  {
    title: "ZK-SNARK Integration",
    ada: "350",
    days: 7,
    buyer: "addr_test1qrx86...buyer",
    seller: "addr_test1q77a1...zkdev",
    arbiter: "addr_test1qzn44...arbiter",
  },
  {
    title: "UI/UX Master Redesign",
    ada: "150",
    days: 3,
    buyer: "addr_test1qrx86...buyer",
    seller: "addr_test1q88m3...designer",
    arbiter: "addr_test1qzn44...arbiter",
  },
];

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function EscrowForm({
  onCreate,
  defaultBuyerAddress,
}: {
  onCreate: (input: CreateEscrowInput) => Promise<unknown>;
  defaultBuyerAddress?: string;
}) {
  const [form, setForm] = useState<FormState>({
    ...EMPTY_FORM,
    buyerAddress: defaultBuyerAddress ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyTemplate(tmpl: typeof MILESTONE_TEMPLATES[0]) {
    const futureDate = new Date(Date.now() + tmpl.days * 86_400_000);
    setForm({
      buyerAddress: defaultBuyerAddress || tmpl.buyer,
      sellerAddress: tmpl.seller,
      arbiterAddress: tmpl.arbiter,
      milestoneAmountAda: tmpl.ada,
      deadline: toDatetimeLocalValue(futureDate),
    });
    setError(null);
  }

  const adaNum = Number(form.milestoneAmountAda) || 0;
  const estimatedTxFee = 0.174;
  const minUtxoStorage = 2.0;
  const totalAdaRequired = adaNum > 0 ? (adaNum + minUtxoStorage + estimatedTxFee).toFixed(3) : "0.000";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const ada = Number(form.milestoneAmountAda);
    const deadlineMs = form.deadline ? new Date(form.deadline).getTime() : NaN;

    if (!form.buyerAddress || !form.sellerAddress || !form.arbiterAddress) {
      setError("Buyer, seller, and arbiter addresses are all required.");
      return;
    }
    if (!Number.isFinite(ada) || ada <= 0) {
      setError("Milestone amount must be a positive number of ADA.");
      return;
    }
    if (!Number.isFinite(deadlineMs) || deadlineMs <= Date.now()) {
      setError("Deadline must be a valid date in the future.");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        buyerAddress: form.buyerAddress,
        sellerAddress: form.sellerAddress,
        arbiterAddress: form.arbiterAddress,
        milestoneAmountLovelace: Math.round(ada * 1_000_000),
        deadlineUnixMs: deadlineMs,
      });
      setForm({ ...EMPTY_FORM, buyerAddress: defaultBuyerAddress ?? "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create escrow");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card escrow-form-card" onSubmit={handleSubmit}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.6rem" }}>
        <div>
          <h2 className="section-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <LockIcon width="18" height="18" />
            <span>New milestone escrow</span>
          </h2>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Lock native ADA with Aiken Plutus V3 multi-signature verification.
          </p>
        </div>
        <span className="badge badge-locked">Plutus V3</span>
      </div>

      {/* Quick Template Presets */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-dim)", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <SparklesIcon width="12" height="12" />
          <span>Quick Milestone Presets</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.4rem" }}>
          {MILESTONE_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.title}
              type="button"
              className="preset-chip-btn"
              onClick={() => applyTemplate(tmpl)}
              title={`Auto-fill ${tmpl.title} with ${tmpl.ada} ADA`}
            >
              <div style={{ fontWeight: 600, fontSize: "0.78rem", color: "var(--text)" }}>{tmpl.title}</div>
              <div style={{ fontSize: "0.72rem", color: "#93c5fa", fontVariantNumeric: "tabular-nums" }}>{tmpl.ada} ADA • {tmpl.days}d</div>
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}

      <div className="form-grid">
        <div className="field-full">
          <label htmlFor="buyerAddress">Buyer address</label>
          <input
            id="buyerAddress"
            placeholder="addr_test1..."
            value={form.buyerAddress}
            onChange={(e) => update("buyerAddress", e.target.value)}
          />
        </div>
        <div className="field-full">
          <label htmlFor="sellerAddress">Seller address</label>
          <input
            id="sellerAddress"
            placeholder="addr_test1..."
            value={form.sellerAddress}
            onChange={(e) => update("sellerAddress", e.target.value)}
          />
        </div>
        <div className="field-full">
          <label htmlFor="arbiterAddress">Arbiter address</label>
          <input
            id="arbiterAddress"
            placeholder="addr_test1..."
            value={form.arbiterAddress}
            onChange={(e) => update("arbiterAddress", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="milestoneAmountAda">Milestone amount (ADA)</label>
          <input
            id="milestoneAmountAda"
            type="number"
            min="0"
            step="0.1"
            placeholder="50"
            value={form.milestoneAmountAda}
            onChange={(e) => update("milestoneAmountAda", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="deadline">Refund deadline</label>
          <input
            id="deadline"
            type="datetime-local"
            value={form.deadline}
            onChange={(e) => update("deadline", e.target.value)}
          />
        </div>
        <div className="field-full">
          <div className="deadline-presets">
            {DEADLINE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  update(
                    "deadline",
                    toDatetimeLocalValue(
                      new Date(Date.now() + preset.days * 86_400_000),
                    ),
                  )
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Financial Breakdown Bar */}
      {adaNum > 0 && (
        <div className="escrow-cost-breakdown">
          <div className="cost-row">
            <span className="cost-label">Milestone Locked Value:</span>
            <span className="cost-value">{adaNum.toLocaleString()} ADA</span>
          </div>
          <div className="cost-row">
            <span className="cost-label">Cardano Script Storage Reserve:</span>
            <span className="cost-value">{minUtxoStorage.toFixed(1)} ADA</span>
          </div>
          <div className="cost-row">
            <span className="cost-label">Estimated Network Fee:</span>
            <span className="cost-value">~{estimatedTxFee} ADA</span>
          </div>
          <div className="cost-row total-row">
            <span className="cost-label">Total UTxO Obligation:</span>
            <span className="cost-value highlight">{totalAdaRequired} ADA</span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", padding: "0.55rem 0.75rem", background: "var(--bg-inset)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)", fontSize: "0.74rem", color: "var(--text-muted)" }}>
        <ShieldIcon width="14" height="14" color="#60a5fa" />
        <span>Non-custodial: Funds can only be settled by mutual signoff or arbiter ruling.</span>
      </div>

      <button className="primary" type="submit" disabled={submitting} style={{ marginTop: "1rem", width: "100%", padding: "0.65rem" }}>
        {submitting ? "Locking funds…" : "Lock funds in escrow"}
      </button>
    </form>
  );
}
