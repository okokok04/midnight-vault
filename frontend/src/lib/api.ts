import type { CreateEscrowInput, EscrowRecord } from "../types/escrow";
import type { FeedbackInput, FeedbackRecord } from "../types/feedback";
import type { PlatformStats } from "../types/stats";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

// Initial realistic demo seed data for client-side fallback
const DEFAULT_ESCROWS: EscrowRecord[] = [
  {
    id: "escrow_demo_001",
    buyerAddress: "addr_test1qrx86kzkf8t7g0e2u3y5w6r8m9p4q1s2t3u4v5w6x7y8z9a",
    sellerAddress: "addr_test1qpk92mztv1a3c5e7g9i2k4m6o8q0s2u4w6y8a0c2e4g6i8k",
    arbiterAddress: "addr_test1qzn44rswx2b4d6f8h0j2l4n6p8r0t2v4x6z8b0d2f4h6j8l",
    milestoneAmountLovelace: 250_000_000,
    deadlineUnixMs: Date.now() + 7 * 86_400_000,
    status: "locked",
    scriptAddress: "addr_test1wprq7tzn4y2m6k8p0s2u4v6x8z0b2d4f6h8j0l2n4p6r8t0",
    lockTxHash: "0x89a3769c4f1e2b8d0a7c6e5f4d3b2a19876543210fedcba98765432101234567",
    createdAt: new Date(Date.now() - 3600_000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600_000 * 5).toISOString(),
  },
  {
    id: "escrow_demo_002",
    buyerAddress: "addr_test1qrx86kzkf8t7g0e2u3y5w6r8m9p4q1s2t3u4v5w6x7y8z9a",
    sellerAddress: "addr_test1q77a1p9xk3m5v7w9y1b3d5f7h9j1l3n5p7r9t1v3x5z7b9d",
    arbiterAddress: "addr_test1qzn44rswx2b4d6f8h0j2l4n6p8r0t2v4x6z8b0d2f4h6j8l",
    milestoneAmountLovelace: 150_000_000,
    deadlineUnixMs: Date.now() - 3600_000 * 2,
    status: "released",
    scriptAddress: "addr_test1wprq7tzn4y2m6k8p0s2u4v6x8z0b2d4f6h8j0l2n4p6r8t0",
    lockTxHash: "0x46a6fd7b1c3e5a7d9f0b2d4e6f8a0c2e4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4",
    settleTxHash: "0x28f0a07c3e5a7b9d1f3e5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7",
    createdAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600_000 * 2).toISOString(),
  },
];

const DEFAULT_FEEDBACK: FeedbackRecord[] = [
  {
    id: "fb_demo_001",
    rating: 5,
    message: "Zero-Knowledge selective disclosure is phenomenal. Milestone released without leaking arbiter key.",
    createdAt: new Date(Date.now() - 3600_000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600_000 * 12).toISOString(),
    walletAddress: "addr_test1qrx86kzkf8t7g0e2u3y5w6r8m9p4",
    status: "actioned",
  },
  {
    id: "fb_demo_002",
    rating: 5,
    message: "Aiken Plutus V3 validator executed seamlessly on Cardano Preprod. Fast settlement.",
    createdAt: new Date(Date.now() - 3600_000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600_000 * 24).toISOString(),
    walletAddress: "addr_test1qpk92mztv1a3c5e7g9i2k4m6o8q0",
    status: "triaged",
  },
];


