import { NetworkGraph, Node, Edge } from './NetworkGraph.js';
import { SVGRenderer } from './SVGRenderer.js';
import { Parser } from './Parser.js';
import { FordFulkerson } from './algorithms/FordFulkerson.js';
import { EdmondsKarp } from './algorithms/EdmondsKarp.js';
import { Dinic } from './algorithms/Dinics.js';
import type { Algorithm } from './algorithms/Algorithm.js';

class UIState {
  private elements: { [key: string]: HTMLElement } = {};

  constructor() {
    this.cacheElements();
  }

  private cacheElements(): void {
    const elementIds = [
      'algorithmSelect', 'loadGraphBtn', 'clearBtn', 'solveBtn', 
      'playBtn', 'pauseBtn', 'stepBtn', 'speedSlider', 'speedValue',
      'algorithmInfo', 'stepInfo', 'stepIndicator', 'stepCountValue',
      'maxFlowValue', 'timeValue', 'graphInput'
    ];

    for (const id of elementIds) {
      const element = document.getElementById(id);
      if (!element) throw new Error(`Element #${id} not found`);
      this.elements[id] = element;
    }
  }

  get(id: string): HTMLElement {
    return this.elements[id];
  }

  getAs<T extends HTMLElement>(id: string): T {
    return this.elements[id] as T;
  }
}

class AlgorithmManager {
  private static readonly ALGORITHM_INFO = {
    'edmonds-karp': '<strong>Edmonds-Karp Algorithm</strong><br>Uses BFS to find augmenting paths.',
    'ford-fulkerson': '<strong>Ford-Fulkerson Algorithm</strong><br>Uses DFS to find augmenting paths.',
    'dinic': '<strong>Dinic\'s Algorithm</strong><br>Builds level graphs using BFS, then DFS for blocking flows.'
  } as const;

  static createInstance(algorithmType: string, graph: NetworkGraph): Algorithm {
    switch (algorithmType) {
      case 'ford-fulkerson':
        return new FordFulkerson().initialize(graph);
      case 'dinic':
        return new Dinic().initialize(graph);
      case 'edmonds-karp':
        return new EdmondsKarp().initialize(graph);
      default:
        throw new Error(`Unknown algorithm: ${algorithmType}`);
    }
  }

  static getInfo(algorithmType: string): string {
    return this.ALGORITHM_INFO[algorithmType as keyof typeof this.ALGORITHM_INFO] 
      ?? 'Unknown algorithm selected.';
  }
}

class GraphManager {
  static parseInput(raw: string): NetworkGraph {
    const canonical = this.canonicalizeInput(raw);
    const parser = new Parser(canonical);
    const graph = parser.parse();
    graph.arrangeNodesForDrawing();
    return graph;
  }

  private static canonicalizeInput(raw: string): string {
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

    this.validateRequiredNodes(nodeSet);
    this.validateEdges(edges, nodeSet);

    const intermediates = [...nodeSet]
      .filter(id => id !== "s" && id !== "t")
      .sort();

    return ["s", "t", ...intermediates, ...edges].join("\n");
  }

  private static validateRequiredNodes(nodeSet: Set<string>): void {
    if (!nodeSet.has("s")) throw new Error("Missing source node 's'");
    if (!nodeSet.has("t")) throw new Error("Missing sink node 't'");
  }

  private static validateEdges(edges: string[], nodeSet: Set<string>): void {
    for (const edge of edges) {
      const [from, to] = edge.split(":")[0].split("");
      if (!nodeSet.has(from) || !nodeSet.has(to)) {
        throw new Error(`Edge ${edge} references non-existent node(s)`);
      }
    }
  }
}

class AnimationController {
  private intervalId: number | null = null;
  private isRunning: boolean = false;

  start(algorithm: Algorithm, speed: number, updateCallback: () => void): void {
    if (this.isRunning) this.stop();
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      if (algorithm && !algorithm.finished && this.isRunning) {
        algorithm.step();
        updateCallback();
        if (algorithm.finished) {
          this.stop();
        }
      } else {
        this.stop();
      }
    }, 1000 / speed);
  }

  stop(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  get running(): boolean {
    return this.isRunning;
  }
}

