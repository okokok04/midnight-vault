import { useState } from 'react';
import { useMidnightFeedback } from '../hooks/useMidnightFeedback';
import { CopyButton } from './CopyButton';
import { VoteIcon, RefreshCwIcon, CheckCircleIcon, ExternalLinkIcon } from './Icons';
import { EXPLORER_URLS } from '../lib/midnight-indexer';

export function MidnightFeedbackPanel() {
  const {
    participantSecret,
    currentNullifier,
    isConsumed,
    feedbackStats,
    submitting,
    error,
    zkLogs,
    updateParticipantSecret,
    regenerateSecret,
    submitRating,
  } = useMidnightFeedback();

  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>('WORK_QUALITY');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    try {
      const { nullifier, txHash } = await submitRating(rating, category);
      setSuccessMsg(
        `Anonymous feedback (${rating} Stars, ${category}) confirmed on-chain! Tx: ${txHash.slice(0, 14)}... Nullifier: ${nullifier.slice(0, 14)}...`
      );
    } catch {
      // Error handled via hook
    }
  };

  const averageRating =
    feedbackStats.totalResponses > 0
      ? (feedbackStats.totalRatingSum / feedbackStats.totalResponses).toFixed(1)
      : '0.0';

  return (
    <div className="card" style={{ marginTop: '1.25rem' }} data-testid="midnight-feedback-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <VoteIcon width="18" height="18" />
            <span>Anonymous Feedback &amp; Survey Protocol (Compact ZK)</span>
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Submit verifiable ratings with selective disclosure — identity is never linked on-chain.
          </p>
        </div>
        <span className="badge badge-midnight">1-Person-1-Vote</span>
      </div>

      <div className="studio-split">
        {/* Left Column: Rating Form */}
        <div>
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--bg-inset)',
              padding: '1.15rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="form-grid" style={{ marginBottom: '0.85rem' }}>
              <div>
                <label htmlFor="survey-rating-select">Rating (1 to 5 Stars)</label>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      style={{
                        flex: 1,
                        padding: '0.45rem 0.25rem',
                        fontSize: '0.82rem',
                        background: rating === val ? '#2563eb' : 'var(--bg-card)',
                        borderColor: rating === val ? '#3b82f6' : 'var(--border)',
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
                  <option value="WORK_QUALITY">Work Quality &amp; Deliverables</option>
                  <option value="COMMUNICATION">Communication &amp; Responsiveness</option>
                  <option value="TIMELINESS">Punctuality &amp; Deadlines</option>
                  <option value="PAYMENT_RELIABILITY">Payment Reliability</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="participant-secret-input">Participant Secret (ZK Token)</label>
                {isConsumed && (
                  <span style={{ fontSize: '0.72rem', color: '#f43f5e', fontWeight: 600 }}>
                    ⚠️ Nullifier Consumed
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <input
                  id="participant-secret-input"
                  type="password"
                  value={participantSecret}
                  onChange={(e) => updateParticipantSecret(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
                />
                <button
                  type="button"
                  onClick={regenerateSecret}
                  title="Generate fresh secret"
                  style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', padding: '0.4rem 0.65rem' }}
                >
                  <RefreshCwIcon width="12" height="12" />
                  Fresh
                </button>
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Generates an unlinkable cryptographic nullifier guaranteeing 1-person-1-vote.
              </p>
            </div>

            {error && (
              <div className="error-banner" style={{ marginBottom: '0.85rem' }}>
                {error}
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  background: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  color: '#34d399',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.78rem',
                  marginBottom: '0.85rem',
                }}
              >
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || isConsumed}
              className="primary"
              style={{ width: '100%', padding: '0.65rem' }}
            >
              {submitting
                ? 'Generating ZK Proof & Submitting...'
                : isConsumed
                ? 'Token Already Used (Generate Fresh Token Above)'
                : 'Submit Anonymous Rating via ZK Circuit'}
            </button>
          </form>
        </div>

        {/* Right Column: Scoreboard & Nullifiers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Aggregate Verified Tallies */}
          <div className="stats-bar" style={{ marginBottom: 0 }}>
            <div className="stats-tile">
              <div className="stats-tile-value" style={{ color: '#fbbf24', fontVariantNumeric: 'tabular-nums' }}>
                {averageRating} ★
              </div>
              <div className="stats-tile-label">Community Score</div>
            </div>

            <div className="stats-tile">
              <div className="stats-tile-value" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {feedbackStats.totalResponses}
              </div>
              <div className="stats-tile-label">Verified Responses</div>
            </div>

            <div className="stats-tile">
              <div className="stats-tile-value" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {feedbackStats.totalRatingSum}
              </div>
              <div className="stats-tile-label">Rating Points</div>
            </div>
          </div>

          {/* Nullifier & State Inspector */}
          <div
            style={{
              background: 'var(--bg-inset)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Derived Nullifier (Anti-Double-Vote)
              </span>
              <span style={{ fontSize: '0.72rem', color: isConsumed ? '#f43f5e' : '#10b981', fontWeight: 600 }}>
                {isConsumed ? '● CONSUMED' : '● READY'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <code className="hash" style={{ fontSize: '0.74rem', wordBreak: 'break-all', flex: 1 }}>
                {currentNullifier || feedbackStats.lastNullifier}
              </code>
              <CopyButton value={currentNullifier || feedbackStats.lastNullifier} />
            </div>
          </div>

          {feedbackStats.consumedNullifiers.length > 0 && (
            <div style={{ background: 'var(--bg-inset)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                Consumed Nullifier Registry ({feedbackStats.consumedNullifiers.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {feedbackStats.consumedNullifiers.slice(0, 3).map((nullifier, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem' }}>
                    <CheckCircleIcon width="11" height="11" color="var(--success)" />
                    <code className="hash" style={{ fontSize: '0.72rem' }}>{nullifier.slice(0, 20)}...{nullifier.slice(-6)}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {zkLogs.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Recent ZK Circuit Invocations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {zkLogs.map((log, i) => (
                  <div key={i} className="trace-item" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explorer Verification Link */}
      <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <CheckCircleIcon width="13" height="13" color="var(--success)" />
          <span>Anonymous Feedback Protocol on Midnight Preprod</span>
        </div>
        <a
          href={EXPLORER_URLS.preprod}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
        >
          View on Indexer <ExternalLinkIcon width="11" height="11" />
        </a>
      </div>
    </div>
  );
}
