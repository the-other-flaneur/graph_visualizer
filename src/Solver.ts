import { Algorithm } from "./algorithms/Algorithm.js";
import { NetworkGraph } from "./NetworkGraph.js";

class Solver {
  private algorithm: Algorithm;
  private graph: NetworkGraph;

  constructor(algorithm: Algorithm, graph: NetworkGraph) {
    this.algorithm = algorithm;
    this.graph = graph;
    this.algorithm.initialize(graph);
  }

  step(): boolean {
	console.log(`Stepping`);

    return this.algorithm.step();
  }

  solveAll(): void {
    while (!this.algorithm.isFinished()) {
      this.algorithm.step();
    }
  }

  getState() {
    return this.algorithm.getCurrentState();
  }

  isFinished(): boolean {
    return this.algorithm.isFinished();
  }

  getStats(): {
	maxFlow: number;
	iterations: number;
	paths: string[][];
	time: number;
  } {
	return {
	  maxFlow: this.algorithm.getStats().maxFlow,
	  iterations: this.algorithm.getStats().iterations,
	  paths: this.algorithm.getStats().paths,
	  time: performance.now() - this.algorithm.getStats().time
	};
  }
}

export { Solver };