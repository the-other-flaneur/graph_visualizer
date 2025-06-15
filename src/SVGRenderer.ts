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

  drawEdge(fromX: number, fromY: number, toX: number, toY: number, label?: string) {
    const svgNS = "http://www.w3.org/2000/svg";

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", fromX.toString());
    line.setAttribute("y1", fromY.toString());
    line.setAttribute("x2", toX.toString());
    line.setAttribute("y2", toY.toString());
    line.setAttribute("stroke", "#4a5568"); // gray-600
    line.setAttribute("stroke-width", "2");
    line.setAttribute("marker-end", "url(#arrowhead)");

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
}

export { SVGRenderer };