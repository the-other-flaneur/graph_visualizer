class Node {
	private id: string;
	private x: number;
	private y: number;

	constructor(id: string, x: number, y: number) {
		if (!id) {
			throw new Error("Node ID must be defined");
		}
		if (typeof id !== 'string') {
			throw new Error("Node ID must be a string");
		}
		if (id.trim() === "") {
			throw new Error("Node ID cannot be an empty string");
		}
		if (id.includes(" ")) {
			throw new Error("Node ID cannot contain spaces");
		}
		if (id.length > 1) {
			throw new Error("Node ID cannot exceed 1 character");
		}
		if (!/^[a-zA-Z0-9]+$/.test(id)) {
			throw new Error("Node ID can only contain alphanumeric characters");
		}

		this.id = id;
		this.x = x;
		this.y = y;
	}

	getId() {
		return this.id;
	}

	getX() {
		return this.x;
	}
	
	getY() {
		return this.y;
	}

	setX(x: number) {
		if (typeof x !== 'number') {
			throw new Error("X coordinate must be a number");
		}
		this.x = x;
	}
	
	setY(y: number) {
		if (typeof y !== 'number') {
			throw new Error("Y coordinate must be a number");
		}
		this.y = y;
	}
}

class Edge {
	private source: Node;
	private target: Node;
	private origCapacity: number;
	private capacity: number;
	private flow: number;

	constructor(source: Node, target: Node, capacity: number) {
		if (capacity <= 0) {
			throw new Error("Capacity must be greater than 0");
		}
		if (!source || !target) {
			throw new Error("Source and target nodes must be defined");
		}
		if (source === target) {
			throw new Error("Source and target nodes cannot be the same");
		}

		this.source = source;
		this.target = target;
		this.capacity = capacity;
		this.flow = 0;
		this.origCapacity = capacity;
	}

	getSource() {
		return this.source;
	}
	
	getTarget() {
		return this.target;
	}
	
	getCapacity() {
		return this.capacity;
	}

	setOrigCapacity(origCapacity: number) {
		if (origCapacity < 0) {
			throw new Error("Original capacity cannot be negative");
		}
		this.origCapacity = origCapacity;
	}

	getOrigCapacity() {
		return this.origCapacity;
	}

	setCapacity(newCapacity: number): void {
		if (newCapacity < 0) {
			throw new Error("Capacity cannot be negative");
		}
		this.capacity = newCapacity;
	}
	
	getFlow() {
		return this.flow;
	}
	
	setFlow(flow: number) {
		if (flow < 0 || flow > this.capacity) {
			throw new Error("Flow must be between 0 and the edge's capacity");
		}
		this.flow = flow;
	}
	
	// FIXED: Allow negative augmentation for backward edge flow reduction
	augment(flow: number) {
		const newFlow = this.flow + flow;
		if (newFlow < 0 || newFlow > this.capacity) {
			throw new Error(`Invalid flow augmentation: current=${this.flow}, augment=${flow}, capacity=${this.capacity}`);
		}
		this.flow = newFlow;
	}

	getResidualCapacity(): number {
		return this.capacity - this.flow;
	}
}

/**
 * Represents a directed network graph with proper residual graph support
 * for maximum flow algorithms like Ford-Fulkerson.
 */
class NetworkGraph {
	private nodes: Map<string, Node>;
	private forwardEdges: Edge[];
	private backwardEdges: Edge[]; // Keep for potential explicit backward edges
	private t: Node | null = null;
	private s: Node | null = null;

	constructor() {
		this.nodes = new Map<string, Node>();
		this.forwardEdges = [];
		this.backwardEdges = [];
	}

	addSource(id: string) {
		if (this.s) {
			throw new Error("Source node already exists");
		}
		if (this.nodes.has(id)) {
			throw new Error(`Node with ID ${id} already exists`);
		}
		this.s = new Node(id, 0, 0);
		this.nodes.set(id, this.s);
		return this.s;
	}

