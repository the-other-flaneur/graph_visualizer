import { NetworkGraph, Node, Edge } from './NetworkGraph.js';
import { SVGRenderer } from './SVGRenderer.js';
import { Parser } from './Parser.js';
import { FordFulkerson } from './algorithms/FordFulkerson.js';
import { EdmondsKarp } from './algorithms/EdmondsKarp.js';
import { Dinic } from './algorithms/Dinics.js';
import type { Algorithm } from './algorithms/Algorithm.js';

function canonicalizeUserInput(raw: string): string {
  const lines = raw
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const nodeSet = new Set<string>();
  const edges: string[] = [];

  for (const line of lines) {
    const edgeMatch = line.match(/^([a-zA-Z0-9])([a-zA-Z0-9]):(\d+)$/);
    if (edgeMatch) {
      const [, from, to, capacity] = edgeMatch;
      nodeSet.add(from);
      nodeSet.add(to);
      edges.push(`${from}${to}:${capacity}`);
      continue;
    }
    if (/^[a-zA-Z0-9]$/.test(line)) {
      nodeSet.add(line);
      continue;
    }
    throw new Error(`Invalid input line: "${line}"`);
  }

  if (!nodeSet.has("s")) throw new Error("Missing source node 's'");
  if (!nodeSet.has("t")) throw new Error("Missing sink node 't'");

  const intermediates = [...nodeSet]
    .filter(id => id !== "s" && id !== "t")
    .sort();

  for (const edge of edges) {
    const [from, to] = edge.split(":")[0].split("");
    if (!nodeSet.has(from) || !nodeSet.has(to)) {
      throw new Error(`Edge ${edge} references non-existent node(s)`);
    }
  }

  return ["s", "t", ...intermediates, ...edges].join("\n");
}

class MaxFlowVisualizer {
  private renderer!: SVGRenderer;
  private graph!: NetworkGraph;
  private currentAlgorithm!: string;
  private speed: number = 1;
  private algorithm!: Algorithm;

  private $(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element #${id} not found`);
    return el;
  }

  initializeEventListeners(): void {

    const algorithmSelect = this.$('algorithmSelect') as HTMLSelectElement;
    algorithmSelect.addEventListener('change', () => {
      this.currentAlgorithm = algorithmSelect.value;
      this.updateAlgorithmInfo();
      this.createAlgorithmInstance();
      this.updateState();
      console.log(`Algorithm changed to: ${this.currentAlgorithm}`);
    });

    this.$('loadBulkBtn').addEventListener('click', () => this.loadBulkGraph());

    this.$('clearBtn').addEventListener('click', () => {
      this.graph = new NetworkGraph();
      this.renderer.clear();
      this.createAlgorithmInstance();
      this.algorithm.initialize(this.graph);
      this.updateStepInfo('', 0);
      this.updateState();
    });

    this.$('solveBtn').addEventListener('click', () => {
      console.log("solve btn pressed");

      this.createAlgorithmInstance();

      this.algorithm.solve();
      this.updateState();
      this.updateStepInfo(this.algorithm.stepInfo, this.algorithm.stepCount);
    });
    
    this.$('playBtn').addEventListener('click', () => {
      console.log("play btn pressed");

      this.createAlgorithmInstance();

      setInterval(() => {
        if (this.algorithm && !this.algorithm.finished) {
          this.algorithm.step();
          this.updateState();
          this.updateStepInfo(this.algorithm.stepInfo, this.algorithm.stepCount);
        }
      }, 1000 / this.speed);
    });
    
    this.$('pauseBtn').addEventListener('click', () => {
      console.log("pause btn pressed")
      // pause functionality can be implemented if needed
    });

    this.$('stepBtn').addEventListener('click', () => {
      if (this.algorithm) {
        this.algorithm.step();
        this.updateState();
        this.updateStepInfo(this.algorithm.stepInfo, this.algorithm.stepCount);
      } else {
        console.error("Algorithm not initialized");
      }
    });

    const speedSlider = this.$('speedSlider') as HTMLInputElement;
    speedSlider.addEventListener('input', () => {
      this.speed = parseFloat(speedSlider.value);
      this.$('speedValue').textContent = `${this.speed}x`;
    });

    console.log("Event listeners initialized");
  }

