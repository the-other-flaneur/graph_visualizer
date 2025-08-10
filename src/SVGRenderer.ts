import { NetworkGraph } from './NetworkGraph.js';
import { Node } from './NetworkGraph.js';
import { Edge } from './NetworkGraph.js';

class SVGRenderer {
  private svg: SVGElement;

  constructor(svgId: string, graph: NetworkGraph) {
    const el = document.getElementById(svgId);

    if (!(el instanceof SVGElement)) {
      throw new Error(`Element with ID '${svgId}' is not an <svg> element.`);
    }

    this.svg = el;
    this.clear(); // Optional: clear on init

    console.log(`SVGRenderer initialized with graph: ${graph.getNodes().length} nodes, ${graph.getForwardEdges().length} forward edges, ${graph.getBackwardEdges().length} backward edges`);
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
    circle.setAttribute("id", `node-${id}`);


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

  drawForwardEdge(fromX: number, fromY: number, toX: number, toY: number, label?: string, fromId?: string, toId?: string) {
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
  line.setAttribute("marker-end", "url(#arrowhead-forward)"); // Use forward arrowhead marker
  line.setAttribute("id", `edge-${fromId}-${toId}`); // Optional: assign edge an ID
  
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
    text.setAttribute("id", `label-${fromId}-${toId}`); // Optional: assign label an ID
    text.textContent = label;

    this.svg.appendChild(text);
  }
}

  drawBackwardEdge(fromX: number, fromY: number, toX: number, toY: number, label?: string, fromId?: string, toId?: string) {
    const svgNS = "http://www.w3.org/2000/svg";
    const radius = 20;

    // Calculate angle and offset for curve
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

    // Calculate control point for curve (perpendicular offset)
    const curveOffset = 40; // adjust for more/less curve
    const perpX = -unitY;
    const perpY = unitX;
    const midX = (startX + endX) / 2 + perpX * curveOffset;
    const midY = (startY + endY) / 2 + perpY * curveOffset;

    // Draw curved dashed edge (quadratic Bezier)
    const path = document.createElementNS(svgNS, "path");
    const d = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
    path.setAttribute("d", d);
    path.setAttribute("stroke", "#1e293b"); // orange-ish for backward
    path.setAttribute("stroke-width", "2.5");
    path.setAttribute("stroke-dasharray", "5,5");
    path.setAttribute("fill", "none");
    path.setAttribute("marker-start", "url(#arrowhead-backward)"); // Use backward arrowhead marker


    if (fromId && toId) {
      path.setAttribute("id", `edge-${fromId}-${toId}`);
    }
    this.svg.appendChild(path);

    // Draw label near curve
    if (label) {
      const labelX = midX;
      const labelY = midY - 5;
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", labelX.toString());
      text.setAttribute("y", labelY.toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#1e293b");
      text.setAttribute("font-size", "12");
      text.setAttribute("font-weight", "500");
      text.setAttribute("id", `label-${fromId}-${toId}`); // Optional: assign label an ID
      text.textContent = label;
      this.svg.appendChild(text);
    }
  }


  highlightNode(id: string, color: string = "#f6ad55") {
    console.log(`Highlighting node: ${id} with color: ${color}`);
    const node = document.getElementById(`node-${id}`);
    console.log(`Node element: ${node}`);
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

  render(graph: NetworkGraph) {
    this.clear();

    // Draw nodes
    graph.getNodes().forEach((n: Node) => {
      this.drawNode(n.getId(), n.getX(), n.getY());
    });

    // Draw edges
    graph.getForwardEdges().forEach((e: Edge) => {
      const from = e.getSource();
      const to = e.getTarget();
      this.drawForwardEdge(from.getX(), from.getY(), to.getX(), to.getY(), e.getFlow().toString() + "/" + e.getOrigCapacity().toString(), from.getId(), to.getId());
    });

    // Draw backward edges
    graph.getBackwardEdges().forEach((e: Edge) => {
      const from = e.getSource();
      const to = e.getTarget();
      this.drawBackwardEdge(from.getX(), from.getY(), to.getX(), to.getY(), e.getFlow().toString() + "/" + e.getOrigCapacity().toString() , from.getId(), to.getId());
    });

    // Add arrowhead marker
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    // Forward arrowhead marker (thinner, well aligned)
    const markerForward = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    markerForward.setAttribute("id", "arrowhead-forward");
    markerForward.setAttribute("markerWidth", "8");
    markerForward.setAttribute("markerHeight", "6");
    markerForward.setAttribute("refX", "7");
    markerForward.setAttribute("refY", "3");
    markerForward.setAttribute("orient", "auto");
    markerForward.setAttribute("markerUnits", "strokeWidth");

    const pathForward = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathForward.setAttribute("d", "M 0 1 L 8 3 L 0 5 Z"); // thinner triangle
    pathForward.setAttribute("fill", "#4a5568");
    markerForward.appendChild(pathForward);

    // Backward arrowhead marker (thinner, flipped, well aligned)
    const markerBackward = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    markerBackward.setAttribute("id", "arrowhead-backward");
    markerBackward.setAttribute("markerWidth", "8");
    markerBackward.setAttribute("markerHeight", "6");
    markerBackward.setAttribute("refX", "1");
    markerBackward.setAttribute("refY", "3");
    markerBackward.setAttribute("orient", "auto");
    markerBackward.setAttribute("markerUnits", "strokeWidth");

    const pathBackward = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathBackward.setAttribute("d", "M 10 1 L 0 3.5 L 10 5 Z"); // thinner triangle
    pathBackward.setAttribute("fill", "#1e293b");
    markerBackward.appendChild(pathBackward);

    defs.appendChild(markerForward);
    defs.appendChild(markerBackward);

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

    filter.appendChild(feDropShadow);
    defs.appendChild(filter);
    this.svg.appendChild(defs);
  }

}

export { SVGRenderer };