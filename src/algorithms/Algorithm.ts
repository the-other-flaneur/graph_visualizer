import { NetworkGraph, Node, Edge } from "../NetworkGraph.js";

export abstract class Algorithm {
    public name: string; // algorithm name
    public maxFlow: number = 0; // max flow found
    public startTime: number = 0; // start time of the algorithm
    public stepCount: number = 0; // number of steps taken
    public finished: boolean = false; // whether the algorithm has finished
    public stepInfo: string = ""; // information about the current step
    public highlightedNodes: Node[] = []; // nodes highlighted in the current step
    public highlightedEdges: Edge[] = []; // edges highlighted in the current step


	constructor( name: string) {
        this.name = name; // algorithm name
	}
    
    abstract initialize(graph: NetworkGraph): void;
    abstract step(): boolean; // returns false when finished
    abstract solve(): boolean; // Solves the algorithm and returns true if it was successful

    abstract getCurrentState(): {
        highlightedNodes: Node[];
        highlightedEdges: Edge[];
        stepInfo: string;
        stepCount: number;
        maxFlow?: number;
        finished?: boolean;
        startTime?: number;
    };
    }

