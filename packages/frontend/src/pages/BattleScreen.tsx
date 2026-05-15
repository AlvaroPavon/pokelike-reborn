export default function BattleScreen() {
  return (
    <div className="screen battle-screen">
      <div className="battle-scene">
        <div className="enemy-area placeholder">Enemy Pokemon</div>
        <div className="player-area placeholder">Player Pokemon</div>
      </div>
      <div className="battle-hud">
        <div className="battle-log placeholder">Battle Log</div>
        <div className="battle-actions">
          <button className="pixel-button" type="button">
            Fight
          </button>
          <button className="pixel-button" type="button">
            Pokemon
          </button>
          <button className="pixel-button" type="button">
            Items
          </button>
          <button className="pixel-button" type="button">
            Run
          </button>
        </div>
      </div>
    </div>
  );
}