	addSink(id: string) {
		if (this.t) {
			throw new Error("Sink node already exists");
		}
		if (this.nodes.has(id)) {
			throw new Error(`Node with ID ${id} already exists`);
		}
		this.t = new Node(id, 0, 0);
		this.nodes.set(id, this.t);
		return this.t;
	}

	addNode(id: string) {
		if (this.nodes.has(id)) {
			throw new Error(`Node with ID ${id} already exists`);
		}
		const newNode = new Node(id, 0, 0);
		this.nodes.set(id, newNode);
		return newNode;
	}

	addEdge(sourceId: string, targetId: string, capacity: number) {
		const sourceNode = this.nodes.get(sourceId);
		const targetNode = this.nodes.get(targetId);
		if (!sourceNode || !targetNode) {
			throw new Error(`Source or target node not found: ${sourceId}, ${targetId}`);
		}
		const newEdge = new Edge(sourceNode, targetNode, capacity);
		this.forwardEdges.push(newEdge);
		return newEdge;
	}

	addBackwardEdge(sourceId: string, targetId: string, capacity: number) {
		const sourceNode = this.nodes.get(sourceId);
		const targetNode = this.nodes.get(targetId);
		if (!sourceNode || !targetNode) {
			throw new Error(`Source or target node not found: ${sourceId}, ${targetId}`);
		}
		const newEdge = new Edge(targetNode, sourceNode, capacity);
		this.backwardEdges.push(newEdge);
		return newEdge;
	}

	getNodes() {
		return Array.from(this.nodes.values());
	}
	
	getForwardEdges() {
		return this.forwardEdges;
	}

	getBackwardEdges() {
		return this.backwardEdges;
	}

	getEdges() {
		return [...this.forwardEdges, ...this.backwardEdges];
	}

	getNode(id: string) {
		return this.nodes.get(id);
	}

	getForwardEdge(sourceId: string, targetId: string) {
		return this.forwardEdges.find(edge => 
			edge.getSource().getId() === sourceId && edge.getTarget().getId() === targetId
		);
	}

	getBackwardEdge(sourceId: string, targetId: string) {
		return this.backwardEdges.find(edge => 
			edge.getSource().getId() === sourceId && edge.getTarget().getId() === targetId
		);
	}

	getSource(): Node {
		if (!this.s) {
			throw new Error("Source node not defined");
		}
		return this.s;
	}

	getSink(): Node {
		if (!this.t) {
			throw new Error("Sink node not defined");
		}
		return this.t;
	}

	getForwardEdgesFrom(n: Node): Edge[] {
		const node = this.nodes.get(n.getId());
		if (!node) {
			throw new Error(`Node with ID ${n.getId()} not found`);
		}
		return this.forwardEdges.filter(edge => edge.getSource() === node);
	}

	getBackwardEdgesFrom(nodeId: string): Edge[] {
		const node = this.nodes.get(nodeId);
		if (!node) {
			throw new Error(`Node with ID ${nodeId} not found`);
		}
		return this.backwardEdges.filter(edge => edge.getSource() === node);
	}

	// FIXED: This is the key method! Get backward edges in the residual graph
	getBackwardEdgesTo(n: Node): Edge[] {
		const node = this.nodes.get(n.getId());
		if (!node) {
			throw new Error(`Node with ID ${n.getId()} not found`);
		}
		
		// In the residual graph, backward edges are forward edges with positive flow
		// For node n, we want edges that END at n and have flow > 0
		// These become backward edges FROM their original target TO their original source
		const residualBackwardEdges: Edge[] = [];
		
		for (const edge of this.forwardEdges) {
			// If this forward edge ends at node n and has positive flow,
			// it creates a backward edge from n to edge.getSource()
			if (edge.getTarget() === node && edge.getFlow() > 0) {
				residualBackwardEdges.push(edge);
			}
		}
		
		// Also include any explicitly added backward edges
		const explicitBackwardEdges = this.backwardEdges.filter(edge => edge.getTarget() === node);
		
		return [...residualBackwardEdges, ...explicitBackwardEdges];
	}
	
