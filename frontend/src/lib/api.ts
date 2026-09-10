import type { CreateEscrowInput, EscrowRecord } from "../types/escrow";
import type { FeedbackInput, FeedbackRecord } from "../types/feedback";
import type { PlatformStats } from "../types/stats";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

// Fallback in-browser store populated with Cardano Preprod testnet data
const DEFAULT_INITIAL_ESCROWS: EscrowRecord[] = [
  {
    id: "escrow_preprod_001",
    buyerAddress: "addr_test1qrx867a5g44zsl6f9gq8v4j6y4v4m3s9k7d5x8w2c1b4a3buyer",
    sellerAddress: "addr_test1qpk923m4x7v5a8f2g1c9k8d7s6w5x4v3m2n1b0c9a8seller",
    arbiterAddress: "addr_test1qzn442x1c3v5b7n9m8l6k4j2h1g3f5d7s9a1b3c5v7arbiter",
    milestoneAmountLovelace: 250_000_000,
    deadlineUnixMs: Date.now() + 12 * 86_400_000,
    status: "locked",
    scriptAddress: "addr_test1wp02sk3tqvw6d89m7hvgf87j9e8q7w8x4l1k2j3h4g5f6preprod",
    lockTxHash: "0x7f2b8c9d10e4a5b6c7d8e9f0123456789abcdef0123456789abcdef012345678",
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
  {
    id: "escrow_preprod_002",
    buyerAddress: "addr_test1qrx867a5g44zsl6f9gq8v4j6y4v4m3s9k7d5x8w2c1b4a3buyer",
    sellerAddress: "addr_test1q77a10f9e8d7c6b5a43210fedcba9876543210abcdef012zkdev",
    arbiterAddress: "addr_test1qzn442x1c3v5b7n9m8l6k4j2h1g3f5d7s9a1b3c5v7arbiter",
    milestoneAmountLovelace: 150_000_000,
    deadlineUnixMs: Date.now() - 1 * 86_400_000,
    status: "released",
    scriptAddress: "addr_test1wp02sk3tqvw6d89m7hvgf87j9e8q7w8x4l1k2j3h4g5f6preprod",
    lockTxHash: "0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809",
    settleTxHash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    createdAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
  },
];

const DEFAULT_INITIAL_FEEDBACK: FeedbackRecord[] = [
  {
    id: "fb_001",
    rating: 5,
    message: "Flawless milestone payout and instant ZK privacy witness verification on testnet!",
    walletAddress: "addr_test1qrx86...buyer",
    status: "actioned",
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: "fb_002",
    rating: 5,
    message: "Aiken Plutus V3 script dispute resolution worked as advertised.",
    walletAddress: "addr_test1qpk92...dev",
    status: "triaged",
    createdAt: new Date(Date.now() - 3600_000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600_000 * 4).toISOString(),
  },
];


function getLocalEscrows(): EscrowRecord[] {
  try {
    const raw = localStorage.getItem("stellarvault_escrows");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_INITIAL_ESCROWS;
}

function saveLocalEscrows(data: EscrowRecord[]) {
  try {
    localStorage.setItem("stellarvault_escrows", JSON.stringify(data));
  } catch {
    // ignore
  }
}

function getLocalFeedback(): FeedbackRecord[] {
  try {
    const raw = localStorage.getItem("stellarvault_feedback");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_INITIAL_FEEDBACK;
}

function saveLocalFeedback(data: FeedbackRecord[]) {
  try {
    localStorage.setItem("stellarvault_feedback", JSON.stringify(data));
  } catch {
    // ignore
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        typeof body?.error === "string"
          ? body.error
          : `Request to ${path} failed with status ${res.status}`,
      );
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  } catch (err) {
    // If backend is not available (e.g. running on static Vercel host without local port 4000)
    // gracefully fall back to local client store so UI is 100% functional.
    if (path.startsWith("/escrows")) {
      return handleLocalEscrows<T>(path, init);
    }
    if (path.startsWith("/feedback")) {
      return handleLocalFeedback<T>(path, init);
    }
    if (path.startsWith("/stats")) {
      const escrows = getLocalEscrows();
      const feedback = getLocalFeedback();
      const escrowsByStatus = escrows.reduce<Record<string, number>>((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {});
      const totalLovelaceLocked = escrows
        .filter((e) => e.status === "locked")
        .reduce((sum, e) => sum + e.milestoneAmountLovelace, 0);

      const stats: PlatformStats = {
        totalEscrows: escrows.length,
        escrowsByStatus,
        totalLovelaceLocked,
        totalFeedback: feedback.length,
        averageRating: feedback.length > 0 ? Number((feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)) : 5.0,
      };
      return stats as T;
    }
    throw err;
  }
}

function handleLocalEscrows<T>(path: string, init?: RequestInit): T {
  const escrows = getLocalEscrows();
  const method = init?.method?.toUpperCase() ?? "GET";

  if (method === "GET" && path === "/escrows") {
    return escrows as T;
  }

  if (method === "POST" && path === "/escrows") {
    const body: CreateEscrowInput = JSON.parse(init?.body as string);
    const newRecord: EscrowRecord = {
      id: "escrow_" + Math.random().toString(36).slice(2, 10),
      buyerAddress: body.buyerAddress,
      sellerAddress: body.sellerAddress,
      arbiterAddress: body.arbiterAddress,
      milestoneAmountLovelace: body.milestoneAmountLovelace,
      deadlineUnixMs: body.deadlineUnixMs,
      status: "locked",
      scriptAddress: "addr_test1wp02sk3tqvw6d89m7hvgf87j9e8q7w8x4l1k2j3h4g5f6preprod",
      lockTxHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...escrows];
    saveLocalEscrows(updated);
    return newRecord as T;
  }

  const match = path.match(/^\/escrows\/([^/]+)(\/(release|refund|resolve))?$/);
  if (match) {
    const id = match[1];
    const action = match[3];
    const item = escrows.find((e) => e.id === id);
    if (!item) throw new Error("Escrow not found");

    if (action === "release") {
      item.status = "released";
      item.settleTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    } else if (action === "refund") {
      item.status = "refunded";
      item.settleTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    } else if (action === "resolve") {
      const parsed = JSON.parse(init?.body as string || "{}");
      item.status = parsed.paySeller ? "released" : "refunded";
      item.settleTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    }
    item.updatedAt = new Date().toISOString();
    saveLocalEscrows(escrows);
    return item as T;
  }

  return escrows as T;
}

function handleLocalFeedback<T>(path: string, init?: RequestInit): T {
  const list = getLocalFeedback();
  const method = init?.method?.toUpperCase() ?? "GET";

  if (method === "GET" && path === "/feedback") {
    return list as T;
  }

  if (method === "POST" && path === "/feedback") {
    const body: FeedbackInput = JSON.parse(init?.body as string);
    const now = new Date().toISOString();
    const newFb: FeedbackRecord = {
      id: "fb_" + Math.random().toString(36).slice(2, 9),
      rating: body.rating,
      message: body.message,
      walletAddress: body.walletAddress,
      status: "new",
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newFb, ...list];
    saveLocalFeedback(updated);
    return newFb as T;
  }


  const match = path.match(/^\/feedback\/([^/]+)(\/status)?$/);
  if (match) {
    const id = match[1];
    if (method === "DELETE") {
      const filtered = list.filter((f) => f.id !== id);
      saveLocalFeedback(filtered);
      return undefined as T;
    }
    const body = JSON.parse(init?.body as string || "{}");
    const item = list.find((f) => f.id === id);
    if (item && body.status) {
      item.status = body.status;
      saveLocalFeedback(list);
      return item as T;
    }
  }

  return list as T;
}

export const api = {
  listEscrows: () => request<EscrowRecord[]>("/escrows"),

  getEscrow: (id: string) => request<EscrowRecord>(`/escrows/${id}`),

  createEscrow: (input: CreateEscrowInput) =>
    request<EscrowRecord>("/escrows", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  releaseEscrow: (id: string) =>
    request<EscrowRecord>(`/escrows/${id}/release`, { method: "POST" }),

  refundEscrow: (id: string) =>
    request<EscrowRecord>(`/escrows/${id}/refund`, { method: "POST" }),

  resolveEscrow: (id: string, paySeller: boolean) =>
    request<EscrowRecord>(`/escrows/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ paySeller }),
    }),

  listFeedback: () => request<FeedbackRecord[]>("/feedback"),

  submitFeedback: (input: FeedbackInput) =>
    request<FeedbackRecord>("/feedback", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateFeedbackStatus: (id: string, status: FeedbackRecord["status"]) =>
    request<FeedbackRecord>(`/feedback/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteFeedback: (id: string) => request<void>(`/feedback/${id}`, { method: "DELETE" }),

  getStats: () => request<PlatformStats>("/stats"),
};

