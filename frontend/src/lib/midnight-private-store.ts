import { generateRandomSecret } from './midnight-crypto';

const STORAGE_KEYS = {
  ESCROW_PRIVATE_SECRET: 'stellarvault:midnight:escrow_secret',
  FEEDBACK_PARTICIPANT_SECRET: 'stellarvault:midnight:feedback_secret',
  CONSUMED_NULLIFIERS: 'stellarvault:midnight:consumed_nullifiers',
  TRANSACTION_HISTORY: 'stellarvault:midnight:tx_history',
};

export class MidnightPrivateStore {
  /**
   * Retrieves or initializes the persistent private escrow secret key.
   */
  static getEscrowSecret(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ESCROW_PRIVATE_SECRET);
      if (stored && /^0x[0-9a-fA-F]{64}$/.test(stored)) {
        return stored;
      }
    } catch {
      // In non-browser/test environments
    }
    const fresh = generateRandomSecret();
    MidnightPrivateStore.setEscrowSecret(fresh);
    return fresh;
  }

  static generateFreshEscrowSecret(): string {
    const fresh = generateRandomSecret();
    MidnightPrivateStore.setEscrowSecret(fresh);
    return fresh;
  }

  static setEscrowSecret(secret: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ESCROW_PRIVATE_SECRET, secret);
    } catch {
      // Ignore in restricted environments
    }
  }

  /**
   * Retrieves or initializes the persistent feedback participant secret token.
   */
  static getFeedbackParticipantSecret(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FEEDBACK_PARTICIPANT_SECRET);
      if (stored && /^0x[0-9a-fA-F]{64}$/.test(stored)) {
        return stored;
      }
    } catch {
      // Non-browser / test
    }
    const fresh = generateRandomSecret();
    MidnightPrivateStore.setFeedbackParticipantSecret(fresh);
    return fresh;
  }

  static generateFreshFeedbackSecret(): string {
    const fresh = generateRandomSecret();
    MidnightPrivateStore.setFeedbackParticipantSecret(fresh);
    return fresh;
  }

  static setFeedbackParticipantSecret(secret: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FEEDBACK_PARTICIPANT_SECRET, secret);
    } catch {
      // Ignore
    }
  }

  /**
   * Compute deterministic nullifier for a given participant secret and topic
   */
  static async computeNullifier(secret: string, surveyTopic: string): Promise<string> {
    const cleanSecret = secret.replace(/^0x/, '').padStart(64, '0').slice(0, 64);
    const cleanTopic = surveyTopic.replace(/^0x/, '').padStart(64, '0').slice(0, 64);
    const prefix = new TextEncoder().encode('stellarvault:feedback:nullifier:');
    const paddedPrefix = new Uint8Array(32);
    paddedPrefix.set(prefix);

    const secretBytes = new Uint8Array(
      cleanSecret.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
    );
    const topicBytes = new Uint8Array(
      cleanTopic.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
    );

    const combined = new Uint8Array(96);
    combined.set(paddedPrefix, 0);
    combined.set(secretBytes, 32);
    combined.set(topicBytes, 64);

    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Consumed nullifier registry
   */
  static getConsumedNullifiers(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONSUMED_NULLIFIERS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    return [];
  }

  static recordConsumedNullifier(nullifier: string): void {
    try {
      const current = MidnightPrivateStore.getConsumedNullifiers();
      if (!current.includes(nullifier)) {
        current.unshift(nullifier);
        localStorage.setItem(STORAGE_KEYS.CONSUMED_NULLIFIERS, JSON.stringify(current.slice(0, 100)));
      }
    } catch {
      // Fallback
    }
  }

  static isNullifierConsumed(nullifier: string): boolean {
    const consumed = MidnightPrivateStore.getConsumedNullifiers();
    return consumed.includes(nullifier);
  }
}