	toString(): string {
		return `NetworkGraph with ${this.nodes.size} nodes and ${this.forwardEdges.length} forward edges and ${this.backwardEdges.length} backward edges`;
	}

	prettyPrint(): string {
		const nodeList = Array.from(this.nodes.values())
			.map(n => `${n.getId()} (${n.getX()}, ${n.getY()})`)
			.join(", ");
		const forwardEdgeList = this.forwardEdges
			.map(e => `${e.getSource().getId()} -> ${e.getTarget().getId()} (Cap: ${e.getCapacity()}, Flow: ${e.getFlow()})`)
			.join(", ");
		const backwardEdgeList = this.backwardEdges
			.map(e => `${e.getSource().getId()} -> ${e.getTarget().getId()} (Cap: ${e.getCapacity()}, Flow: ${e.getFlow()})`)
			.join(", ");
		return `Nodes: [${nodeList}]\nForward Edges: [${forwardEdgeList}]\nBackward Edges: [${backwardEdgeList}]`;
	}

	arrangeNodesForDrawing(width: number = 800, height: number = 600): void {
		if (!this.s || !this.t) {
			throw new Error("Source or sink node not defined.");
		}

		// BFS to compute levels
		const levels: Map<number, Node[]> = new Map();
		const visited: Set<string> = new Set();
		const queue: [Node, number][] = [[this.s, 0]];
		visited.add(this.s.getId());

		while (queue.length > 0) {
			const item = queue.shift();
			if (!item) continue;

			const [currentNode, level] = item;

			if (!levels.has(level)) {
				levels.set(level, []);
			}
			levels.get(level)!.push(currentNode);

			for (const edge of this.forwardEdges) {
				if (edge.getSource() === currentNode && !visited.has(edge.getTarget().getId())) {
					visited.add(edge.getTarget().getId());
					queue.push([edge.getTarget(), level + 1]);
				}
			}
		}

		// Assign positions
		const maxLevel = Math.max(...levels.keys());
		const layerSpacing = width / (maxLevel + 1);

		for (const [level, nodesAtLevel] of levels.entries()) {
			const verticalSpacing = height / (nodesAtLevel.length + 1);
			nodesAtLevel.forEach((node, i) => {
				const paddingX = 100;
				const x = level * layerSpacing + paddingX;
				const y = (i + 1) * verticalSpacing;
				node.setX(x);
				node.setY(y);
			});
		}
	}

	clone(): NetworkGraph {
		const newGraph = new NetworkGraph();
		newGraph.s = this.s ? new Node(this.s.getId(), this.s.getX(), this.s.getY()) : null;
		newGraph.t = this.t ? new Node(this.t.getId(), this.t.getX(), this.t.getY()) : null;

		this.nodes.forEach((n, id) => {
			newGraph.nodes.set(id, new Node(n.getId(), n.getX(), n.getY()));
		});

		this.forwardEdges.forEach(e => {
			const sourceNode = newGraph.nodes.get(e.getSource().getId());
			const targetNode = newGraph.nodes.get(e.getTarget().getId());
			if (sourceNode && targetNode) {
				const newEdge = newGraph.addEdge(sourceNode.getId(), targetNode.getId(), e.getCapacity());
				newEdge.setFlow(e.getFlow()); // Preserve flow state
			}
		});

		this.backwardEdges.forEach(e => {
			const sourceNode = newGraph.nodes.get(e.getSource().getId());
			const targetNode = newGraph.nodes.get(e.getTarget().getId());
			if (sourceNode && targetNode) {
				const newEdge = newGraph.addBackwardEdge(sourceNode.getId(), targetNode.getId(), e.getCapacity());
				newEdge.setFlow(e.getFlow()); // Preserve flow state
			}
		});

		return newGraph;
	}
}

export { NetworkGraph, Node, Edge };