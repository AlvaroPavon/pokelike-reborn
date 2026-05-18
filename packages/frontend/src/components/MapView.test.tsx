import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MapView from "./MapView";
import type { MapNode, MapEdge } from "@pokelike/core";
import { NodeType } from "@pokelike/core";

function createMockNodes(): MapNode[] {
  return [
    {
      id: "start",
      type: NodeType.START,
      position: { x: 100, y: 200 },
      connections: ["battle-1"],
      visited: true,
      accessible: true,
    },
    {
      id: "battle-1",
      type: NodeType.BATTLE,
      position: { x: 300, y: 200 },
      connections: ["start"],
      visited: false,
      accessible: true,
    },
    {
      id: "boss-1",
      type: NodeType.BOSS,
      position: { x: 500, y: 200 },
      connections: ["battle-1"],
      visited: false,
      accessible: false,
    },
  ];
}

function createMockEdges(): MapEdge[] {
  return [
    { from: "start", to: "battle-1" },
    { from: "battle-1", to: "boss-1", label: "Gate" },
  ];
}

describe("MapView", () => {
  const defaultProps = {
    nodes: createMockNodes(),
    edges: createMockEdges(),
    currentNodeId: "start",
    onNodeClick: vi.fn(),
  };

  it("renders empty state when no nodes", () => {
    render(
      <MapView nodes={[]} edges={[]} currentNodeId={null} onNodeClick={vi.fn()} />,
    );
    expect(screen.getByText("No map data")).toBeInTheDocument();
  });

  it("renders SVG with nodes and edges", () => {
    const { container } = render(<MapView {...defaultProps} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders zoom controls", () => {
    render(<MapView {...defaultProps} />);
    expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
    expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
  });

  it("marks current node node", () => {
    render(<MapView {...defaultProps} />);
    expect(screen.getByLabelText(/START/)).toBeInTheDocument();
  });

  it("renders edges as route path elements", () => {
    const { container } = render(<MapView {...defaultProps} />);
    const paths = container.querySelectorAll("path.map-edge");
    expect(paths.length).toBeGreaterThanOrEqual(2);
  });

  it("renders edges with label", () => {
    render(<MapView {...defaultProps} />);
    expect(screen.getByText("Gate")).toBeInTheDocument();
  });

  it("has application role and aria label", () => {
    render(<MapView {...defaultProps} />);
    const app = screen.getByRole("application");
    expect(app).toHaveAttribute("aria-label", "Overworld map");
  });
});
