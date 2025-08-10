import { Algorithm } from "./Algorithm.js";
import { NetworkGraph, Edge, Node } from "../NetworkGraph.js";

class EdmondsKarp extends Algorithm {
    public graph!: NetworkGraph;
    public source!: Node;
    public sink!: Node;

    constructor() {
        super("edmonds-karp");
    }

    initialize(graph: NetworkGraph): Algorithm {
        // Initialize the algorithm with the given graph
        console.log("Initializing Edmonds-Karp algorithm");
        this.graph = graph;
        this.source = graph.getSource();
        this.sink = graph.getSink();
        this.startTime = 0;
        this.stepCount = 0;
        this.maxFlow = 0;
        this.finished = false;
        this.stepInfo = "Algorithm initialized. Ready to find augmenting paths.";
        this.highlightedNodes = [];
        this.highlightedEdges = [];
        return this;
    }

    bfs(source: Node, sink: Node): Edge[] {
        // Perform BFS to find an augmenting path from source to sink
        const queue: Node[] = [source];
        const visited: Set<string> = new Set();
        const parentMap: Map<string, Edge | null> = new Map();
        visited.add(source.getId());
        parentMap.set(source.getId(), null);
        while (queue.length > 0) {
            const current = queue.shift()!;
            if (current === sink) {
                // Reconstruct the path from source to sink
                const path: Edge[] = [];
                let node: Node | null = sink;
                while (node && parentMap.get(node.getId()) !== null) {
                    const edge: Edge = parentMap.get(node.getId())!;
                    path.push(edge);
                    node = edge.getSource();
                }
                return path.reverse();
            }
            for (const edge of this.graph.getForwardEdgesFrom(current)) {
                const neighbor = edge.getTarget();
                if (!visited.has(neighbor.getId()) && edge.getResidualCapacity() > 0) {
                    visited.add(neighbor.getId());
                    parentMap.set(neighbor.getId(), edge);
                    queue.push(neighbor);
                }
            }
        }
        return [];
    }

    /**
     * Executes one step of the Edmonds-Karp algorithm.
     * It finds an augmenting path using BFS and augments the flow along that path.
     * @returns {boolean} True if an augmenting path was found, false if the algorithm is finished.
     */
    step(): boolean {
        // Reset step info for the current step
        this.stepInfo = "";
        this.highlightedNodes = [];
        this.highlightedEdges = [];
        const path = this.bfs(this.source, this.sink);
        if (path.length === 0) {
            this.finished = true;
            this.stepInfo = "No more augmenting paths found. Algorithm finished.";
            return false; // No more augmenting paths
        }
        // Find the minimum residual capacity along the path
        let minCapacity = Infinity;
        for (const edge of path) {
            minCapacity = Math.min(minCapacity, edge.getResidualCapacity());
        }
        // Augment the flow along the path
        for (const edge of path) {
            edge.augment(minCapacity);
            this.highlightedEdges.push(edge);
        }
        this.maxFlow += minCapacity;
        this.stepInfo = `Augmented flow by ${minCapacity}. Current max flow: ${this.maxFlow}`;
        this.highlightedNodes.push(this.source, this.sink);
        this.highlightedEdges.push(...path);

        return true;
    }

    solve(): boolean {
        // Start the algorithm and initialize the residual graph
        while (!this.finished) {
            this.step();
            console.log(`Step ${this.stepCount}: ${this.stepInfo}`);
            this.stepCount++;
            if (this.finished) {
                break; // Exit if the algorithm is finished
            }
        }
        this.stepInfo = `Max flow found: ${this.maxFlow}`;
        console.log(this.stepInfo);
        return this.finished;
    }

    /**
     * Returns the current state of the algorithm for visualization.
     * This includes highlighted nodes and edges based on the last found path.
     */
    getCurrentState() {
        // Return the current state of the algorithm
        return {
            highlightedNodes: this.highlightedNodes,
            highlightedEdges: this.highlightedEdges,
            stepInfo: this.stepInfo,
            stepCount: this.stepCount,
            maxFlow: this.maxFlow,
            finished: this.finished,
            startTime: this.startTime
        };
    }
}

export { EdmondsKarp };