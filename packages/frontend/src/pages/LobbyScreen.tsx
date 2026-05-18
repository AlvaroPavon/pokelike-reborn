import { useMultiplayerBattle } from "../game/hooks/useMultiplayerBattle";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";

/** Multiplayer lobby screen for server-side 3v3 matchmaking. */
export default function LobbyScreen() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const status = useUIStore((s) => s.multiplayerStatus);
  const navigate = useUIStore((s) => s.navigate);
  const { searching, queuePosition, error, joinQueue, leaveQueue } = useMultiplayerBattle();

  if (!token) {
    return (
      <div className="screen lobby-screen">
        <div className="screen-content" style={{ justifyContent: "center", gap: "var(--space-md)" }}>
          <h1 className="screen-title">MULTIPLAYER</h1>
          <p className="subtitle">Login required for ranked 3v3 battles.</p>
          <button className="pixel-button" type="button" onClick={() => navigate("title")}>
            Back to Title
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen lobby-screen">
      <div className="screen-content" style={{ justifyContent: "center", gap: "var(--space-md)" }}>
        <h1 className="screen-title">3v3 MULTIPLAYER</h1>
        <p className="subtitle">Server-authoritative auto-battle</p>

        <div className="panel" style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontSize: "0.55rem" }}>Signed in as</p>
          <p style={{ color: "var(--color-accent-blue, #58a6ff)", wordBreak: "break-all" }}>
            {user?.email ?? "Unknown trainer"}
          </p>
          <p style={{ fontSize: "0.55rem", marginTop: "var(--space-sm)" }}>
            Status: {status.toUpperCase()}
          </p>
          {queuePosition !== null && (
            <p style={{ fontSize: "0.55rem" }}>Queue position: {queuePosition}</p>
          )}
          {error && <p style={{ color: "var(--color-accent-red, #ff6b6b)" }}>{error}</p>}
        </div>

        {!searching ? (
          <button className="pixel-button" type="button" onClick={joinQueue}>
            Find Match
          </button>
        ) : (
          <button className="pixel-button" type="button" onClick={leaveQueue}>
            Cancel Search
          </button>
        )}

        <button className="pixel-button" type="button" onClick={() => navigate("title")}>
          Back
        </button>
      </div>
    </div>
  );
}
