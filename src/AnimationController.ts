import { SVGRenderer } from './SVGRenderer.js';
import { Solver } from './Solver.js';

class AnimationController {
  private solver: Solver;
  private renderer: SVGRenderer;
  private intervalId: number | null = null;
  private speed: number = 1000; // default speed in milliseconds

  constructor(solver: Solver, renderer: SVGRenderer) {
    this.solver = solver;
    this.renderer = renderer;
  }

  step() {
    if (!this.solver.isFinished()) {
      const state = this.solver.getState();
      this.highlight(state);
      this.solver.step();
    }
  }

  play(speed: number = 1000) {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => {
      if (this.solver.isFinished()) {
        this.stop();
        return;
      }
      this.step();
    }, speed);
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  highlight(state: {
    highlightedNodes?: string[];
    highlightedEdges?: [string, string][];
  }) {
    this.renderer.clearHighlights();
    state.highlightedNodes?.forEach(id => this.renderer.highlightNode(id));
    state.highlightedEdges?.forEach(([from, to]) =>
      this.renderer.highlightEdge(from, to)
    );
  }

    setSpeed(speed: number) {
        this.speed = speed;
        if (this.intervalId) {
        this.stop();
        this.play(speed);
        }
    }

    getSpeed(): number {
        return this.speed / 1000; // return speed in seconds
    }
    
}


export { AnimationController };