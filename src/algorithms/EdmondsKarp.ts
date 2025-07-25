import { Algorithm } from "./Algorithm.js";
import { NetworkGraph, node, edge } from "../NetworkGraph.js";

class EdmondsKarp extends Algorithm {
  private graph!: NetworkGraph;
  private residualGraph: Map<string, edge[]> = new Map();
  private parentMap: Map<string, string> = new Map();
  private source!: string;
  private sink!: string;
  private finished = false;
  private startTime = 0;

  constructor() {
    super("Edmonds-Karp");
  }

  initialize(graph: NetworkGraph): void {
    this.graph = graph;
    this.flow = 0;
    this.iterations = 0;
    this.lastPath = null;
    this.allPaths = [];
    this.finished = false;
    this.startTime = performance.now();

    this.source = graph.getSource().getId();
    this.sink = graph.getSink().getId();
  }

  isFinished(): boolean {
    return this.finished;
  }

  step(): boolean {
    if (this.finished) return false;

    const { path, bottleneck } = this.bfs();
    if (!path) {
      this.finished = true;
      return false;
    }

    this.flow += bottleneck;
    this.iterations++;
    this.lastPath = path;
    this.allPaths.push(path);

    // Update residual capacities
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const edge = this.graph.getForwardEdge(from, to);

      if (edge) {
        edge.setFlow(edge.getFlow() + bottleneck);
      }

      const reverseEdge = this.graph.getForwardEdge(to, from);
      if (reverseEdge) {
        reverseEdge.setFlow(reverseEdge.getFlow() - bottleneck);
      } else {
        this.graph.addEdge(to, from, 0);
        const newReverse = this.graph.getForwardEdge(to, from);
        if (newReverse) {
          newReverse.setFlow(-bottleneck);
        }
      }
    }

    return true;
  }

  getCurrentState() {
    return {
      highlightedNodes: this.lastPath ?? [],
      highlightedEdges: this.lastPath
        ? this.lastPath.slice(0, -1).map((from, i) => [from, this.lastPath![i + 1]] as [string, string])
        : [],
    };
  }

  getStats() {
    const time = performance.now() - this.startTime;
    return {
      maxFlow: this.flow,
      iterations: this.iterations,
      paths: this.allPaths,
      time: Math.round(time),
    };
  }

  private bfs(): { path: string[] | null; bottleneck: number } {
    const queue: string[] = [this.source];
    this.parentMap.clear();
    this.parentMap.set(this.source, "");

    const visited = new Set<string>();
    visited.add(this.source);

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const edge of this.graph.getForwardEdgesFrom(current)) {
        const residualCapacity = edge.getCapacity() - edge.getFlow();
        const neighbor = edge.getTarget().getId();
        if (residualCapacity > 0 && !visited.has(neighbor)) {
          this.parentMap.set(neighbor, current);
          visited.add(neighbor);
          queue.push(neighbor);

          if (neighbor === this.sink) {
            const path: string[] = [];
            let node = this.sink;
            let bottleneck = Infinity;
            while (node !== this.source) {
              const prev = this.parentMap.get(node)!;
              const e = this.graph.getForwardEdge(prev, node)!;
              bottleneck = Math.min(bottleneck, e.getCapacity() - e.getFlow());
              path.unshift(node);
              node = prev;
            }
            path.unshift(this.source);
            return { path, bottleneck };
          }
        }
      }
    }

    return { path: null, bottleneck: 0 };
  }
}

export { EdmondsKarp };
