import type { MidnightWalletState } from '../hooks/useMidnightWallet';
import { CopyButton } from './CopyButton';
import { KeyIcon, DropletIcon, RefreshCwIcon, ExternalLinkIcon } from './Icons';

interface Props {
  wallet: MidnightWalletState;
}

export function MidnightLaceConnect({ wallet }: Props) {
  const {
    isLaceAvailable,
    isConnected,
    isConnecting,
    network,
    addresses,
    balance,
    error,
    connect,
    disconnect,
    switchNetwork,
  } = wallet;

  if (isConnected && addresses) {
    return (
      <div className="card midnight-wallet-card" data-testid="midnight-wallet-connected">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="status-dot" aria-label="Connected status indicator" />
            <span className="badge badge-midnight">
              Midnight {network.toUpperCase()}
            </span>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Connected via {isLaceAvailable ? 'Lace Wallet' : 'Lace DApp Connector (Simulator)'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <a
              href={`https://midnight-tmnight-${network}.nethermind.dev/`}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', background: 'var(--surface-alt)', borderRadius: '6px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <DropletIcon width="14" height="14" />
              <span>Faucet</span>
              <ExternalLinkIcon width="12" height="12" />
            </a>
            <button
              onClick={() => switchNetwork(network === 'preprod' ? 'preview' : 'preprod')}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              <RefreshCwIcon width="13" height="13" />
              Switch to {network === 'preprod' ? 'Preview' : 'Preprod'}
            </button>
            <button
              onClick={disconnect}
              className="danger"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              Disconnect
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.15rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          <div style={{ background: 'var(--surface-alt)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Unshielded Address</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <code className="hash" style={{ fontSize: '0.76rem' }}>{addresses.unshieldedAddress.slice(0, 18)}...{addresses.unshieldedAddress.slice(-8)}</code>
              <CopyButton value={addresses.unshieldedAddress} />
            </div>
          </div>

          {addresses.shieldedAddress && (
            <div style={{ background: 'var(--surface-alt)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Shielded Address (ZK)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <code className="hash" style={{ fontSize: '0.76rem' }}>{addresses.shieldedAddress.slice(0, 18)}...{addresses.shieldedAddress.slice(-8)}</code>
                <CopyButton value={addresses.shieldedAddress} />
              </div>
            </div>
          )}

          {balance && (
            <div style={{ background: 'var(--surface-alt)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Available Balance</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', fontVariantNumeric: 'tabular-nums' }}>
                {(Number(balance.unshielded) / 1e6).toFixed(2)} tNIGHT
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card midnight-wallet-card" data-testid="midnight-wallet-disconnected">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyIcon width="20" height="20" />
            <span>Lace Wallet Connection</span>
          </h3>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Connect your Midnight Lace wallet to prove identity and execute Compact ZK circuits on Preprod.
          </p>
        </div>

        <button
          onClick={connect}
          disabled={isConnecting}
          className="primary"
          style={{ minWidth: '180px', padding: '0.65rem 1.25rem' }}
        >
          {isConnecting ? 'Connecting...' : 'Connect Lace Wallet'}
        </button>
      </div>

      {error && (
        <div className="error-banner" style={{ marginTop: '1rem', marginBottom: 0 }}>
          {error}
        </div>
      )}
    </div>
  );
}
