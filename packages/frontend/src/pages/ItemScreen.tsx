export default function ItemScreen() {
  return (
    <div className="screen item-screen">
      <div className="screen-content">
        <h2 className="screen-title">Items</h2>
        <div className="inventory-list placeholder">
          <p>Inventory will appear here</p>
        </div>
        <button className="pixel-button back-button" type="button">
          Back
        </button>
      </div>
    </div>
  );
}
