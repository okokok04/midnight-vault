import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MidnightLaceConnect } from './MidnightLaceConnect';
import { MidnightPrivacyInspector } from './MidnightPrivacyInspector';
import { MidnightEscrowPanel } from './MidnightEscrowPanel';
import type { MidnightWalletState } from '../hooks/useMidnightWallet';

const mockLaceApi = {
  getNetworkId: vi.fn().mockResolvedValue('preprod'),
  getUnshieldedAddress: vi.fn().mockResolvedValue('mn_unshielded1qqg8u0k92u089w2345v8d7f6z4k9a2j4m7n5p'),
  getShieldedAddress: vi.fn().mockResolvedValue('shielded_addr_0123456789abcdef'),
  getBalance: vi.fn().mockResolvedValue({
    unshielded: 1250000000n,
    shielded: 5000000000n,
  }),
  proveTx: vi.fn().mockResolvedValue({
    proof: new Uint8Array([1, 2, 3, 4]),
    publicOutputs: { proofHash: '0xzkproof_5b36440f9c2d1b70d4218a09b389f41029c78103478912890a8910471289a0b1' },
  }),
  submitTx: vi.fn().mockResolvedValue('0x5b36440f9c2d1b70d4218a09b389f41029c78103478912890a8910471289a0b1'),
};

describe('MidnightLaceConnect', () => {
  it('renders disconnected state and calls connect on click', () => {
    const connectMock = vi.fn();
    const wallet: MidnightWalletState = {
      isLaceAvailable: true,
      isConnected: false,
      isConnecting: false,
      network: 'preprod',
      addresses: null,
      balance: null,
      error: null,
      laceApi: null,
      connect: connectMock,
      disconnect: vi.fn(),
      switchNetwork: vi.fn(),
    };

    render(<MidnightLaceConnect wallet={wallet} />);
    expect(screen.getByText('Connect Lace Wallet')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Connect Lace Wallet'));
    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it('renders connected state with addresses and balance', () => {
    const disconnectMock = vi.fn();
    const wallet: MidnightWalletState = {
      isLaceAvailable: true,
      isConnected: true,
      isConnecting: false,
      network: 'preprod',
      addresses: {
        unshieldedAddress: 'mn_unshielded1234567890',
        shieldedAddress: 'mn_shieldedabcdef123456',
      },
      balance: { unshielded: 5000000000n, shielded: 10000000000n },
      error: null,
      laceApi: mockLaceApi,
      connect: vi.fn(),
      disconnect: disconnectMock,
      switchNetwork: vi.fn(),
    };

    render(<MidnightLaceConnect wallet={wallet} />);
    expect(screen.getByText(/mn_unshielded/i)).toBeInTheDocument();
    expect(screen.getByText('Disconnect')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Disconnect'));
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
});

describe('MidnightPrivacyInspector', () => {
  it('displays private witness and public state correctly', () => {
    const updateSecret = vi.fn();
    const regenSecret = vi.fn();

    render(
      <MidnightPrivacyInspector
        privateState={{
          localSecretKey: '0x1122334455667788990011223344556677889900112233445566778899001122',
          derivedPublicKey: '0x9988776655443322110099887766554433221100998877665544332211009988',
        }}
        traces={[]}
        onRegenerateSecret={regenSecret}
        onUpdateSecret={updateSecret}
      />
    );

    expect(screen.getByText('Observable Privacy Behavior Inspector')).toBeInTheDocument();
    expect(screen.getAllByText(/Private Witness/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Public Ledger State/i).length).toBeGreaterThan(0);
    expect(screen.getByText('0x9988776655443322110099887766554433221100998877665544332211009988')).toBeInTheDocument();
  });
});

describe('MidnightEscrowPanel', () => {
  beforeEach(() => {
    (window as unknown as { midnight?: unknown }).midnight = {
      mnLace: {
        enable: vi.fn().mockResolvedValue(mockLaceApi),
        isEnabled: vi.fn().mockResolvedValue(true),
        apiVersion: '1.0.0',
        name: 'Lace Midnight Wallet',
        icon: '',
      },
    };
  });

  afterEach(() => {
    delete (window as unknown as { midnight?: unknown }).midnight;
  });

  it('renders escrow panel and allows calling circuits with Lace connected', async () => {
    render(<MidnightEscrowPanel />);

    expect(screen.getByText('Midnight Compact Escrow State')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/mn_unshielded/i)).toBeInTheDocument();
    });

    const depositBtn = screen.getByText('1. circuit deposit()');
    fireEvent.click(depositBtn);

    await waitFor(() => {
      expect(screen.getByText(/Circuit: deposit\(\)/i)).toBeInTheDocument();
    });
  });
});

describe('MidnightFeedbackPanel', () => {
  beforeEach(() => {
    (window as unknown as { midnight?: unknown }).midnight = {
      mnLace: {
        enable: vi.fn().mockResolvedValue(mockLaceApi),
        isEnabled: vi.fn().mockResolvedValue(true),
        apiVersion: '1.0.0',
        name: 'Lace Midnight Wallet',
        icon: '',
      },
    };
  });

  afterEach(() => {
    delete (window as unknown as { midnight?: unknown }).midnight;
  });

  it('renders feedback protocol and allows submitting rating with nullifier tracking', async () => {
    const { MidnightFeedbackPanel } = await import('./MidnightFeedbackPanel');
    render(<MidnightFeedbackPanel />);

    expect(screen.getByText(/Anonymous Feedback & Survey Protocol/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit Anonymous Rating via ZK Circuit/i)).toBeInTheDocument();

    const submitBtn = screen.getByText(/Submit Anonymous Rating via ZK Circuit/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Anonymous feedback \(5 Stars, WORK_QUALITY\) confirmed on-chain!/i)).toBeInTheDocument();
    });
  });
});

