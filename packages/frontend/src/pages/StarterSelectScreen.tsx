export default function StarterSelectScreen() {
  return (
    <div className="screen starter-select-screen">
      <div className="screen-content">
        <h2 className="screen-title">Choose Your Starter</h2>
        <div className="starter-options">
          <button className="pixel-button starter-card" type="button">
            <div className="pokemon-sprite placeholder">???</div>
            <span className="pokemon-name">Fire</span>
          </button>
          <button className="pixel-button starter-card" type="button">
            <div className="pokemon-sprite placeholder">???</div>
            <span className="pokemon-name">Water</span>
          </button>
          <button className="pixel-button starter-card" type="button">
            <div className="pokemon-sprite placeholder">???</div>
            <span className="pokemon-name">Grass</span>
          </button>
        </div>
      </div>
    </div>
  );
}
