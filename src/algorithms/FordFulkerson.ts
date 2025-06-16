import { Algorithm } from "./Algorithm.js";
import { NetworkGraph, edge, node } from "../NetworkGraph.js";

class FordFulkerson extends Algorithm {
    private graph!: NetworkGraph;
    private residualGraph!: NetworkGraph;
    private source!: node;
    private sink!: node;
    private startTime: number = 0;
    private finished: boolean = false;

    constructor() {
        super("Ford-Fulkerson");
    }

    initialize(graph: NetworkGraph): void {

        console.log("Initializing Ford-Fulkerson algorithm");

        this.graph = graph;
        this.source = this.graph.getNode("s")!;
        this.sink = this.graph.getNode("t")!;
        this.residualGraph = this.graph.clone();
        this.flow = 0;
        this.iterations = 0;
        this.lastPath = null;
        this.allPaths = [];
        this.startTime = performance.now();
        this.finished = false;
    }

    private dfs(current: node, visited: Set<string>, path: edge[]): boolean {

        console.log(`DFS at node ${current.getId()}`);
        console.log("Visited:", Array.from(visited));


        if (current.getId() === this.sink.getId()) {
            return true;
        }

        visited.add(current.getId());

        for (const edge of this.residualGraph.getEdgesFrom(current.getId())) {
            console.log(`Checking edge ${edge.getSource().getId()} -> ${edge.getTarget().getId()} with capacity ${edge.getCapacity()}`);
            const to = edge.getTarget();
            if (!visited.has(to.getId()) && edge.getCapacity() > 0) {
                path.push(edge);
                if (this.dfs(to, visited, path)) {
                    return true;
                }
                path.pop(); // Backtrack
            }
        }

        return false;
    }

    step(): boolean {
        if (this.finished) return false;

        const visited = new Set<string>();
        const path: edge[] = [];

        const found = this.dfs(this.source, visited, path);

        console.log("found: " + found + " and time " + (this.startTime - performance.now()));

        if (!found) {
            this.finished = true;
            console.log("is finished")
            return false;
        }

        // Find bottleneck
        const bottleneck = Math.min(...path.map(e => e.getCapacity()));

        // Augment flow
        for (const edge of path) {
            const fromId = edge.getSource().getId();
            const toId = edge.getTarget().getId();

            const forward = this.residualGraph.getEdge(fromId, toId);
            if (forward) {
                forward.setCapacity(forward.getCapacity() - bottleneck);
            }

            const backward = this.residualGraph.getEdge(toId, fromId);
            if (backward) {
                backward.setCapacity(backward.getCapacity() + bottleneck);
            } else {
                // Add back edge if it doesn't exist
                this.residualGraph.addEdge(toId, fromId, bottleneck);
            }
        }

        console.log("step fulkerson");

        this.flow += bottleneck;

        console.log("flow");
        this.iterations += 1;
        const nodePath = path.map(e => e.getSource().getId()).concat(this.sink.getId());
        this.lastPath = nodePath;
        this.allPaths.push(nodePath);

        return true;
    }

    isFinished(): boolean {
        return this.finished;
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
        const timeElapsed = performance.now() - this.startTime;
        return {
            maxFlow: this.flow,
            iterations: this.iterations,
            paths: this.allPaths,
            time: timeElapsed,
        };
    }
}

export { FordFulkerson };