class MaxFlowVisualizer {
  private ui: UIState;
  private renderer: SVGRenderer;
  private graph: NetworkGraph;
  private algorithm: Algorithm | null = null;
  private animationController: AnimationController;
  private speed: number = 1;
  private currentAlgorithmType: string = 'ford-fulkerson';

  constructor() {
    this.ui = new UIState();
    this.renderer = new SVGRenderer("graph-canvas");
    this.graph = new NetworkGraph();
    this.animationController = new AnimationController();
  }

  start(): void {
    console.log('Max Flow Visualizer Started');
    this.initializeEventListeners();
    this.initializeUI();
  }

  private initializeUI(): void {
    // Set initial algorithm info
    this.updateAlgorithmInfo();
    // Initialize speed display
    this.ui.get('speedValue').textContent = `${this.speed}x`;
    // Clear initial state
    this.updateStats({ stepInfo: '', stepCount: 0, maxFlow: 0, executionTime: 0 });
  }

  private initializeEventListeners(): void {
    // Algorithm selection
    this.ui.getAs<HTMLSelectElement>('algorithmSelect')
      .addEventListener('change', this.handleAlgorithmChange.bind(this));

    // Graph controls
    this.ui.get('loadGraphBtn').addEventListener('click', this.handleLoadGraph.bind(this));
    this.ui.get('clearBtn').addEventListener('click', this.handleClearGraph.bind(this));

    // Algorithm controls
    this.ui.get('solveBtn').addEventListener('click', this.handleSolve.bind(this));
    this.ui.get('playBtn').addEventListener('click', this.handlePlay.bind(this));
    this.ui.get('pauseBtn').addEventListener('click', this.handlePause.bind(this));
    this.ui.get('stepBtn').addEventListener('click', this.handleStep.bind(this));

    // Speed control
    this.ui.getAs<HTMLInputElement>('speedSlider')
      .addEventListener('input', this.handleSpeedChange.bind(this));

    console.log("Event listeners initialized");
  }

  // Event handlers
  private handleAlgorithmChange(): void {
    const select = this.ui.getAs<HTMLSelectElement>('algorithmSelect');
    this.currentAlgorithmType = select.value;
    this.updateAlgorithmInfo();
    this.resetAlgorithm();
    console.log(`Algorithm changed to: ${this.currentAlgorithmType}`);
  }

  private handleLoadGraph(): void {
    const input = this.ui.getAs<HTMLTextAreaElement>('graphInput');
    const raw = input.value.trim();
    
    try {
      this.graph = GraphManager.parseInput(raw);
      this.renderer.render(this.graph);
      this.resetAlgorithm();
      
      // Update input with canonicalized version
      const canonicalLines = [];
      canonicalLines.push('s', 't');
      this.graph.getNodes()
        .filter(n => n.getId() !== 's' && n.getId() !== 't')
        .sort((a, b) => a.getId().localeCompare(b.getId()))
        .forEach(n => canonicalLines.push(n.getId()));
      
      this.graph.getForwardEdges().forEach(e => {
        canonicalLines.push(`${e.getSource().getId()}${e.getTarget().getId()}:${e.getCapacity()}`);
      });
      
      input.value = canonicalLines.join('\n');
      
      console.log(`Graph loaded: ${this.graph.getNodes().length} nodes, ${this.graph.getForwardEdges().length} edges`);
    } catch (error) {
      alert(`Error loading graph: ${(error as Error).message}`);
    }
  }

  private handleClearGraph(): void {
    console.log("Clearing graph");
    this.graph = new NetworkGraph();
    this.renderer.clear();
    this.resetAlgorithm();
    this.updateStats({ stepInfo: '', stepCount: 0, maxFlow: 0, executionTime: 0 });
  }

  private handleSolve(): void {
    console.log("Solving instantly");
    this.initializeAlgorithm();
    if (!this.algorithm) return;

    const startTime = performance.now();
    this.algorithm.solve();
    const executionTime = performance.now() - startTime;
    
    this.updateVisualization();
    this.updateStats({
      stepInfo: this.algorithm.stepInfo,
      stepCount: this.algorithm.stepCount,
      maxFlow: this.algorithm.getCurrentState().maxFlow || 0,
      executionTime
    });
  }

