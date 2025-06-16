
class node {
	private id: string; // unique identifier for the node
	private flow: number; // current flow through the node
	private x: number; // x-coordinate for graphical representation
	private y: number; // y-coordinate for graphical representation

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

		this.id = id; // unique identifier for the node
		this.flow = 0; // current flow through the node

		this.x = x; // random x-coordinate for graphical representation
		this.y = y; // random y-coordinate for graphical representation
	}

	getId() {
		return this.id; // returns the unique identifier for the node
	}

	getX() {
		return this.x; // returns the x-coordinate for graphical representation
	}
	getY() {
		return this.y; // returns the y-coordinate for graphical representation
	}

	setX(x: number) {
		if (typeof x !== 'number') {
			throw new Error("X coordinate must be a number");
		}
		this.x = x; // sets the x-coordinate for graphical representation
	}
	setY(y: number) {
		if (typeof y !== 'number') {
			throw new Error("Y coordinate must be a number");
		}
		this.y = y; // sets the y-coordinate for graphical representation
	}
}

class edge {
	private source: node; // source node of the edge
	private target: node; // target node of the edge
	private capacity: number; // capacity of the edge
	private flow: number; // current flow through the edge

	constructor(source: node, target: node, capacity: number) {

		if (capacity <= 0) {
			throw new Error("Capacity must be greater than 0");
		}
		if (!source || !target) {
			throw new Error("Source and target nodes must be defined");
		}
		if (source === target) {
			throw new Error("Source and target nodes cannot be the same");
		}

		this.source = source; // source node
		this.target = target; // target node
		this.capacity = capacity; // capacity of the edge
		this.flow = 0; // current flow through the edge
	}

	getSource() {
		return this.source; // returns the source node
	}
	getTarget() {
		return this.target; // returns the target node
	}
	getCapacity() {
		return this.capacity; // returns the capacity of the edge
	}
	setCapacity(newCapacity: number): void {
    if (newCapacity < 0) {
        throw new Error("Capacity cannot be negative");
    }
    this.capacity = newCapacity;
	}
	getFlow() {
		return this.flow; // returns the current flow through the edge
	}
	setFlow(flow: number) {
		if (flow < 0 || flow > this.capacity) {
			throw new Error("Flow must be between 0 and the edge's capacity");
		}
		this.flow = flow; // sets the current flow through the edge
	}
}

// NetworkGraph class to represent the entire network graph
class NetworkGraph {

	private nodes: Map<string, node>; // Map to hold nodes by their IDs
	private edges: edge[]; // Array to hold edges
	private t: node | null = null; // Sink node, initially null
	private s: node | null = null; // Source node, initially null

	constructor() {
		this.nodes = new Map<string, node>(); // Map to hold nodes by their IDs
		this.edges = []; // Array to hold edges
	}

	addSource(id: string) {
		if (this.s) {
			throw new Error("Source node already exists");
		}
		if (this.nodes.has(id)) {
			throw new Error(`Node with ID ${id} already exists`);
		}
		this.s = new node(id, 0, 0); // Create a new source node with default coordinates (0, 0)
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
		this.t = new node(id, 0, 0); // Create a new sink node with default coordinates (0, 0)
		this.nodes.set(id, this.t);
		return this.t;
	}

	addNode(id: string) {
		if (this.nodes.has(id)) {
			throw new Error(`Node with ID ${id} already exists`);
		}
		const newNode = new node(id, 0, 0); // Create a new node with default coordinates (0, 0)
		this.nodes.set(id, newNode);
		return newNode;
	}

	addEdge(sourceId: string, targetId: string, capacity: number) {
		const sourceNode = this.nodes.get(sourceId);
		const targetNode = this.nodes.get(targetId);
		if (!sourceNode || !targetNode) {
			throw new Error(`Source or target node not found: ${sourceId}, ${targetId}`);
		}
		const newEdge = new edge(sourceNode, targetNode, capacity);
		this.edges.push(newEdge);
		return newEdge;
	}