function getLocalEscrows(): EscrowRecord[] {
  try {
    const raw = localStorage.getItem("midnightvault_escrows") || localStorage.getItem("stellarvault_escrows");
    if (!raw) {
      localStorage.setItem("midnightvault_escrows", JSON.stringify(DEFAULT_ESCROWS));
      return DEFAULT_ESCROWS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ESCROWS;
  }
}

function saveLocalEscrows(escrows: EscrowRecord[]): void {
  try {
    localStorage.setItem("midnightvault_escrows", JSON.stringify(escrows));
  } catch {
    // Ignore storage quota
  }
}

function getLocalFeedback(): FeedbackRecord[] {
  try {
    const raw = localStorage.getItem("midnightvault_feedback") || localStorage.getItem("stellarvault_feedback");
    if (!raw) {
      localStorage.setItem("midnightvault_feedback", JSON.stringify(DEFAULT_FEEDBACK));
      return DEFAULT_FEEDBACK;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FEEDBACK;
  }
}

function saveLocalFeedback(feedback: FeedbackRecord[]): void {
  try {
    localStorage.setItem("midnightvault_feedback", JSON.stringify(feedback));
  } catch {
    // Ignore storage quota
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
    // Graceful fallback for standalone client-side demo when backend is offline
    if (path.startsWith("/escrows")) {
      return handleLocalEscrows<T>(path, init);
    }
    if (path.startsWith("/feedback")) {
      return handleLocalFeedback<T>(path, init);
    }
    if (path === "/stats") {
      const escrows = getLocalEscrows();
      const feedback = getLocalFeedback();
      const escrowsByStatus: Record<string, number> = {};
      for (const e of escrows) {
        escrowsByStatus[e.status] = (escrowsByStatus[e.status] || 0) + 1;
      }
      const totalRatings = feedback.reduce((sum, f) => sum + f.rating, 0);
      const stats: PlatformStats = {
        totalEscrows: escrows.length,
        escrowsByStatus,
        totalLovelaceLocked: escrows.reduce((sum, e) => sum + e.milestoneAmountLovelace, 0),
        totalFeedback: feedback.length,
        averageRating: feedback.length > 0 ? Number((totalRatings / feedback.length).toFixed(1)) : null,
      };
      return stats as T;
    }
    throw err;
  }
}

function handleLocalEscrows<T>(path: string, init?: RequestInit): T {
  const escrows = getLocalEscrows();

  if (path === "/escrows" && (!init || init.method === "GET")) {
    return escrows as T;
  }

  if (path === "/escrows" && init?.method === "POST") {
    const body: CreateEscrowInput = JSON.parse(init.body as string);
    const newEscrow: EscrowRecord = {
      id: `escrow_${Math.random().toString(36).slice(2, 10)}`,
      buyerAddress: body.buyerAddress,
      sellerAddress: body.sellerAddress,
      arbiterAddress: body.arbiterAddress,
      milestoneAmountLovelace: body.milestoneAmountLovelace,
      deadlineUnixMs: body.deadlineUnixMs,
      status: "locked",
      scriptAddress: "addr_test1wprq7tzn4y2m6k8p0s2u4v6x8z0b2d4f6h8j0l2n4p6r8t0",
      lockTxHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveLocalEscrows([...escrows, newEscrow]);
    return newEscrow as T;
  }

  const releaseMatch = path.match(/^\/escrows\/([^/]+)\/release$/);
  if (releaseMatch) {
    const id = releaseMatch[1];
    const updated = escrows.map((e) =>
      e.id === id
        ? {
            ...e,
            status: "released" as const,
            settleTxHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
            updatedAt: new Date().toISOString(),
          }
        : e,
    );
    saveLocalEscrows(updated);
    return updated.find((e) => e.id === id) as T;
  }

  const refundMatch = path.match(/^\/escrows\/([^/]+)\/refund$/);
  if (refundMatch) {
    const id = refundMatch[1];
    const updated = escrows.map((e) =>
      e.id === id
        ? {
            ...e,
            status: "refunded" as const,
            settleTxHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
            updatedAt: new Date().toISOString(),
          }
        : e,
    );
    saveLocalEscrows(updated);
    return updated.find((e) => e.id === id) as T;
  }

  const resolveMatch = path.match(/^\/escrows\/([^/]+)\/resolve$/);
  if (resolveMatch) {
    const id = resolveMatch[1];
    const updated = escrows.map((e) =>
      e.id === id
        ? {
            ...e,
            status: "resolved" as const,
            settleTxHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
            updatedAt: new Date().toISOString(),
          }
        : e,
    );
    saveLocalEscrows(updated);
    return updated.find((e) => e.id === id) as T;
  }

  return escrows as T;
}

function handleLocalFeedback<T>(path: string, init?: RequestInit): T {
  const list = getLocalFeedback();

  if (path === "/feedback" && (!init || init.method === "GET")) {
    return list as T;
  }

  if (path === "/feedback" && init?.method === "POST") {
    const body: FeedbackInput = JSON.parse(init.body as string);
    const now = new Date().toISOString();
    const newFb: FeedbackRecord = {
      id: `fb_${Math.random().toString(36).slice(2, 10)}`,
      rating: body.rating,
      message: body.message,
      createdAt: now,
      updatedAt: now,
      walletAddress: body.walletAddress,
      status: "new",
    };
    saveLocalFeedback([...list, newFb]);
    return newFb as T;
  }


  const statusMatch = path.match(/^\/feedback\/([^/]+)\/status$/);
  if (statusMatch) {
    const id = statusMatch[1];
    const { status } = JSON.parse(init?.body as string);
    const updated = list.map((f) => (f.id === id ? { ...f, status } : f));
    saveLocalFeedback(updated);
    return updated.find((f) => f.id === id) as T;
  }

  const deleteMatch = path.match(/^\/feedback\/([^/]+)$/);
  if (deleteMatch && init?.method === "DELETE") {
    const id = deleteMatch[1];
    const filtered = list.filter((f) => f.id !== id);
    saveLocalFeedback(filtered);
    return undefined as T;
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