  private createAlgorithmInstance(): void {

    const algorithmSelect = this.$('algorithmSelect') as HTMLSelectElement;
    this.currentAlgorithm = algorithmSelect.value;
      
    switch (this.currentAlgorithm) {
      case 'ford-fulkerson':
        this.algorithm = new FordFulkerson();
        break;
      case 'dinic':
        this.algorithm = new Dinic();
        break;
      case 'edmonds-karp':
        this.algorithm = new EdmondsKarp();
        break;
    }

    this.algorithm.initialize(this.graph || new NetworkGraph());

    console.log(`Created instance of: ${this.algorithm.name}`);
  }

  updateAlgorithmInfo() {
    const info = this.$('algorithmInfo');
    const algorithms = {
      'edmonds-karp': '<strong>Edmonds-Karp Algorithm</strong><br>Uses BFS to find augmenting paths.',
      'ford-fulkerson': '<strong>Ford-Fulkerson Algorithm</strong><br>Uses DFS to find augmenting paths.',
      'dinic': '<strong>Dinic\'s Algorithm</strong><br>Builds level graphs using BFS, then DFS for blocking flows.'
    } as const;

    info.innerHTML = algorithms[this.currentAlgorithm as keyof typeof algorithms] ?? 'Unknown algorithm selected.';
  }

  updateStepInfo(stepInfo: string, stepCount: number) {
    const stepInfoEl = this.$('stepInfo');
    stepInfoEl.textContent = stepInfo;
    this.$('stepIndicator').textContent = `Step: ${stepCount}`;
  }

  updateState() {
    const state = this.algorithm.getCurrentState();
    this.$('stepInfo').textContent = state.stepInfo;
    this.$('stepCountValue').textContent = state.stepCount.toString();
    this.$('maxFlowValue').textContent = state.maxFlow?.toString() || '0';
    this.$('timeValue').textContent = state.startTime !== undefined && state.startTime !== 0
      ? `${performance.now() - state.startTime} ms`
      : '0';
    this.highlightPath(state.highlightedNodes, state.highlightedEdges);
    this.updateStepInfo(state.stepInfo, state.stepCount);
  }

  highlightPath(highlightedNodes: Node[], highlightedEdges: Edge[]) {
    console.log("Highlighting path");
    console.log(`Highlighted nodes: ${highlightedNodes.map(n => n.getId()).join(', ')}`);
    console.log(`Highlighted edges: ${highlightedEdges.map(e => `${e.getSource().getId()}-${e.getTarget().getId()}`).join(', ')}`);
    
    this.renderer.render(this.graph);

    for (const n of highlightedNodes) {
      this.renderer.highlightNode(n.getId());
    }
    for (const e of highlightedEdges) {
      this.renderer.highlightEdge(e.getSource().getId(), e.getTarget().getId());
    }
  }

  loadBulkGraph() {
    const input = this.$('bulkInput') as HTMLTextAreaElement;
    const raw = input.value.trim();

    try {
      const canonical = canonicalizeUserInput(raw);
      const parser = new Parser(canonical);
      
      this.graph = parser.parse();
      this.graph.arrangeNodesForDrawing();

      this.renderer.render(this.graph);

      input.value = canonical;
    } catch (e) {
      alert(`Error loading graph: ${(e as Error).message}`);
    }

    console.log(`Graph loaded with ${this.graph.getNodes().length} nodes and ${this.graph.getForwardEdges().length} forward edges.`);
  }

  start() {
    console.log('start called');
    this.initializeEventListeners();
    this.renderer = new SVGRenderer("graph-canvas", this.graph || new NetworkGraph());
  }
}

export { MaxFlowVisualizer };
