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

export default function App() {
  const currentScreen = useUIStore((s) => s.currentScreen);

  const ScreenComponent = screenComponents[currentScreen];

  if (!ScreenComponent) {
    return (
      <div className="screen-error">
        <h1>Unknown Screen</h1>
        <p>The screen "{currentScreen}" does not exist.</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <ScreenComponent />
    </div>
  );
}
