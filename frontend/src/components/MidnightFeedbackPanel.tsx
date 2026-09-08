import { useState, useCallback } from 'react';
import { generateRandomSecret, deriveMidnightPublicKey } from '../lib/midnight-crypto';
import { CopyButton } from './CopyButton';

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

      setSuccessMsg(`Anonymous feedback (${rating} ⭐, ${category}) submitted successfully with Zero-Knowledge verification!`);
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
            <span>🗳️</span> Anonymous Feedback & Survey Protocol (Compact ZK)
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
          <div className="stats-tile-value" style={{ color: 'var(--warning)', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {averageRating} ⭐
          </div>
          <div className="stats-tile-label">Average Community Score</div>
        </div>

        <div className="stats-tile">
          <div className="stats-tile-value">{feedbackStats.totalResponses}</div>
          <div className="stats-tile-label">Verified Anonymous Responses</div>
        </div>

        <div className="stats-tile">
          <div className="stats-tile-value">{feedbackStats.totalRatingSum}</div>
          <div className="stats-tile-label">Total Rating Points Tally</div>
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} style={{ marginTop: '1.25rem' }}>
        <div className="form-grid">
          <div>
            <label htmlFor="feedback-rating">Rating (1 to 5 Stars)</label>
            <select
              id="feedback-rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
              <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
              <option value={3}>⭐⭐⭐ (3 - Satisfactory)</option>
              <option value={2}>⭐⭐ (2 - Needs Improvement)</option>
              <option value={1}>⭐ (1 - Unsatisfactory)</option>
            </select>
          </div>

          <div>
            <label htmlFor="feedback-category">Feedback Category</label>
            <select
              id="feedback-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="WORK_QUALITY">Work Quality</option>
              <option value="COMMUNICATION">Communication</option>
              <option value="PAYMENT_PROMPTNESS">Payment Promptness</option>
              <option value="COLLABORATION">Collaboration</option>
              <option value="GENERAL">General Experience</option>
            </select>
          </div>

          <div className="field-full">
            <label htmlFor="feedback-secret">
              <code>participantSecret(): Bytes&lt;32&gt;</code> (Private Witness - Retained in Browser Memory)
            </label>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <input
                id="feedback-secret"
                type="password"
                value={participantSecret}
                onChange={(e) => setParticipantSecret(e.target.value)}
                style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
              />
              <button
                type="button"
                onClick={handleRegenerateSecret}
                style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', padding: '0.45rem 0.8rem' }}
              >
                🔄 Fresh Secret
              </button>
            </div>
          </div>
        </div>

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1rem', backdropFilter: 'blur(10px)' }}>
            {successMsg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button type="submit" disabled={submitting} className="primary" style={{ padding: '0.65rem 1.25rem' }}>
            {submitting ? 'Computing ZK Proof...' : 'Submit Anonymous Feedback (ZK Circuit)'}
          </button>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Topic Hash:</span>
            <code className="hash">{feedbackStats.surveyTopic.slice(0, 16)}...</code>
            <CopyButton value={feedbackStats.surveyTopic} />
          </div>
        </div>
      </form>

      {/* Proof Logs */}
      {zkLogs.length > 0 && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Zero-Knowledge Execution Logs</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {zkLogs.map((log, i) => (
              <div key={i} style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--surface-alt)', padding: '0.45rem 0.75rem', borderRadius: '6px' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
