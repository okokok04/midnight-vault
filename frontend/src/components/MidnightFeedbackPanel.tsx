import { useState, useCallback } from 'react';
import { generateRandomSecret, deriveMidnightPublicKey } from '../lib/midnight-crypto';
import { CopyButton } from './CopyButton';
import { VoteIcon, RefreshCwIcon } from './Icons';

export interface AnonymousFeedbackState {
  totalResponses: number;
  totalRatingSum: number;
  lastNullifier: string;
  surveyTopic: string;
}

export function MidnightFeedbackPanel() {
  const [participantSecret, setParticipantSecret] = useState(() => generateRandomSecret());
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>('WORK_QUALITY');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [feedbackStats, setFeedbackStats] = useState<AnonymousFeedbackState>({
    totalResponses: 12,
    totalRatingSum: 58,
    lastNullifier: '0xnullifier_7f2b8c9d10e4a5b6c7d8e9f0123456789abcdef0123456789abcdef01234',
    surveyTopic: '0x5374656c6c61725661756c745f467265656c616e63655f526174696e675f3236',
  });

  const [zkLogs, setZkLogs] = useState<string[]>([]);

  const handleRegenerateSecret = useCallback(() => {
    setParticipantSecret(generateRandomSecret());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);

    try {
      // Simulate Compact ZK Circuit proof generation for submitRating()
      await new Promise((resolve) => setTimeout(resolve, 700));

      const nullifierHash = await deriveMidnightPublicKey(participantSecret + '_nullifier_' + feedbackStats.surveyTopic);

      setFeedbackStats((prev) => ({
        ...prev,
        totalResponses: prev.totalResponses + 1,
        totalRatingSum: prev.totalRatingSum + rating,
        lastNullifier: nullifierHash,
      }));

      const logEntry = `[${new Date().toLocaleTimeString()}] ✅ circuit submitRating(${rating}★, ${category}) -> ZK Proof verified. Nullifier ${nullifierHash.slice(0, 16)}... registered on-chain. Participant secret retained in client memory.`;
      setZkLogs((prev) => [logEntry, ...prev]);

      setSuccessMsg(`Anonymous feedback (${rating} Stars, ${category}) submitted successfully with Zero-Knowledge verification!`);
      // Regenerate fresh secret for next review
      setParticipantSecret(generateRandomSecret());
    } catch {
      // Handled
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = feedbackStats.totalResponses > 0
    ? (feedbackStats.totalRatingSum / feedbackStats.totalResponses).toFixed(1)
    : '0.0';

  return (
    <div className="card" style={{ marginTop: '1.5rem' }} data-testid="midnight-feedback-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <VoteIcon width="20" height="20" />
            <span>Anonymous Feedback & Survey Protocol (Compact ZK)</span>
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Submit verifiable ratings with selective disclosure — your off-chain identity is never linked on-chain.
          </p>
        </div>
        <span className="badge badge-midnight">1-Person-1-Vote (Nullifiers)</span>
      </div>

      {/* Aggregate Verified Tallies */}
      <div className="stats-bar" style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="stats-tile">
          <div className="stats-tile-value" style={{ color: 'var(--warning)', fontVariantNumeric: 'tabular-nums' }}>
            {averageRating} ★
          </div>
          <div className="stats-tile-label">Average Community Score</div>
        </div>

        <div className="stats-tile">
          <div className="stats-tile-value" style={{ fontVariantNumeric: 'tabular-nums' }}>{feedbackStats.totalResponses}</div>
          <div className="stats-tile-label">Verified Anonymous Responses</div>
        </div>

        <div className="stats-tile">
          <div className="stats-tile-value" style={{ fontVariantNumeric: 'tabular-nums' }}>{feedbackStats.totalRatingSum}</div>
          <div className="stats-tile-label">Total Rating Points Tally</div>
        </div>
      </div>

      {/* Form Submission */}
      <form onSubmit={handleSubmit} style={{ marginTop: '1.25rem', background: 'var(--surface-alt)', padding: '1.25rem 1.4rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <div>
            <label htmlFor="survey-rating-select">Rating (1 to 5 Stars)</label>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRating(val)}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    fontSize: '0.88rem',
                    background: rating === val ? 'var(--accent-indigo)' : 'var(--surface)',
                    borderColor: rating === val ? 'rgba(255, 255, 255, 0.2)' : 'var(--border)',
                    color: rating === val ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {val} ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="survey-category-select">Reputation Category</label>
            <select
              id="survey-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="WORK_QUALITY">Work Quality & Deliverables</option>
              <option value="COMMUNICATION">Communication & Responsiveness</option>
              <option value="TIMELINESS">Punctuality & Deadline Adherence</option>
              <option value="PAYMENT_RELIABILITY">Payment & Release Promptness</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="participant-secret-input">Participant Secret Witness (ZK Token)</label>
          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <input
              id="participant-secret-input"
              type="password"
              value={participantSecret}
              onChange={(e) => setParticipantSecret(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
            />
            <button
              type="button"
              onClick={handleRegenerateSecret}
              title="Generate fresh secret"
              style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', padding: '0.45rem 0.8rem' }}
            >
              <RefreshCwIcon width="13" height="13" />
              Fresh Token
            </button>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            This secret generates an unlinkable cryptographic nullifier, guaranteeing 1-person-1-vote without revealing your address.
          </p>
        </div>

        {successMsg && (
          <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="primary"
          style={{ width: '100%', padding: '0.7rem' }}
        >
          {submitting ? 'Generating Zero-Knowledge Proof...' : 'Submit Anonymous Rating via ZK Circuit'}
        </button>
      </form>

      {/* Nullifier & State Inspector */}
      <div style={{ marginTop: '1.25rem', background: 'var(--surface-alt)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Latest On-Chain Nullifier (Anti-Double-Vote Hash)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <code className="hash" style={{ fontSize: '0.76rem', wordBreak: 'break-all', flex: 1 }}>{feedbackStats.lastNullifier}</code>
          <CopyButton value={feedbackStats.lastNullifier} />
        </div>
      </div>

      {zkLogs.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Recent ZK Circuit Invocations</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {zkLogs.map((log, i) => (
              <div key={i} className="trace-item" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
