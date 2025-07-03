import { NetworkGraph } from './NetworkGraph.js';
import { node } from './NetworkGraph.js';
import { edge } from './NetworkGraph.js';

class SVGRenderer {
  private svg: SVGSVGElement;
  private graph: NetworkGraph;

  constructor(svgId: string, graph: NetworkGraph) {
    const el = document.getElementById(svgId);

    if (!(el instanceof SVGSVGElement)) {
      throw new Error(`Element with ID '${svgId}' is not an <svg> element.`);
    }

    this.svg = el;
    this.clear(); // Optional: clear on init
    this.graph = graph;
  }

  setGraph(graph: NetworkGraph) {
    this.graph = graph;
    this.render();
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
    circle.setAttribute("fill", "#3b82f6"); // blue-500
    circle.setAttribute("stroke", "#1e3a8a"); // blue-900
    circle.setAttribute("stroke-width", "2.5");
    circle.setAttribute("filter", "url(#shadow)");


    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x.toString());
    text.setAttribute("y", (y + 5).toString());
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "15");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("fill", "#f9fafb"); // light gray
    text.textContent = label ?? id;

    this.svg.appendChild(circle);
    this.svg.appendChild(text);
  }

  drawEdge(fromX: number, fromY: number, toX: number, toY: number, label?: string, fromId?: string, toId?: string) {
  const svgNS = "http://www.w3.org/2000/svg";
  const radius = 20; // same as node radius

  // Calculate angle
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.sqrt(dx * dx + dy * dy);

  const unitX = dx / length;
  const unitY = dy / length;

  // Offset start and end points by radius
  const startX = fromX + unitX * radius;
  const startY = fromY + unitY * radius;
  const endX = toX - unitX * radius;
  const endY = toY - unitY * radius;

  // Draw the adjusted edge
  const line = document.createElementNS(svgNS, "line");
  line.setAttribute("x1", startX.toString());
  line.setAttribute("y1", startY.toString());
  line.setAttribute("x2", endX.toString());
  line.setAttribute("y2", endY.toString());
  line.setAttribute("stroke", "#475569"); // slate-600
  line.setAttribute("stroke-width", "2.5");
  line.setAttribute("marker-end", "url(#arrowhead)");

  if (fromId && toId) {
    line.setAttribute("id", `edge-${fromId}-${toId}`);
  }

  this.svg.appendChild(line);

  // Draw label
  if (label) {
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", midX.toString());
    text.setAttribute("y", (midY - 5).toString());
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#1e293b");
    text.setAttribute("font-size", "12");
    text.setAttribute("font-weight", "500");
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

  render() {
    this.clear();

    // Draw nodes
    this.graph.getNodes().forEach((n: node) => {
      this.drawNode(n.getId(), n.getX(), n.getY());
    });

    // Draw edges
    this.graph.getEdges().forEach((e: edge) => {
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

    // Add drop shadow filter
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", "shadow");
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");

    const feDropShadow = document.createElementNS("http://www.w3.org/2000/svg", "feDropShadow");
    feDropShadow.setAttribute("dx", "0");
    feDropShadow.setAttribute("dy", "1");
    feDropShadow.setAttribute("stdDeviation", "1");
    feDropShadow.setAttribute("flood-color", "#000000");
    feDropShadow.setAttribute("flood-opacity", "0.3");

    marker.appendChild(path);
    defs.appendChild(marker);
    filter.appendChild(feDropShadow);
    defs.appendChild(filter);
    this.svg.appendChild(defs);
  }

}

export { SVGRenderer };