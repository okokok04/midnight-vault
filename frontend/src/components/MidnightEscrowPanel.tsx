import { useMidnightWallet } from '../hooks/useMidnightWallet';
import { useMidnightContract } from '../hooks/useMidnightContract';
import { MidnightLaceConnect } from './MidnightLaceConnect';
import { MidnightPrivacyInspector } from './MidnightPrivacyInspector';
import { CopyButton } from './CopyButton';
import { PREPROD_DEPLOYED_CONTRACT } from '../lib/midnight-crypto';

export function MidnightEscrowPanel() {
  const wallet = useMidnightWallet();
  const {
    privateState,
    escrowState,
    traces,
    executing,
    error,
    updateSecretKey,
    regenerateSecret,
    callCircuit,
  } = useMidnightContract();

  return (
    <div className="midnight-escrow-panel" data-testid="midnight-escrow-panel">
      {/* 1. Lace Wallet Connect */}
      <MidnightLaceConnect wallet={wallet} />

      {/* 2. Observable Privacy Behavior Inspector */}
      <div style={{ marginTop: '1.25rem' }}>
        <MidnightPrivacyInspector
          privateState={privateState}
          traces={traces}
          onRegenerateSecret={regenerateSecret}
          onUpdateSecret={updateSecretKey}
        />
      </div>

      {/* 3. Preprod Deployed Contract Status & Lifecycle */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Midnight Compact Escrow State</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Contract deployed on Midnight Preprod network with ZK circuit verification.
            </p>
          </div>
          <span className={`badge badge-${escrowState.state.toLowerCase()}`}>
            {escrowState.state}
          </span>
        </div>

        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Preprod Contract Address:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <code className="hash" style={{ fontSize: '0.75rem' }}>{PREPROD_DEPLOYED_CONTRACT.slice(0, 20)}...{PREPROD_DEPLOYED_CONTRACT.slice(-8)}</code>
              <CopyButton value={PREPROD_DEPLOYED_CONTRACT} />
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)' }}>Milestone Amount:</span>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>
              {escrowState.milestoneAmount.toString()} tNIGHT
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)' }}>Seller Public Key:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <code className="hash" style={{ fontSize: '0.75rem' }}>{escrowState.sellerPk.slice(0, 16)}...</code>
              <CopyButton value={escrowState.sellerPk} />
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)' }}>Arbiter Public Key:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <code className="hash" style={{ fontSize: '0.75rem' }}>{escrowState.arbiterPk.slice(0, 16)}...</code>
              <CopyButton value={escrowState.arbiterPk} />
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner" style={{ marginTop: '1rem', marginBottom: 0 }}>
            {error}
          </div>
        )}

        {/* 4. Circuit Invocation Controls */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.9rem' }}>Call Compact ZK Circuits</h4>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              className="primary"
              disabled={executing || escrowState.state !== 'AWAITING_DEPOSIT'}
              onClick={() => callCircuit('deposit')}
            >
              {executing ? 'Executing...' : '1. circuit deposit()'}
            </button>

            <button
              disabled={executing || escrowState.state !== 'LOCKED'}
              onClick={() => callCircuit('release')}
            >
              2. circuit release()
            </button>

            <button
              disabled={executing || escrowState.state !== 'LOCKED'}
              onClick={() => callCircuit('refund')}
            >
              3. circuit refund()
            </button>

            <button
              disabled={executing || escrowState.state !== 'LOCKED'}
              onClick={() => callCircuit('resolve', { paySeller: true })}
            >
              4. circuit resolve(paySeller)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
