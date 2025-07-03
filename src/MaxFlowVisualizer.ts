// MaxFlowVisualizer.ts (Refactored to work with new Solver, Algorithm, and AnimationController)

import { NetworkGraph } from './NetworkGraph.js';
import { SVGRenderer } from './SVGRenderer.js';
import { Parser } from './Parser.js';
import { AnimationController } from './AnimationController.js';
import { Solver } from './Solver.js';
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
  private animationController!: AnimationController;
  private solver!: Solver;
  private currentAlgorithm: string = 'edmonds-karp';

  private $(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element #${id} not found`);
    return el;
  }

  private getCanvasElement(): SVGSVGElement {
    const el = document.getElementById('graph-canvas');
    if (!(el instanceof SVGSVGElement)) throw new Error('graph-canvas must be an <svg>');
    return el;
  }

  initializeEventListeners(): void {
    const $ = <T extends HTMLElement>(id: string): T => {
      const el = document.getElementById(id);
      if (!el) throw new Error(`Missing required element: #${id}`);
      return el as T;
    };

    $('loadBulkBtn').addEventListener('click', () => this.loadBulkGraph());
    
    $('playBtn').addEventListener('click', () => {
      this.animationController.play();
    });
    
    $('pauseBtn').addEventListener('click', () => this.animationController.stop());
    $('stepBtn').addEventListener('click', () => this.animationController.step());
    $('resetBtn').addEventListener('click', () => this.reset());
    
    $('solveBtn').addEventListener('click', () => {
      this.solver.solveAll();
      this.updateStatsFromSolver();
    });

    $('clearBtn').addEventListener('click', () => this.clear());

    const speedSlider = $('speedSlider') as HTMLInputElement;
    speedSlider.addEventListener('input', () => {
      this.animationController.setSpeed(parseFloat(speedSlider.value));
      $('speedValue').textContent = `${this.animationController.getSpeed()}x`;
    });

    const algorithmSelect = $('algorithmSelect') as HTMLSelectElement;
    algorithmSelect.addEventListener('change', () => {
      this.currentAlgorithm = algorithmSelect.value;
      this.updateAlgorithmInfo();
    });
  }

  private createAlgorithmInstance(): Algorithm {
    switch (this.currentAlgorithm) {
      case 'ford-fulkerson':
        return new FordFulkerson();
      case 'dinic':
        return new Dinic();
      case 'edmonds-karp':
      default:
        return new EdmondsKarp();
    }
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

  updateStatsFromSolver() {
    const stats = this.solver.getStats();
    console.log('Solver Stats:', stats);
    this.updateStats(
      stats.maxFlow.toString(),
      stats.iterations.toString(),
      stats.paths.length.toString(),
      stats.time.toString()
    );
  }

  updateStats(maxFlow: string, iterations: string, paths: string, time: string) {
    this.$('maxFlowValue').textContent = maxFlow;
    this.$('iterationsValue').textContent = iterations;
    this.$('pathsValue').textContent = paths;
    this.$('timeValue').textContent = time + 'ms';
  }

  loadBulkGraph() {
    const input = this.$('bulkInput') as HTMLTextAreaElement;
    const raw = input.value.trim();

    try {
      const canonical = canonicalizeUserInput(raw);
      const parser = new Parser(canonical);
      
      this.graph = parser.parse();
      this.graph.arrangeNodesForDrawing();

      this.renderer.setGraph(this.graph);
      this.renderer.clear();
      this.renderer.render();

      const algorithm = this.createAlgorithmInstance(); // Could be selected dynamically

      this.solver = new Solver(algorithm, this.graph);
      
      this.animationController = new AnimationController(this.solver, this.renderer, this);
    
      input.value = canonical;
    } catch (e) {
      alert(`Error loading graph: ${(e as Error).message}`);
    }
  }

  clear() {
    this.graph.clear();
    this.renderer.clear();
    this.solver = new Solver(new FordFulkerson(), this.graph);
    this.animationController = new AnimationController(this.solver, this.renderer, this);
    this.updateStats("0", "0", "0", "0");
  }

  reset() {
    this.animationController.stop();
    this.loadBulkGraph();
    this.updateStats("0", "0", "0", "0");
    this.updateStepInfo("", 0);
  }

  start() {
    this.renderer = new SVGRenderer("graph-canvas", this.graph || new NetworkGraph());
    this.initializeEventListeners();
  }
}

export { MaxFlowVisualizer };