	getNodes() {
		return Array.from(this.nodes.values());
	}
	getEdges() {
		return this.edges;
	}

	getNode(id: string) {
		return this.nodes.get(id);
	}

	getEdge(sourceId: string, targetId: string) {
		return this.edges.find(edge => edge.getSource().getId() === sourceId && edge.getTarget().getId() === targetId);
	}

	getSource() {
		if (!this.s) {
			throw new Error("Source node not defined");
		}
		return this.s;
	}

	getSink() {
		if (!this.t) {
			throw new Error("Sink node not defined");
		}
		return this.t;
	}

	getEdgesFrom(nodeId: string) {
		const node = this.nodes.get(nodeId);
		if (!node) {
			throw new Error(`Node with ID ${nodeId} not found`);
		}
		return this.edges.filter(edge => edge.getSource() === node);
	}


	toString() {
		return `NetworkGraph with ${this.nodes.size} nodes and ${this.edges.length} edges`;
	}

	prettyPrint() {
		const nodeList = Array.from(this.nodes.values()).map(n => `${n.getId()} (${n.getX()}, ${n.getY()})`).join(", ");
		const edgeList = this.edges.map(e => `${e.getSource().getId()} -> ${e.getTarget().getId()} (Capacity: ${e.getCapacity()}, Flow: ${e.getFlow()})`).join(", ");
		return `Nodes: [${nodeList}]\nEdges: [${edgeList}]`;
	}

	clear() {
		this.nodes.clear(); // Clear all nodes
		this.edges = []; // Clear all edges
		this.s = null; // Reset source node
		this.t = null; // Reset sink node
	}

	arrangeNodesForDrawing(width: number = 800, height: number = 600): void {
		if (!this.s || !this.t) {
			throw new Error("Source or sink node not defined.");
		}

		// Step 1: BFS to compute levels
		const levels: Map<number, node[]> = new Map();
		const visited: Set<string> = new Set();
		const queue: [node, number][] = [[this.s, 0]];
		visited.add(this.s.getId());

		while (queue.length > 0) {
			const item = queue.shift();
			if (!item) continue;

			const [currentNode, level] = item;

			if (!levels.has(level)) {
				levels.set(level, []);
			}
			levels.get(level)!.push(currentNode);

			for (const edge of this.edges) {
				if (edge.getSource() === currentNode && !visited.has(edge.getTarget().getId())) {
					visited.add(edge.getTarget().getId());
					queue.push([edge.getTarget(), level + 1]);
				}
			}
		}

		// Step 2: Assign positions
		const maxLevel = Math.max(...levels.keys());
		const layerSpacing = width / (maxLevel + 1);

		for (const [level, nodesAtLevel] of levels.entries()) {
			const verticalSpacing = height / (nodesAtLevel.length + 1);
			nodesAtLevel.forEach((node, i) => {
				const x = level * layerSpacing;
				const y = (i + 1) * verticalSpacing;
				node.setX(x);
				node.setY(y);
			});
		}
	}

	clone(): NetworkGraph {
		const newGraph = new NetworkGraph();
		newGraph.s = this.s ? new node(this.s.getId(), this.s.getX(), this.s.getY()) : null;
		newGraph.t = this.t ? new node(this.t.getId(), this.t.getX(), this.t.getY()) : null;

		this.nodes.forEach((n, id) => {
			newGraph.nodes.set(id, new node(n.getId(), n.getX(), n.getY()));
		});

		this.edges.forEach(e => {
			const sourceNode = newGraph.nodes.get(e.getSource().getId());
			const targetNode = newGraph.nodes.get(e.getTarget().getId());
			if (sourceNode && targetNode) {
				newGraph.addEdge(sourceNode.getId(), targetNode.getId(), e.getCapacity());
			}
		});

		return newGraph;
	}

}


export { NetworkGraph, node, edge };