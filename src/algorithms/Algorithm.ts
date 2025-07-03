import { NetworkGraph } from "../NetworkGraph.js";

export abstract class Algorithm {
    public name: string; // algorithm name
    protected flow: number = 0; // internal max flow
    protected iterations: number = 0; // number of iterations
    protected lastPath: string[] | null = null; // last path found
    protected allPaths: string[][] = []; // all paths found

	constructor( name: string) {
        this.name = name; // algorithm name
	}
    
    abstract initialize(graph: NetworkGraph): void;
    abstract step(): boolean; // returns false when finished
    abstract isFinished(): boolean;
    
    abstract getCurrentState(): {
        highlightedNodes?: string[];
        highlightedEdges?: [string, string][];
        stepInfo?: string;
        stepCount?: number;
    };

    abstract getStats(): {
        maxFlow: number;
        iterations: number;
        paths: string[][];
        time: number;
    };
    }

