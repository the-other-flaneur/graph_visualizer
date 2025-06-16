import { NetworkGraph } from './NetworkGraph.js';
import { node } from './NetworkGraph.js';
import { edge } from './NetworkGraph.js';

class SVGRenderer {
  private svg: SVGSVGElement;

  constructor(svgId: string) {
    const el = document.getElementById(svgId);

    if (!(el instanceof SVGSVGElement)) {
      throw new Error(`Element with ID '${svgId}' is not an <svg> element.`);
    }

    this.svg = el;
    this.clear(); // Optional: clear on init
  }

  clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  drawNode(id: string, x: number, y: number, label?: string) {
    const svgNS = "http://www.w3.org/2000/svg";

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", x.toString());
    circle.setAttribute("cy", y.toString());
    circle.setAttribute("r", "20");
    circle.setAttribute("fill", "#4fd1c5"); // teal-300
    circle.setAttribute("stroke", "#2d3748"); // gray-800
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("id", `node-${id}`);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x.toString());
    text.setAttribute("y", (y + 5).toString());
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#2d3748"); // gray-800
    text.setAttribute("font-size", "14");
    text.textContent = label ?? id;

    this.svg.appendChild(circle);
    this.svg.appendChild(text);
  }

  drawEdge(fromX: number, fromY: number, toX: number, toY: number, label?: string, fromId?: string, toId?: string) {
  const svgNS = "http://www.w3.org/2000/svg";

  const line = document.createElementNS(svgNS, "line");
  line.setAttribute("x1", fromX.toString());
  line.setAttribute("y1", fromY.toString());
  line.setAttribute("x2", toX.toString());
  line.setAttribute("y2", toY.toString());
  line.setAttribute("stroke", "#4a5568"); // gray-600
  line.setAttribute("stroke-width", "2");
  line.setAttribute("marker-end", "url(#arrowhead)");

  if (fromId && toId) {
    line.setAttribute("id", `edge-${fromId}-${toId}`);
  }

  this.svg.appendChild(line);

  if (label) {
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", midX.toString());
    text.setAttribute("y", (midY - 5).toString());
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#2d3748");
    text.setAttribute("font-size", "12");
    text.textContent = label;

    this.svg.appendChild(text);
  }
}


  highlightNode(id: string, color: string = "#f6ad55") {
    const node = document.getElementById(`node-${id}`);
    if (node instanceof SVGCircleElement) {
      node.setAttribute("fill", color); // Use a highlight color (default: orange-400)
    }
  }

  highlightEdge(fromId: string, toId: string, color: string = "#f6ad55") {
    // Optional: assign edge an ID when drawing it
    const edgeId = `edge-${fromId}-${toId}`;
    const edge = document.getElementById(edgeId);
    if (edge instanceof SVGLineElement) {
      edge.setAttribute("stroke", color);
    }
  }

  clearHighlights() {
    const nodes = this.svg.querySelectorAll("circle");
    nodes.forEach(node => node.setAttribute("fill", "#4fd1c5")); // Reset to default color

    const edges = this.svg.querySelectorAll("line");
    edges.forEach(edge => edge.setAttribute("stroke", "#4a5568")); // Reset to default color
  }

  render(graph: NetworkGraph) {
    this.clear();

    // Draw nodes
    graph.getNodes().forEach((n: node) => {
      this.drawNode(n.getId(), n.getX(), n.getY());
    });

    // Draw edges
    graph.getEdges().forEach((e: edge) => {
      const from = e.getSource();
      const to = e.getTarget();
      this.drawEdge(from.getX(), from.getY(), to.getX(), to.getY(), e.getCapacity().toString(), from.getId(), to.getId());
    });

    // Add arrowhead marker
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 0 0 L 10 3.5 L 0 7 Z");
    path.setAttribute("fill", "#4a5568"); // gray-600

    marker.appendChild(path);
    defs.appendChild(marker);
    this.svg.appendChild(defs);
  }

}

export { SVGRenderer };