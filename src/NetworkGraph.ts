
class Node {
	private id: string; // unique identifier for the node
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

class Edge {
	private source: Node; // source node of the edge
	private target: Node; // target node of the edge
	private origCapacity: number; // original capacity of the edge
	private capacity: number; // capacity of the edge
	private flow: number; // current flow through the edge

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

		this.source = source; // source node
		this.target = target; // target node
		this.capacity = capacity; // capacity of the edge
		this.flow = 0; // current flow through the edge
		this.origCapacity = capacity; // original capacity of the edge
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

	setOrigCapacity(origCapacity: number) {
		if (origCapacity < 0) {
			throw new Error("Original capacity cannot be negative");
		}
		this.origCapacity = origCapacity; // sets the original capacity of the edge
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
		return this.flow; // returns the current flow through the edge
	}
	setFlow(flow: number) {
		if (flow < 0 || flow > this.capacity) {
			throw new Error("Flow must be between 0 and the edge's capacity");
		}
		this.flow = flow; // sets the current flow through the edge
	}
	
	augment(flow: number) {
		if (flow < 0) {
			throw new Error("Flow to augment cannot be negative");
		}
		if (this.flow + flow > this.capacity) {
			throw new Error("Augmented flow exceeds edge capacity");
		}
		this.flow += flow; // augments the flow through the edge
	}

	getResidualCapacity(): number {
		return this.capacity - this.flow; // returns the residual capacity of the edge
	}
}


/**
 * Represents a directed network graph with support for source and sink nodes,
 * forward and backward edges, and node arrangement for visualization.
 *
 * This class provides methods to add nodes, edges, source and sink nodes,
 * retrieve nodes and edges, clear the graph, arrange nodes for drawing,
 * and clone the graph structure.
 *
 * - Nodes are stored in a map by their IDs.
 * - Forward and backward edges are stored in separate arrays.
 * - Source and sink nodes are tracked separately.
 *
 * Typical usage includes building flow networks for algorithms such as
 * maximum flow, and visualizing layered graphs.
 *
 * @remarks
 * Requires `node` and `edge` classes with appropriate methods such as
 * `getId()`, `getX()`, `getY()`, `setX()`, `setY()`, `getSource()`, `getTarget()`,
 * `getCapacity()`, and `getFlow()`.
 *
 * @example
 * ```typescript
 * const graph = new NetworkGraph();
 * graph.addSource("s");
 * graph.addSink("t");
 * graph.addNode("a");
 * graph.addEdge("s", "a", 10);
 * graph.addEdge("a", "t", 5);
 * graph.arrangeNodesForDrawing();
 * console.log(graph.prettyPrint());
 * ```
 */
class NetworkGraph {

	private nodes: Map<string, Node>; // Map to hold nodes by their IDs
	private forwardEdges: Edge[]; // Array to hold edges
	private backwardEdges: Edge[]; // Array to hold backward edges
	private t: Node | null = null; // Sink node, initially null
	private s: Node | null = null; // Source node, initially null

	constructor() {
		this.nodes = new Map<string, Node>(); // Map to hold nodes by their IDs
		this.forwardEdges = []; // Array to hold edges
		this.backwardEdges = [];
	}

	addSource(id: string) {
		if (this.s) {
			throw new Error("Source node already exists");
		}
		if (this.nodes.has(id)) {
			throw new Error(`Node with ID ${id} already exists`);
		}
		this.s = new Node(id, 0, 0); // Create a new source node with default coordinates (0, 0)
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
		this.t = new Node(id, 0, 0); // Create a new sink node with default coordinates (0, 0)
		this.nodes.set(id, this.t);
		return this.t;
	}

	addNode(id: string) {
		if (this.nodes.has(id)) {
			throw new Error(`Node with ID ${id} already exists`);
		}
		const newNode = new Node(id, 0, 0); // Create a new node with default coordinates (0, 0)
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

	// Get all edges (both forward and backward)
	getEdges() {
		return [...this.forwardEdges, ...this.backwardEdges];
	}

	getNode(id: string) {
		return this.nodes.get(id);
	}

	getForwardEdge(sourceId: string, targetId: string) {
		return this.forwardEdges.find(edge => edge.getSource().getId() === sourceId && edge.getTarget().getId() === targetId);
	}

	getBackwardEdge(sourceId: string, targetId: string) {
		return this.backwardEdges.find(edge => edge.getSource().getId() === sourceId && edge.getTarget().getId() === targetId);
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

	toString(): string {
		return `NetworkGraph with ${this.nodes.size} nodes and ${this.forwardEdges.length} forward edges and ${this.backwardEdges.length} backward edges`;
	}

	prettyPrint(): string {
		const nodeList = Array.from(this.nodes.values()).map(n => `${n.getId()} (${n.getX()}, ${n.getY()})`).join(", ");
		const forwardEdgeList = this.forwardEdges.map(e => `${e.getSource().getId()} -> ${e.getTarget().getId()} (Capacity: ${e.getCapacity()}, Flow: ${e.getFlow()})`).join(", ");
		const backwardEdgeList = this.backwardEdges.map(e => `${e.getSource().getId()} -> ${e.getTarget().getId()} (Capacity: ${e.getCapacity()}, Flow: ${e.getFlow()})`).join(", ");
		return `Nodes: [${nodeList}]\nForward Edges: [${forwardEdgeList}]\nBackward Edges: [${backwardEdgeList}]`;
	}

	arrangeNodesForDrawing(width: number = 800, height: number = 600): void {
		if (!this.s || !this.t) {
			throw new Error("Source or sink node not defined.");
		}

		// Step 1: BFS to compute levels
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

		// Step 2: Assign positions
		const maxLevel = Math.max(...levels.keys());
		const layerSpacing = width / (maxLevel + 1);

		for (const [level, nodesAtLevel] of levels.entries()) {
			const verticalSpacing = height / (nodesAtLevel.length + 1);
			nodesAtLevel.forEach((node, i) => {
				const paddingX = 100; // adjust as needed
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
				newGraph.addEdge(sourceNode.getId(), targetNode.getId(), e.getCapacity());
			}
		});

		this.backwardEdges.forEach(e => {
			const sourceNode = newGraph.nodes.get(e.getSource().getId());
			const targetNode = newGraph.nodes.get(e.getTarget().getId());
			if (sourceNode && targetNode) {
				newGraph.addBackwardEdge(sourceNode.getId(), targetNode.getId(), e.getCapacity());
			}
		});

		return newGraph;
	}
}


export { NetworkGraph, Node, Edge };