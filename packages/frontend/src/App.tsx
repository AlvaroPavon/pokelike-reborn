import { useEffect, useRef, useState } from "react";
import { useUIStore } from "./stores/uiStore";
import TitleScreen from "./pages/TitleScreen";
import TrainerSelectScreen from "./pages/TrainerSelectScreen";
import StarterSelectScreen from "./pages/StarterSelectScreen";
import MapScreen from "./pages/MapScreen";
import BattleScreen from "./pages/BattleScreen";
import CatchScreen from "./pages/CatchScreen";
import ItemScreen from "./pages/ItemScreen";
import GameOverScreen from "./pages/GameOverScreen";
import WinScreen from "./pages/WinScreen";

import type { ScreenId } from "./stores/uiStore";

const screenComponents: Record<ScreenId, React.FC> = {
  title: TitleScreen,
  trainer_select: TrainerSelectScreen,
  starter_select: StarterSelectScreen,
  map: MapScreen,
  battle: BattleScreen,
  catch: CatchScreen,
  item: ItemScreen,
  game_over: GameOverScreen,
  win: WinScreen,
};

/**
 * App — Root component with screen routing and fade transitions.
 *
 * Renders the current screen based on uiStore.currentScreen.
 * Wraps screen transitions in a fade animation for a polished feel.
 */
export default function App() {
  const currentScreen = useUIStore((s) => s.currentScreen);
  const [displayedScreen, setDisplayedScreen] = useState(currentScreen);
  const [transitioning, setTransitioning] = useState(false);
  const prevScreenRef = useRef(currentScreen);

  // Handle screen transitions
  useEffect(() => {
    if (prevScreenRef.current !== currentScreen) {
      setTransitioning(true);
      const timeout = setTimeout(() => {
        setDisplayedScreen(currentScreen);
        setTransitioning(false);
        prevScreenRef.current = currentScreen;
      }, 150); // Half the CSS animation duration for smooth feel
      return () => clearTimeout(timeout);
    }
  }, [currentScreen]);

  const ScreenComponent = screenComponents[displayedScreen];

  if (!ScreenComponent) {
    return (
      <div className="screen-error">
        <h1>Unknown Screen</h1>
        <p>The screen "{displayedScreen}" does not exist.</p>
        <button
          className="pixel-button"
          type="button"
          onClick={() => useUIStore.getState().navigate("title")}
          style={{ maxWidth: "200px" }}
        >
          Return to Title
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.15s ease-in-out",
        }}
      >
        <ScreenComponent />
      </div>
    </div>
  );
}