  private handlePlay(): void {
    console.log("Starting animation");
    this.initializeAlgorithm();
    if (!this.algorithm) return;

    this.animationController.start(
      this.algorithm,
      this.speed,
      this.handleAnimationStep.bind(this)
    );
  }

  private handlePause(): void {
    console.log("Pausing animation");
    this.animationController.stop();
  }

  private handleStep(): void {
    this.initializeAlgorithm();
    if (!this.algorithm) {
      console.error("Algorithm not initialized");
      return;
    }

    this.algorithm.step();
    this.updateVisualization();
    this.updateStats({
      stepInfo: this.algorithm.stepInfo,
      stepCount: this.algorithm.stepCount,
      maxFlow: this.algorithm.getCurrentState().maxFlow || 0,
      executionTime: 0 // Single step doesn't track time
    });
  }

  private handleSpeedChange(): void {
    const slider = this.ui.getAs<HTMLInputElement>('speedSlider');
    this.speed = parseFloat(slider.value);
    this.ui.get('speedValue').textContent = `${this.speed}x`;
  }

  private handleAnimationStep(): void {
    this.updateVisualization();
    this.updateStats({
      stepInfo: this.algorithm?.stepInfo || '',
      stepCount: this.algorithm?.stepCount || 0,
      maxFlow: this.algorithm?.getCurrentState().maxFlow || 0,
      executionTime: 0 // Animation doesn't track individual step time
    });
  }

  private initializeAlgorithm(): void {
    if (!this.hasValidGraph()) {
      console.error("Cannot initialize algorithm: no valid graph loaded");
      return;
    }

    try {
      this.algorithm = AlgorithmManager.createInstance(this.currentAlgorithmType, this.graph);
      console.log(`Initialized: ${this.algorithm.name}`);
    } catch (error) {
      console.error(`Failed to initialize algorithm: ${(error as Error).message}`);
      this.algorithm = null;
    }
  }

  private resetAlgorithm(): void {
    this.animationController.stop();
    this.algorithm = null;
  }

  private hasValidGraph(): boolean {
    return this.graph && this.graph.getNodes().length > 0;
  }

  // UI updates
  private updateAlgorithmInfo(): void {
    const info = this.ui.get('algorithmInfo');
    info.innerHTML = AlgorithmManager.getInfo(this.currentAlgorithmType);
  }

  private updateStats(stats: {
    stepInfo: string;
    stepCount: number;
    maxFlow: number;
    executionTime: number;
  }): void {
    this.ui.get('stepInfo').textContent = stats.stepInfo;
    this.ui.get('stepIndicator').textContent = `Step: ${stats.stepCount}`;
    this.ui.get('stepCountValue').textContent = stats.stepCount.toString();
    this.ui.get('maxFlowValue').textContent = stats.maxFlow.toString();
    this.ui.get('timeValue').textContent = stats.executionTime > 0 
      ? `${stats.executionTime.toFixed(2)} ms` 
      : '0 ms';
  }

  private updateVisualization(): void {
    if (!this.algorithm) return;

    const state = this.algorithm.getCurrentState();
    this.highlightPath(state.highlightedNodes || [], state.highlightedEdges || []);
  }

  private highlightPath(highlightedNodes: Node[], highlightedEdges: Edge[]): void {
    console.log("Highlighting path");
    console.log(`Nodes: ${highlightedNodes.map(n => n.getId()).join(', ')}`);
    console.log(`Edges: ${highlightedEdges.map(e => `${e.getSource().getId()}-${e.getTarget().getId()}`).join(', ')}`);
    
    // Re-render base graph
    this.renderer.render(this.graph);
    
    // Apply highlights
    highlightedNodes.forEach(node => {
      this.renderer.highlightNode(node.getId());
    });
    
    highlightedEdges.forEach(edge => {
      this.renderer.highlightEdge(edge.getSource().getId(), edge.getTarget().getId());
    });
  }
}

export { MaxFlowVisualizer };