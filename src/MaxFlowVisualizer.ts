import { NetworkGraph } from './NetworkGraph.js';
import { node } from './NetworkGraph.js';
import { edge } from './NetworkGraph.js';
import { SVGRenderer } from './SVGRenderer.js';
import { Parser } from './Parser.js';

class MaxFlowVisualizer {
    private renderer!: SVGRenderer;
    private graph: NetworkGraph;
    private currentAlgorithm: string = 'edmonds-karp'; // Default algorithm

    constructor() {
        // Nothing here to avoid DOM issues — we’ll initialize in start()
        this.graph = new NetworkGraph();
    }

    start() {
        this.renderer = new SVGRenderer("graph-canvas");
        this.initializeEventListeners();
    }

    // Get the SVG canvas element and cache it for rendering
    private getCanvasElement(): SVGSVGElement {
        const el = document.getElementById('graph-canvas');
        if (!(el instanceof SVGSVGElement)) {
            throw new Error('graph-canvas must be an <svg>');
        }
        return el;
    }

    initializeEventListeners(): void {
        // Safe helper to get elements
        const $ = <T extends HTMLElement>(id: string): T => {
            const el = document.getElementById(id);
            if (!el) {
                console.warn(`Element #${id} not found.`);
                throw new Error(`Missing required element: #${id}`);
            }
            return el as T;
        };

        // Canvas click
        // this.getCanvasElement().addEventListener('click', (e) => this.handleCanvasClick(e));

        // Control buttons
        $('loadBulkBtn').addEventListener('click', () => this.loadBulkGraph());

        /*
        $('playBtn').addEventListener('click', () => this.startAnimation());
        $('pauseBtn').addEventListener('click', () => this.pauseAnimation());
        $('stepBtn').addEventListener('click', () => this.stepAnimation());
        $('resetBtn').addEventListener('click', () => this.resetAnimation());

        // Speed slider
        const speedSlider = $('speedSlider') as HTMLInputElement;
        speedSlider.addEventListener('input', () => {
            this.animationSpeed = parseFloat(speedSlider.value);
            $('speedValue').textContent = `${this.animationSpeed}x`;
        });
        */

        // Algorithm selector
        const algorithmSelect = $('algorithmSelect') as HTMLSelectElement;
        algorithmSelect.addEventListener('change', () => {
            this.currentAlgorithm = algorithmSelect.value;
            this.updateAlgorithmInfo();
        });

        // TODO: Add enter key support or other input events here if needed
    }

    private $(id: string): HTMLElement {
        const el = document.getElementById(id);
        if (!el) {
            throw new Error(`Element #${id} not found`);
        }
        return el;
    }


    updateAlgorithmInfo() {
        const info = this.$('algorithmInfo');
        const algorithms = {
            'edmonds-karp': '<strong>Edmonds-Karp Algorithm</strong><br>Uses BFS to find augmenting paths. Guarantees O(VE²) time complexity by always choosing the shortest augmenting path.',
            'ford-fulkerson': '<strong>Ford-Fulkerson Algorithm</strong><br>Uses DFS to find augmenting paths. Time complexity depends on the maximum flow value. May not terminate with irrational capacities.',
            'dinic': '<strong>Dinic\'s Algorithm</strong><br>Builds level graphs using BFS, then uses DFS to find blocking flows. Achieves O(V²E) time complexity through efficient path finding.'
        } as const;

        type AlgorithmKey = keyof typeof algorithms;

        if (this.currentAlgorithm in algorithms) {
            info.innerHTML = algorithms[this.currentAlgorithm as AlgorithmKey];
        } else {
            info.innerHTML = 'Unknown algorithm selected.';
        }
    }

