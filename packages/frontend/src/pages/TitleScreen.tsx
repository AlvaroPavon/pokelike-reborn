export default function TitleScreen() {
  return (
    <div className="screen title-screen">
      <div className="screen-content">
        <h1 className="game-title">POKELIKE REBORN</h1>
        <p className="subtitle">A Roguelike Pokemon Adventure</p>
        <div className="menu-options">
          <button className="pixel-button" type="button">
            New Game
          </button>
          <button className="pixel-button" type="button" disabled>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
