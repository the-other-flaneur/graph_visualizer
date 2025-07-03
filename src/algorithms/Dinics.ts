import { NetworkGraph } from "../NetworkGraph.js";
import { Algorithm } from "./Algorithm.js";

class Dinic extends Algorithm {

    constructor() {
        super("Dinic");
    }

    initialize(graph: NetworkGraph): void {
        
    }

    step(): boolean {
        return false;    
    }

    isFinished(): boolean {
        return true;    
    }

    getCurrentState(): {
        highlightedNodes?: string[];
        highlightedEdges?: [string, string][];
        stepCount?: number;
        stepInfo?: string;
    } {
        return {
            highlightedNodes: [],
            highlightedEdges: [],
            stepCount: 0,
            stepInfo: 'Dinic algorithm is not yet implemented.'
        };
    }

    getStats(): { maxFlow: number; iterations: number; paths: string[][]; time: number; } {
        return {
            maxFlow: 0,
            iterations: 0,
            paths: [],
            time: 0
        };
    }


}

export { Dinic };