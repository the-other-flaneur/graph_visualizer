import { Algorithm } from "./Algorithm.js";
import { NetworkGraph, Edge, Node } from "../NetworkGraph.js";

// Helper class to track edge direction in the path
class PathEdge {
    constructor(
        public edge: Edge,
        public isForward: boolean
    ) {}

    getResidualCapacity(): number {
        return this.isForward 
            ? this.edge.getResidualCapacity()  // Forward: capacity - flow
            : this.edge.getFlow();             // Backward: current flow
    }

    augment(flow: number): void {
        if (this.isForward) {
            this.edge.augment(flow);    // Increase flow
        } else {
            this.edge.augment(-flow);   // Decrease flow (negative augment)
        }
    }
}

class FordFulkerson extends Algorithm {
    public graph!: NetworkGraph;
    public source!: Node;
    public sink!: Node;

    constructor() {
        super("ford-fulkerson");
    }  

    initialize(graph: NetworkGraph): Algorithm {
        console.log("Initializing Ford-Fulkerson algorithm");
        this.graph = graph;

        try {
            this.source = graph.getSource();
            this.sink = graph.getSink();
        } catch (error) {
            throw new Error("Graph must have both source 's' and sink 't' nodes");
        }

        this.startTime = 0;
        this.stepCount = 0;
        this.maxFlow = 0;
        this.finished = false;
        this.stepInfo = "Algorithm initialized. Ready to find augmenting paths.";
        this.highlightedNodes = [];
        this.highlightedEdges = [];

        return this;
    }

    /**
     * Depth-first search to find an augmenting path in the residual graph.
     */
    private dfs(current: Node, visited: Set<string>, path: PathEdge[]): boolean {
        if (current === this.sink) {
            return true;
        }

        visited.add(current.getId());

        // Check forward edges
        for (const edge of this.graph.getForwardEdgesFrom(current)) {
            const neighbor = edge.getTarget();
            if (!visited.has(neighbor.getId()) && edge.getResidualCapacity() > 0) {
                path.push(new PathEdge(edge, true));
                if (this.dfs(neighbor, visited, path)) {
                    return true;
                }
                path.pop();
            }
        }

        // Check backward edges (for flow cancellation)
        for (const edge of this.graph.getBackwardEdgesTo(current)) {
            const neighbor = edge.getSource();
            if (!visited.has(neighbor.getId()) && edge.getFlow() > 0) {
                path.push(new PathEdge(edge, false));
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
     */
    step(): boolean {
        if (this.finished) {
            console.warn("Algorithm already finished");
            return false;
        }

        this.stepInfo = `Step ${this.stepCount + 1}: Searching for augmenting path...`;

        if (this.stepCount === 0) {
            console.log("Starting Ford-Fulkerson algorithm");
            this.startTime = performance.now();
        }

        this.highlightedNodes = [];
        this.highlightedEdges = [];

        // Find an augmenting path using DFS
        const visited = new Set<string>();
        const path: PathEdge[] = [];

        if (this.dfs(this.source, visited, path)) {
            // Calculate the bottleneck flow
            let flow = Infinity;
            for (const pathEdge of path) {
                flow = Math.min(flow, pathEdge.getResidualCapacity());
            }

            // Augment the flow along the path
            for (const pathEdge of path) {
                pathEdge.augment(flow);
                this.highlightedEdges.push(pathEdge.edge);
            }

            this.maxFlow += flow;
            
            // Create path description for logging
            const pathStr = path.map(pe => 
                `${pe.edge.getSource().getId()}${pe.isForward ? '→' : '←'}${pe.edge.getTarget().getId()}`
            ).join(' → ');
            
            this.stepInfo = `Found path: ${pathStr}. Augmented flow by ${flow}. Current max flow: ${this.maxFlow}`;
            console.log(this.stepInfo);

            // Get unique nodes from the path
            const nodeSet = new Set<Node>();
            nodeSet.add(this.source);
            for (const pathEdge of path) {
                nodeSet.add(pathEdge.edge.getSource());
                nodeSet.add(pathEdge.edge.getTarget());
            }
            this.highlightedNodes = Array.from(nodeSet);

            this.stepCount++;
            return true;

        } else {
            // No augmenting path found, algorithm is finished
            this.stepInfo = `No augmenting path found. Max flow is ${this.maxFlow}.`;
            console.log(this.stepInfo);
            this.highlightedNodes = [];
            this.highlightedEdges = [];
            this.stepCount++;
            this.finished = true;

            console.log(`Algorithm finished in ${performance.now() - this.startTime}ms with max flow: ${this.maxFlow}`);
            return false;
        }
    }

    solve(): boolean {
        while (!this.finished) {
            this.step();
            if (this.finished) {
                break;
            }
        }
        this.stepInfo = `Max flow found: ${this.maxFlow}`;
        console.log(this.stepInfo);
        return this.finished;
    }

    getCurrentState() {
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