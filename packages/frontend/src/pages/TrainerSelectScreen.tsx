export default function TrainerSelectScreen() {
  return (
    <div className="screen trainer-select-screen">
      <div className="screen-content">
        <h2 className="screen-title">Choose Your Trainer</h2>
        <div className="trainer-options">
          <button className="pixel-button trainer-card" type="button">
            <div className="trainer-sprite placeholder">Boy</div>
          </button>
          <button className="pixel-button trainer-card" type="button">
            <div className="trainer-sprite placeholder">Girl</div>
          </button>
        </div>
      </div>
    </div>
  );
}
