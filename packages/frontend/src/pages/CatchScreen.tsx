export default function CatchScreen() {
  return (
    <div className="screen catch-screen">
      <div className="screen-content">
        <div className="wild-pokemon-area placeholder">
          Wild Pokemon Encounter
        </div>
        <div className="catch-actions">
          <button className="pixel-button" type="button">
            Throw Pokeball
          </button>
          <button className="pixel-button" type="button">
            Run
          </button>
        </div>
      </div>
    </div>
  );
}
