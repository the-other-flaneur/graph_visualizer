import { Algorithm } from "./Algorithm.js";
import { NetworkGraph, edge, node } from "../NetworkGraph.js";

class FordFulkerson extends Algorithm {
    private graph!: NetworkGraph;
    private residualGraph!: NetworkGraph;
    private source!: node;
    private sink!: node;
    private startTime: number = 0;
    private finished: boolean = false;
    private stepInfo: string = "";
    private stepCount: number = 0;

    constructor() {
        super("Ford-Fulkerson");
    }

    initialize(graph: NetworkGraph): void {
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

    /**
     * Depth-first search to find an augmenting path in the residual graph.
     * @param {node} current - The current node in the DFS.
     * @param {Set<string>} visited - Set of visited node IDs to avoid cycles.
     * @param {edge[]} path - The current path being explored.
     * @returns {boolean} True if an augmenting path is found, false otherwise.
     */
    private dfs(current: node, visited: Set<string>, path: edge[]): boolean {

        if (current.getId() === this.sink.getId()) {
            return true;
        }

        visited.add(current.getId());

        for (const edge of this.residualGraph.getForwardEdgesFrom(current.getId())) {
            
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


    /**
     * Executes one step of the Ford-Fulkerson algorithm.
     * It finds an augmenting path using DFS and augments the flow along that path.
     * @returns {boolean} True if an augmenting path was found, false if the algorithm is finished.
     */
    step(): boolean {
        if (this.finished) return false;

        const visited = new Set<string>();
        const path: edge[] = [];

        const found = this.dfs(this.source, visited, path);

        if (!found) {
            this.finished = true;
            return false;
        }

        // Find bottleneck
        const bottleneck = Math.min(...path.map(e => e.getCapacity()));

        // Augment flow
        for (const edge of path) {
            const fromId = edge.getSource().getId();
            const toId = edge.getTarget().getId();

            const forward = this.residualGraph.getForwardEdge(fromId, toId);
            if (forward) {
                forward.setCapacity(forward.getCapacity() - bottleneck);
            }

            const backward = this.residualGraph.getBackwardEdge(toId, fromId);
            if (backward) {
                backward.setCapacity(backward.getCapacity() + bottleneck);
            } else {
                // Add back edge if it doesn't exist
                this.residualGraph.addBackwardEdge(toId, fromId, bottleneck);
            }
        }

        this.flow += bottleneck;
        this.iterations += 1;
        const nodePath = path.map(e => e.getSource().getId()).concat(this.sink.getId());
        this.lastPath = nodePath;
        this.allPaths.push(nodePath);

        this.stepCount += 1;
        this.stepInfo = `Step ${this.iterations}: Found an augmenting path using DFS and augments the flow along that path`;

        return true;
    }

    /**
     * Checks if the algorithm has finished execution.
     * @returns {boolean} True if the algorithm is finished, false otherwise.
     */
    isFinished(): boolean {
        return this.finished;
    }

    /**
     * Returns the current state of the algorithm for visualization.
     * This includes highlighted nodes and edges based on the last found path.
     */
    getCurrentState() {
        return {
            highlightedNodes: this.lastPath ?? [],
            highlightedEdges: this.lastPath
                ? this.lastPath.slice(0, -1).map((from, i) => [from, this.lastPath![i + 1]] as [string, string])
                : [],
            stepInfo: this.stepInfo,
            stepCount: this.stepCount,
        };
    }

    /**
     * Returns statistics about the algorithm's execution.
     * This includes the maximum flow found, number of iterations, all paths found, and time taken.
     */
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