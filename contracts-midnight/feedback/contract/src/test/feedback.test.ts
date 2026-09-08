import { describe, it, expect } from 'vitest';
import { FeedbackSimulator } from './feedback-simulator.js';
import { FeedbackCategory } from '../../managed/feedback/contract/index.js';

const topic = new Uint8Array(32).fill(1);
const aliceSecret = new Uint8Array(32).fill(10);
const bobSecret = new Uint8Array(32).fill(20);
const charlieSecret = new Uint8Array(32).fill(30);

describe('StellarVault Anonymous Feedback Contract', () => {
  it('initializes with zero responses and empty nullifier', () => {
    const sim = new FeedbackSimulator(topic, aliceSecret);
    const ledger = sim.getLedger();

    expect(ledger.totalResponses).toBe(0n);
    expect(ledger.totalRatingSum).toBe(0n);
    expect(ledger.surveyTopic).toEqual(topic);
  });

  it('allows Alice to submit a valid rating and updates aggregate metrics', () => {
    const sim = new FeedbackSimulator(topic, aliceSecret);

    sim.submitRating(5n, FeedbackCategory.WORK_QUALITY);
    const ledger = sim.getLedger();

    expect(ledger.totalResponses).toBe(1n);
    expect(ledger.totalRatingSum).toBe(5n);
    expect(ledger.lastNullifier.length).toBe(32);
    expect(ledger.lastNullifier).not.toEqual(new Uint8Array(32));
  });

  it('enforces rating boundary: rejects rating less than 1 or greater than 5', () => {
    const sim = new FeedbackSimulator(topic, aliceSecret);

    expect(() => sim.submitRating(0n, FeedbackCategory.COMMUNICATION)).toThrow(
      /Rating must be between 1 and 5/i
    );
    expect(() => sim.submitRating(6n, FeedbackCategory.COMMUNICATION)).toThrow(
      /Rating must be between 1 and 5/i
    );
  });

  it('aggregates multiple independent anonymous submissions from different participants', () => {
    const sim = new FeedbackSimulator(topic, aliceSecret);

    // Alice rates 5
    sim.asParticipant(aliceSecret);
    sim.submitRating(5n, FeedbackCategory.COMMUNICATION);

    // Bob rates 4
    sim.asParticipant(bobSecret);
    sim.submitRating(4n, FeedbackCategory.PAYMENT_PROMPTNESS);

    // Charlie rates 5
    sim.asParticipant(charlieSecret);
    sim.submitRating(5n, FeedbackCategory.WORK_QUALITY);

    const ledger = sim.getLedger();
    expect(ledger.totalResponses).toBe(3n);
    expect(ledger.totalRatingSum).toBe(14n); // 5 + 4 + 5 = 14
  });

  it('produces distinct nullifiers for distinct participants preserving anonymity', () => {
    const sim = new FeedbackSimulator(topic, aliceSecret);

    sim.asParticipant(aliceSecret);
    sim.submitRating(5n, FeedbackCategory.GENERAL);
    const aliceNullifier = sim.getLedger().lastNullifier;

    sim.asParticipant(bobSecret);
    sim.submitRating(5n, FeedbackCategory.GENERAL);
    const bobNullifier = sim.getLedger().lastNullifier;

    expect(aliceNullifier).not.toEqual(bobNullifier);
  });
});
