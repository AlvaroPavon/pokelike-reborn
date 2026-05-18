/**
 * @fileoverview Rendering tests for ProfileScreen.
 *
 * Verifies that user data (email, userId) is displayed, the sync button
 * is present, sync status renders correctly, and logout navigates back
 * to the title screen.
 *
 * @module
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ProfileScreen from "../ProfileScreen";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";

// ─── Mocks ───────────────────────────────────────────────────────────────

// Mock cloudSync so tests don't make real HTTP calls
vi.mock("../../utils/cloudSync", async () => {
  const actual = await vi.importActual<typeof import("../../utils/cloudSync")>(
    "../../utils/cloudSync",
  );

  return {
    ...actual,
    syncToCloud: vi.fn(),
  };
});

import { syncToCloud } from "../../utils/cloudSync";

// ─── Test user ────────────────────────────────────────────────────────────

const TEST_USER = {
  userId: "test-user-123",
  email: "trainer@example.com",
  createdAt: 1715000000000,
};

// ─── Helper ───────────────────────────────────────────────────────────────

function renderProfile() {
  return render(<ProfileScreen />);
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe("ProfileScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Set authenticated user state
    useAuthStore.setState({
      token: "test-jwt-token",
      user: TEST_USER,
      loading: false,
      error: null,
    });

    useUIStore.setState({
      currentScreen: "profile",
    });
  });

  it("renders the profile header", () => {
    renderProfile();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("displays the user email", () => {
    renderProfile();
    expect(screen.getByText("trainer@example.com")).toBeInTheDocument();
  });

  it("displays the user ID", () => {
    renderProfile();
    expect(screen.getByText("test-user-123")).toBeInTheDocument();
  });

  it("renders the Sync Now button", () => {
    renderProfile();
    const btn = screen.getByTestId("sync-now-button");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent("Sync Now");
  });

  it("renders the Log Out button", () => {
    renderProfile();
    const btn = screen.getByTestId("logout-button");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent("Log Out");
  });

  it("renders the Back to Title button", () => {
    renderProfile();
    expect(screen.getByText("Back to Title")).toBeInTheDocument();
  });

  it("shows sync status as Ready when idle", () => {
    renderProfile();
    expect(screen.getByTestId("sync-status")).toHaveTextContent("Ready");
  });

  it("shows Never when no sync timestamp exists", () => {
    renderProfile();
    // "Never" is inside a "Last sync: Never" span — use substring match
    expect(screen.getByText(/Never/)).toBeInTheDocument();
  });

  it("shows formatted timestamp when a sync has occurred", () => {
    const ts = 1715000000000;
    localStorage.setItem("pokelike-cloud-sync-at", ts.toString());

    renderProfile();

    // Should show localized date for the stored timestamp
    // The timestamp is inside a "Last sync: <formatted date>" span — use substring match
    const expectedDate = new Date(ts).toLocaleString();
    expect(screen.getByText(new RegExp(expectedDate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))).toBeInTheDocument();
  });

  it("calls syncToCloud when Sync Now is clicked", async () => {
    vi.mocked(syncToCloud).mockResolvedValue(true);

    renderProfile();

    const btn = screen.getByTestId("sync-now-button");
    await act(async () => {
      fireEvent.click(btn);
    });

    expect(syncToCloud).toHaveBeenCalledTimes(1);
  });

  it("shows syncing status while sync is in progress", async () => {
    // Return a promise that doesn't resolve immediately
    vi.mocked(syncToCloud).mockImplementation(
      () => new Promise<boolean>(() => {}),
    );

    renderProfile();

    const btn = screen.getByTestId("sync-now-button");
    await act(async () => {
      fireEvent.click(btn);
    });

    expect(screen.getByTestId("sync-status")).toHaveTextContent("Syncing…");
  });

  it("logs out and navigates to title on Log Out click", async () => {
    const navigateSpy = vi.fn();
    useUIStore.setState({ currentScreen: "profile" });
    // Replace navigate with a spy
    const originalNavigate = useUIStore.getState().navigate;
    useUIStore.setState({
      navigate: navigateSpy,
    });

    renderProfile();

    await act(async () => {
      fireEvent.click(screen.getByTestId("logout-button"));
    });

    // Auth state should be cleared
    const authState = useAuthStore.getState();
    expect(authState.token).toBeNull();
    expect(authState.user).toBeNull();

    // Should have navigated to title
    expect(navigateSpy).toHaveBeenCalledWith("title");

    // Restore
    useUIStore.setState({ navigate: originalNavigate });
  });
});
