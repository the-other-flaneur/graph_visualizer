import { Algorithm } from "./Algorithm.js";
import { NetworkGraph, Edge, Node } from "../NetworkGraph.js";

class FordFulkerson extends Algorithm {
    public graph!: NetworkGraph;
    public source!: Node;
    public sink!: Node;

    constructor() {
        super("ford-fulkerson");
    }  

    initialize(graph: NetworkGraph): void {
        // Initialize the algorithm with the given graph
        console.log("Initializing Ford-Fulkerson algorithm");
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
    }

    /**
     * Depth-first search to find an augmenting path in the residual graph.
     * @param {node} current - The current node in the DFS.
     * @param {Set<string>} visited - Set of visited node IDs to avoid cycles.
     * @param {edge[]} path - The current path being explored.
     * @returns {boolean} True if an augmenting path is found, false otherwise.
     */
    private dfs(current: Node, visited: Set<string>, path: Edge[]): boolean {
        
        console.log(`DFS visiting node: ${current.getId()}`);
        
        // implement DFS to find an augmenting path
        if (current === this.sink) {
            return true; // Found a path to the sink
        }

        visited.add(current.getId());

        for (const edge of this.graph.getForwardEdgesFrom(current)) {
            const neighbor = edge.getTarget();
            if (!visited.has(neighbor.getId()) && edge.getResidualCapacity() > 0) {
                path.push(edge);
                if (this.dfs(neighbor, visited, path)) {
                    return true;
                }
                path.pop();
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
        // Reset step info for the current step
        this.stepInfo = `Step ${this.stepCount + 1}: Searching for augmenting path...`;

        if (this.stepCount === 0) {
            console.log("Starting Ford-Fulkerson algorithm");
            this.startTime = performance.now();
        }

        this.highlightedNodes = [];
        this.highlightedEdges = [];

        // Find an augmenting path using DFS
        const visited = new Set<string>();
        const path: Edge[] = [];

        if (this.dfs(this.source, visited, path)) {
            // If an augmenting path is found, calculate the flow to augment
            let flow = Infinity;
            for (const edge of path) {
                flow = Math.min(flow, edge.getResidualCapacity());
            }

            // Augment the flow along the path
            for (const edge of path) {
                edge.augment(flow);
                this.highlightedEdges.push(edge);
            }

            this.maxFlow += flow;
            this.stepInfo = `Augmented flow by ${flow}. Current max flow: ${this.maxFlow}`;

            this.highlightedNodes = path.map(edge => edge.getSource()).concat(path.map(edge => edge.getTarget()));
            this.stepCount++;
            return true; // Continue to the next step

        } else {
            // No augmenting path found, algorithm is finished
            this.stepInfo = `No augmenting path found. Max flow is ${this.maxFlow}.`;
            console.log(this.stepInfo);
            this.highlightedNodes = [];
            this.highlightedEdges = [];
            this.stepCount++;

            this.finished = true; // Mark the algorithm as finished
            console.log(`Algorithm finished in ${performance.now() - this.startTime}ms with max flow: ${this.maxFlow}`);

            return false; // No more steps to take
        }
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
            startTime: this.startTime,
        };
    }
}

export { FordFulkerson };