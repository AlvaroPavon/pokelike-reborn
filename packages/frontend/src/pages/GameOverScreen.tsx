export default function GameOverScreen() {
  return (
    <div className="screen game-over-screen">
      <div className="screen-content">
        <h1 className="game-over-title">GAME OVER</h1>
        <p className="game-over-stats">Your journey has ended...</p>
        <button className="pixel-button" type="button">
          Return to Title
        </button>
      </div>
    </div>
  );
}