    loadBulkGraph() {
        const bulkInput = this.$('bulkInput') as HTMLTextAreaElement;
        const bulkData = bulkInput.value.trim();
        if (!bulkData) {
            alert('Please enter bulk graph data');
            return;
        }
        try {
            const parser = new Parser(bulkData);
            this.graph = parser.parse();
            } catch (error) {
                if (error instanceof Error) {
                    alert(`Error parsing bulk data: ${error.message}`);
                } else {
                    alert('Error parsing bulk data: Unknown error');
                }
            }
            bulkInput.value = ''; // Clear input after loading
            console.log(this.graph.prettyPrint());
            this.graph.arrangeNodesForDrawing(); // Arrange nodes for better visualization

            this.renderer.clear(); // Clear previous graph
            this.graph.getNodes().forEach(node => {
                this.renderer.drawNode(node.getId(), node.getX(), node.getY(), node.getId());
            }
            );
            this.graph.getEdges().forEach(edge => {
                const fromNode = this.graph.getNode(edge.getSource().getId());
                const toNode = this.graph.getNode(edge.getTarget().getId());
                if (fromNode && toNode) {
                    this.renderer.drawEdge(fromNode.getX(), fromNode.getY(), toNode.getX(), toNode.getY(), edge.getCapacity().toString());
                }
            }
            );
    }
        /*
            handleCanvasClick(e) {
                const rect = this.canvas.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 800;
                const y = ((e.clientY - rect.top) / rect.height) * 600;

                switch (this.mode) {
                    case 'add-node':
                        this.addNode(x, y);
                        break;
                    case 'add-edge':
                    case 'set-source':
                    case 'set-sink':
                        const clickedNode = this.findNodeAt(x, y);
                        if (clickedNode) {
                            this.handleNodeClick(clickedNode);
                        }
                        break;
                }
            }

            handleNodeClick(node) {
                switch (this.mode) {
                    case 'add-edge':
                        this.selectedNodes.push(node);
                        if (this.selectedNodes.length === 2) {
                            this.addEdge(this.selectedNodes[0], this.selectedNodes[1]);
                            this.selectedNodes = [];
                        }
                        break;
                    case 'set-source':
                        this.source = node;
                        this.setMode('add-node');
                        this.renderGraph();
                        break;
                    case 'set-sink':
                        this.sink = node;
                        this.setMode('add-node');
                        this.renderGraph();
                        break;
                }
            }

	    // to networkGraph
            clearGraph() {
                this.nodes = [];
                this.edges = [];
                this.source = null;
                this.sink = null;
                this.selectedNodes = [];
                this.renderGraph();
                this.updateStats(0, 0, 0, 0);
            }

            renderGraph() {
                const svg = this.canvas;
                
                // Clear existing elements
                const existingElements = svg.querySelectorAll('.node, .edge, .edge-label, .node-label');
                existingElements.forEach(el => el.remove());

                // Render edges
                this.edges.forEach(edge => {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('class', 'edge');
                    line.setAttribute('x1', edge.from.x);
                    line.setAttribute('y1', edge.from.y);
                    line.setAttribute('x2', edge.to.x);
                    line.setAttribute('y2', edge.to.y);
                    svg.appendChild(line);

                    // Edge label
                    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.setAttribute('class', 'edge-label');
                    label.setAttribute('x', (edge.from.x + edge.to.x) / 2);
                    label.setAttribute('y', (edge.from.y + edge.to.y) / 2);
                    label.textContent = `${edge.flow}/${edge.capacity}`;
                    svg.appendChild(label);
                });

                // Render nodes
                this.nodes.forEach(node => {
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('class', 'node');
                    circle.setAttribute('cx', node.x);
                    circle.setAttribute('cy', node.y);
                    circle.setAttribute('r', 25);
                    
                    if (node === this.source) {
                        circle.classList.add('source');
                    } else if (node === this.sink) {
                        circle.classList.add('sink');
                    }
                    
                    svg.appendChild(circle);

                    // Node label
                    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.setAttribute('class', 'node-label');
                    label.setAttribute('x', node.x);
                    label.setAttribute('y', node.y + 5);
                    label.textContent = node.label;
                    svg.appendChild(label);
                });
            }
		
	    // to animation controler
            startAnimation() {
                if (!this.source || !this.sink) {
                    alert('Please set both source and sink nodes before starting the animation.');
                    return;
                }
                
                this.isPlaying = true;
                document.getElementById('playBtn').disabled = true;
                document.getElementById('pauseBtn').disabled = false;
                
                // Here you would implement the actual algorithm
                // For now, just show a placeholder
                setTimeout(() => {
                    this.updateStats(15, 3, 3, 150);
                    this.isPlaying = false;
                    document.getElementById('playBtn').disabled = false;
                    document.getElementById('pauseBtn').disabled = true;
                }, 2000);
            }

            pauseAnimation() {
                this.isPlaying = false;
                document.getElementById('playBtn').disabled = false;
                document.getElementById('pauseBtn').disabled = true;
            }

            stepAnimation() {
                // Implement single step of algorithm
                console.log('Step animation');
            }

            resetAnimation() {
                this.isPlaying = false;
                // Reset all edge flows
                this.edges.forEach(edge => edge.flow = 0);
                this.renderGraph();
                this.updateStats(0, 0, 0, 0);
                document.getElementById('playBtn').disabled = false;
                document.getElementById('pauseBtn').disabled = true;
            }

            updateStats(maxFlow, iterations, paths, time) {
                document.getElementById('maxFlowValue').textContent = maxFlow;
                document.getElementById('iterationsValue').textContent = iterations;
                document.getElementById('pathsValue').textContent = paths;
                document.getElementById('timeValue').textContent = time + 'ms';
            }
    */
}

export { MaxFlowVisualizer };

/*
s
t
A
B
C
D
sA:10
sB:10
AC:10
BD:10
Ct:10
Dt:10
*/