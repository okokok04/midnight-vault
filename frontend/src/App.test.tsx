import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

function mockFetchJson(path: string) {
  if (path.includes("graphql") || path.includes("midnight")) {
    return { data: { contract: null } };
  }
  if (path.endsWith("/escrows")) return [];
  if (path.endsWith("/feedback")) return [];
  if (path.endsWith("/stats")) {
    return {
      totalEscrows: 0,
      escrowsByStatus: {},
      totalLovelaceLocked: 0,
      totalFeedback: 0,
      averageRating: null,
    };
  }
  throw new Error(`unexpected fetch: ${path}`);
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = typeof input === "string" ? input : input.toString();
        return {
          ok: true,
          json: async () => mockFetchJson(url),
        } as Response;
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders Midnight ZK escrow panel by default and switches to Cardano tab", async () => {
    render(<App />);

    expect(screen.getByText("MidnightVault")).toBeInTheDocument();
    expect(screen.getByText(/Midnight Privacy Escrow/i)).toBeInTheDocument();
    expect(screen.getByText("Midnight Compact Escrow State")).toBeInTheDocument();

    // Switch to Cardano tab
    const cardanoTab = screen.getByText(/Cardano Preprod Escrow/i);
    fireEvent.click(cardanoTab);

    expect(screen.getByText("New milestone escrow")).toBeInTheDocument();
    expect(screen.getByText("Leave feedback")).toBeInTheDocument();
    expect(
      await screen.findByText(/no escrows yet/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/no feedback yet/i)).toBeInTheDocument();
  });
});
