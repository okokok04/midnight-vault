import { useMidnightWallet } from '../hooks/useMidnightWallet';
import { useMidnightContract } from '../hooks/useMidnightContract';
import { MidnightLaceConnect } from './MidnightLaceConnect';
import { MidnightPrivacyInspector } from './MidnightPrivacyInspector';
import { CopyButton } from './CopyButton';
import { LayersIcon, CheckCircleIcon, ExternalLinkIcon } from './Icons';
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
  } = useMidnightContract(wallet.laceApi);

  return (
    <div className="midnight-escrow-panel" data-testid="midnight-escrow-panel">
      <div className="studio-split">
        {/* Left Column: Wallet & On-Chain Contract State Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 1. Lace Wallet Connector */}
          <MidnightLaceConnect wallet={wallet} />

          {/* 2. Preprod Deployed Contract Status & Lifecycle */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <LayersIcon width="18" height="18" />
                  <span>Midnight Compact Escrow State</span>
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Milestone escrow on Midnight Preprod with ZK circuit verification.
                </p>
              </div>
              <span className={`badge badge-${escrowState.state.toLowerCase()}`}>
                ● {escrowState.state}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.65rem' }}>
              <div style={{ background: 'var(--bg-inset)', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Preprod Contract</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <code className="hash" style={{ fontSize: '0.74rem' }}>{PREPROD_DEPLOYED_CONTRACT.slice(0, 14)}...{PREPROD_DEPLOYED_CONTRACT.slice(-6)}</code>
                  <CopyButton value={PREPROD_DEPLOYED_CONTRACT} />
                </div>
              </div>

              <div style={{ background: 'var(--bg-inset)', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Milestone Amount</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#60a5fa', fontVariantNumeric: 'tabular-nums' }}>
                  {escrowState.milestoneAmount.toString()} tNIGHT
                </div>
              </div>

              <div style={{ background: 'var(--bg-inset)', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Seller Key Hash</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <code className="hash" style={{ fontSize: '0.74rem' }}>{escrowState.sellerPk.slice(0, 12)}...</code>
                  <CopyButton value={escrowState.sellerPk} />
                </div>
              </div>

              <div style={{ background: 'var(--bg-inset)', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Arbiter Key Hash</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <code className="hash" style={{ fontSize: '0.74rem' }}>{escrowState.arbiterPk.slice(0, 12)}...</code>
                  <CopyButton value={escrowState.arbiterPk} />
                </div>
              </div>
            </div>

            {error && (
              <div className="error-banner" style={{ marginTop: '1rem', marginBottom: 0 }}>
                {error}
              </div>
            )}

            {/* Circuit Invocation Controls */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Execute Compact ZK Circuits</h4>
                {executing && (
                  <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className="status-dot" style={{ width: '5px', height: '5px', background: 'var(--accent-cyan)', boxShadow: '0 0 6px var(--accent-cyan)' }} />
                    Generating Proof...
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => callCircuit('deposit')}
                  disabled={executing || escrowState.state !== 'AWAITING_DEPOSIT'}
                  className={escrowState.state === 'AWAITING_DEPOSIT' ? 'primary' : undefined}
                >
                  1. circuit deposit()
                </button>

                <button
                  onClick={() => callCircuit('release')}
                  disabled={executing || escrowState.state !== 'LOCKED'}
                  className={escrowState.state === 'LOCKED' ? 'primary' : undefined}
                >
                  2. circuit release()
                </button>

                <button
                  onClick={() => callCircuit('refund')}
                  disabled={executing || escrowState.state !== 'LOCKED'}
                  className="danger"
                >
                  circuit refund()
                </button>

                <button
                  onClick={() => callCircuit('resolve', { paySeller: true })}
                  disabled={executing || escrowState.state !== 'LOCKED'}
                >
                  circuit resolve(seller)
                </button>
              </div>
            </div>

            {/* Explorer Verification Link */}
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircleIcon width="13" height="13" color="var(--success)" />
                <span>Compact ZK Bytecode Verified</span>
              </div>
              <a
                href="https://indexer.preprod.midnight.network"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                Inspect Indexer <ExternalLinkIcon width="11" height="11" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Zero-Knowledge Privacy & Witness Studio */}
        <div>
          <MidnightPrivacyInspector
            privateState={privateState}
            traces={traces}
            onRegenerateSecret={regenerateSecret}
            onUpdateSecret={updateSecretKey}
          />
        </div>
      </div>
    </div>
  );
}
