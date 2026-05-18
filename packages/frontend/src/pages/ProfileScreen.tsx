/**
 * @fileoverview User profile and cloud synchronisation screen.
 *
 * Displays the authenticated user's email and cloud-sync status, and
 * provides buttons to manually trigger a sync or log out. Sync status
 * is shown as a timestamp or "Never" when no sync has occurred.
 *
 * @module ProfileScreen
 */

import { useCallback, useEffect, useState } from "react";
import { useAuthStore, type AuthUser } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";
import { getLastSyncTimestamp, syncToCloud } from "../utils/cloudSync";

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Format a Unix-epoch timestamp (ms) into a human-readable localised string.
 * Falls back to "Unknown" for invalid timestamps.
 */
function formatSyncTime(ts: number | null): string {
  if (ts === null || ts <= 0) return "Never";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "Unknown";
  }
}

/**
 * Truncate a JWT for display (show first and last few chars).
 * Helps debugging without exposing the full token.
 */
function maskToken(token: string): string {
  if (token.length <= 12) return token;
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

// ─── Status badge colours ─────────────────────────────────────────────────

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  idle: { color: "var(--color-text-secondary, #888)" },
  syncing: { color: "var(--color-accent-blue, #58a6ff)" },
  success: { color: "var(--color-success, #3fb950)" },
  error: { color: "var(--color-accent-red, #f85149)" },
};

// ─── Component ────────────────────────────────────────────────────────────

/**
 * Profile screen component.
 *
 * Renders the user's email, sync status, and action buttons.
 * Sync status updates reactively when a sync completes.
 */
export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useUIStore((s) => s.navigate);

  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [lastSync, setLastSync] = useState<number | null>(getLastSyncTimestamp);

  // Allow re-render when the user navigates back to this screen
  useEffect(() => {
    setLastSync(getLastSyncTimestamp());
    setSyncStatus("idle");
  }, []);

  const handleSyncNow = useCallback(async () => {
    setSyncStatus("syncing");
    try {
      const ok = await syncToCloud();
      setSyncStatus(ok ? "success" : "error");
      setLastSync(getLastSyncTimestamp());
    } catch {
      setSyncStatus("error");
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("title");
  }, [logout, navigate]);

  const handleBack = useCallback(() => {
    navigate("title");
  }, [navigate]);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="screen profile-screen">
      <div
        className="screen-content"
        style={{
          justifyContent: "center",
          gap: "var(--space-md)",
          padding: "var(--space-xl) var(--space-md)",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "clamp(1rem, 4vw, 1.5rem)",
              marginBottom: "var(--space-xs)",
            }}
          >
            Profile
          </h1>
        </div>

        {/* Decorative divider */}
        <div
          style={{
            width: "60%",
            maxWidth: "180px",
            height: "2px",
            backgroundColor: "var(--color-gold-dim, #c8a84e)",
            opacity: 0.5,
            alignSelf: "center",
          }}
        />

        {/* User info card */}
        <div
          className="card"
          style={{
            background: "var(--color-surface, #1a1a2e)",
            borderRadius: "8px",
            padding: "var(--space-md)",
            width: "100%",
            textAlign: "left",
          }}
        >
          {/* Email row */}
          <div style={{ marginBottom: "var(--space-sm, 8px)" }}>
            <span
              style={{
                fontSize: "0.5rem",
                color: "var(--color-text-secondary, #888)",
                display: "block",
                marginBottom: "2px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Email
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text, #e0e0e0)",
                wordBreak: "break-all",
              }}
            >
              {user?.email ?? "—"}
            </span>
          </div>

          {/* User ID row */}
          <div style={{ marginBottom: "var(--space-sm, 8px)" }}>
            <span
              style={{
                fontSize: "0.5rem",
                color: "var(--color-text-secondary, #888)",
                display: "block",
                marginBottom: "2px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              User ID
            </span>
            <span
              style={{
                fontSize: "0.6rem",
                color: "var(--color-text-dim, #666)",
                wordBreak: "break-all",
                fontFamily: "monospace",
              }}
            >
              {user?.userId ?? "—"}
            </span>
          </div>

          {/* Token preview row */}
          {token && (
            <div style={{ marginBottom: "var(--space-sm, 8px)" }}>
              <span
                style={{
                  fontSize: "0.5rem",
                  color: "var(--color-text-secondary, #888)",
                  display: "block",
                  marginBottom: "2px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Session Token
              </span>
              <span
                style={{
                  fontSize: "0.55rem",
                  color: "var(--color-text-dim, #666)",
                  fontFamily: "monospace",
                }}
              >
                {maskToken(token)}
              </span>
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: "1px",
              backgroundColor: "var(--color-border, #333)",
              margin: "var(--space-sm, 8px) 0",
            }}
          />

          {/* Cloud sync status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.5rem",
                  color: "var(--color-text-secondary, #888)",
                  display: "block",
                  marginBottom: "2px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Cloud Save
              </span>
              <span
                style={{
                  fontSize: "0.6rem",
                  color: "var(--color-text-dim, #666)",
                }}
              >
                Last sync: {formatSyncTime(lastSync)}
              </span>
            </div>
            <span
              style={{
                fontSize: "0.5rem",
                fontWeight: 700,
                textTransform: "uppercase",
                ...STATUS_STYLES[syncStatus],
              }}
              data-testid="sync-status"
            >
              {syncStatus === "idle" && "Ready"}
              {syncStatus === "syncing" && "Syncing…"}
              {syncStatus === "success" && "Saved"}
              {syncStatus === "error" && "Failed"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="menu-options"
          style={{ gap: "var(--space-sm)", width: "100%" }}
        >
          {/* Sync Now */}
          <button
            className="pixel-button"
            type="button"
            onClick={handleSyncNow}
            disabled={syncStatus === "syncing"}
            style={{
              maxWidth: "280px",
              borderColor: "var(--color-accent-blue, #58a6ff)",
              opacity: syncStatus === "syncing" ? 0.6 : 1,
            }}
            data-testid="sync-now-button"
          >
            {syncStatus === "syncing" ? "Syncing…" : "Sync Now"}
          </button>

          {/* Logout */}
          <button
            className="pixel-button"
            type="button"
            onClick={handleLogout}
            style={{
              maxWidth: "280px",
              borderColor: "var(--color-accent-red, #f85149)",
            }}
            data-testid="logout-button"
          >
            Log Out
          </button>

          {/* Back */}
          <button
            className="pixel-button"
            type="button"
            onClick={handleBack}
            style={{ maxWidth: "280px" }}
          >
            Back to Title
          </button>
        </div>
      </div>
    </div>
  );
}
