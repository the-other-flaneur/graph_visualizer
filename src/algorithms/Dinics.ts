import { Algorithm } from "./Algorithm.js";
import { NetworkGraph, Edge, Node } from "../NetworkGraph.js";

class Dinic extends Algorithm {
    public graph!: NetworkGraph;
    public source!: Node;
    public sink!: Node;
    private levelGraph: Map<string, number> = new Map();
    private currentPath: Edge[] = [];
    
    constructor() {
        super("dinic");
    }
    
    initialize(graph: NetworkGraph): Algorithm {
        console.log("Initializing Dinic's algorithm");
        this.graph = graph;
        this.source = graph.getSource();
        this.sink = graph.getSink();
        this.startTime = 0;
        this.stepCount = 0;
        this.maxFlow = 0;
        this.finished = false;
        this.stepInfo = "Algorithm initialized. Ready to build level graph and find blocking flows.";
        this.highlightedNodes = [];
        this.highlightedEdges = [];
        this.currentPath = [];
        return this;
    }
    
    private buildLevelGraph(): boolean {
        this.levelGraph.clear();
        const queue: Node[] = [this.source];
        this.levelGraph.set(this.source.getId(), 0);
        
        while (queue.length > 0) {
            const current = queue.shift()!;
            const currentLevel = this.levelGraph.get(current.getId())!;
            
            for (const edge of this.graph.getForwardEdgesFrom(current)) {
                const neighbor = edge.getTarget();
                
                // Only consider edges with positive residual capacity
                if (edge.getResidualCapacity() > 0 && !this.levelGraph.has(neighbor.getId())) {
                    this.levelGraph.set(neighbor.getId(), currentLevel + 1);
                    queue.push(neighbor);
                }
            }
        }
        
        // Return true if sink is reachable
        return this.levelGraph.has(this.sink.getId());
    }
    
    /**
     * Depth-first search to find an augmenting path in the level graph.
     * @param {Node} current - The current node in the DFS.
     * @param {Set<string>} visited - Set of visited node IDs to avoid cycles.
     * @param {Edge[]} path - The current path being explored.
     * @returns {boolean} True if an augmenting path is found, false otherwise.
     */
    private dfs(current: Node, visited: Set<string>, path: Edge[]): boolean {
        if (current === this.sink) {
            this.currentPath = [...path];
            return true;
        }
        
        visited.add(current.getId());
        const currentLevel = this.levelGraph.get(current.getId())!;
        
        for (const edge of this.graph.getForwardEdgesFrom(current)) {
            const neighbor = edge.getTarget();
            const neighborLevel = this.levelGraph.get(neighbor.getId());
            
            // Only follow edges that go to the next level and have positive residual capacity
            if (edge.getResidualCapacity() > 0 && 
                neighborLevel === currentLevel + 1 && 
                !visited.has(neighbor.getId())) {
                
                const newPath = [...path, edge];
                
                if (this.dfs(neighbor, visited, newPath)) {
                    return true;
                }
            }
        }
        
        visited.delete(current.getId());
        return false;
    }
    
    private findBlockingFlow(): number {
        let totalBlockingFlow = 0;
        
        while (true) {
            this.currentPath = [];
            const visited = new Set<string>();
            
            if (!this.dfs(this.source, visited, [])) {
                break; // No more paths found
            }
            
            // Find the minimum residual capacity along the path
            let minCapacity = Infinity;
            for (const edge of this.currentPath) {
                minCapacity = Math.min(minCapacity, edge.getResidualCapacity());
            }
            
            // Augment the flow along the path
            for (const edge of this.currentPath) {
                edge.augment(minCapacity);
            }
            
            totalBlockingFlow += minCapacity;
            
            // Update visualization for the last path found
            this.highlightedEdges = [...this.currentPath];
            this.highlightedNodes = [this.source, this.sink];
        }
        
        return totalBlockingFlow;
    }
    
    /**
     * Executes one step of Dinic's algorithm.
     * Each step builds a level graph and finds a blocking flow.
     * @returns {boolean} True if more iterations are possible, false if the algorithm is finished.
     */
    step(): boolean {
        // Reset step info for the current step
        this.stepInfo = "";
        this.highlightedNodes = [];
        this.highlightedEdges = [];
        
        // Build level graph using BFS
        if (!this.buildLevelGraph()) {
            this.finished = true;
            this.stepInfo = "No more augmenting paths found. Algorithm finished.";
            return false;
        }
        
        this.stepInfo = `Step ${this.stepCount + 1}: Built level graph. Finding blocking flow...`;
        
        // Find blocking flow using DFS
        const blockingFlow = this.findBlockingFlow();
        
        if (blockingFlow === 0) {
            this.finished = true;
            this.stepInfo = "No blocking flow found. Algorithm finished.";
            return false;
        }
        
        this.maxFlow += blockingFlow;
        this.stepInfo = `Found blocking flow of ${blockingFlow}. Current max flow: ${this.maxFlow}`;
        
        // Highlight nodes that are part of the level graph
        this.highlightedNodes = Array.from(this.levelGraph.keys()).map(id => 
            this.graph.getNodes().find(node => node.getId() === id)!
        ).filter(node => node);
        
        return true;
    }
    
    solve(): boolean {
        // Start the algorithm and find blocking flows iteratively
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
     * This includes highlighted nodes and edges based on the current step.
     */
    getCurrentState() {
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

export { Dinic };