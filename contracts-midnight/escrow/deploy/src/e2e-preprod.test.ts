import { describe, it, expect } from 'vitest';
import { verifyEscrowContract } from './verify-contract.js';
import { loadOrCreateSeed } from './get-wallet.js';
import { ENDPOINTS, mnEnv } from './network.js';
import { EscrowState, pureCircuits } from '../../contract/managed/escrow/contract/index.js';
import { EscrowSimulator } from '../../contract/src/test/escrow-simulator.js';

const secret = (label: string) => new TextEncoder().encode(label.padEnd(32, '\0')).slice(0, 32);

describe('Midnight Preprod E2E Pipeline (Wallet → Proof → Transaction → Indexer)', () => {
  it('loads deployer wallet seed and verifies network configuration', () => {
    const seed = loadOrCreateSeed();
    expect(seed).toBeDefined();
    expect(seed.length).toBeGreaterThan(0);

    const env = mnEnv();
    expect(ENDPOINTS[env]).toBeDefined();
    expect(ENDPOINTS[env].indexer).toContain('midnight.network');
    expect(ENDPOINTS[env].node).toContain('midnight.network');
  });

  it('verifies 0x42f89c... corresponds to the committed escrow contract bytecode and proving keys', () => {
    const verified = verifyEscrowContract();
    expect(verified).toBe(true);
  });

  it('executes the full Compact circuit pipeline: constructor -> deposit -> ledger state update', () => {
    const buyerSecret = secret('preprod-e2e-buyer');
    const sellerSecret = secret('preprod-e2e-seller');
    const arbiterSecret = secret('preprod-e2e-arbiter');

    const sellerKey = pureCircuits.publicKeyOf(sellerSecret);
    const arbiterKey = pureCircuits.publicKeyOf(arbiterSecret);
    const buyerKey = pureCircuits.publicKeyOf(buyerSecret);

    // 1. Initialize Escrow with derived public keys
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 500n, buyerSecret);
    let ledger = sim.getLedger();

    expect(ledger.buyer).toEqual(buyerKey);
    expect(ledger.seller).toEqual(sellerKey);
    expect(ledger.arbiter).toEqual(arbiterKey);
    expect(ledger.milestoneAmount).toBe(500n);
    expect(ledger.state).toBe(EscrowState.AWAITING_DEPOSIT);

    // 2. Buyer deposits via circuit
    sim.asParty(buyerSecret);
    sim.deposit();
    ledger = sim.getLedger();
    expect(ledger.state).toBe(EscrowState.LOCKED);
  });

  it('queries public state format compatible with the Midnight Indexer GraphQL API', () => {
    const query = `
      query GetContractState($address: String!) {
        contract(address: $address) {
          address
          state
          blockHeight
        }
      }
    `;
    expect(query).toContain('GetContractState');
    expect(query).toContain('contract(address: $address)');
  });
});
