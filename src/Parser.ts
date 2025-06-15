import { NetworkGraph } from "./NetworkGraph.js";

export class Parser {
  private input: string;

  constructor(input: string) {
    this.input = input;
  }

  parse(): NetworkGraph {
    const graph = new NetworkGraph();

    const lines = this.input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error('Input must include at least a source and sink node.');
    }

    // Line 0 → Source
    const sourceId = lines[0];
    graph.addSource(sourceId);

    // Line 1 → Sink
    const sinkId = lines[1];
    graph.addSink(sinkId);

    // Collect remaining lines
    let i = 2;

    // Add remaining nodes (until first edge definition with ':')
    while (i < lines.length && !lines[i].includes(':')) {
      const nodeId = lines[i];
      if (nodeId !== sourceId && nodeId !== sinkId) {
        graph.addNode(nodeId);
      }
      i++;
    }

    // Add edges
    for (; i < lines.length; i++) {
      const line = lines[i];

      const [pair, capacityStr] = line.split(':').map(s => s.trim());
      if (!pair || !capacityStr) {
        throw new Error(`Invalid edge format: ${line}`);
      }

      if (pair.length < 2) {
        throw new Error(`Edge must connect two nodes: ${line}`);
      }

      const fromId = pair.slice(0, 1); // e.g. 's'
      const toId = pair.slice(1);     // e.g. 'A'

      const capacity = parseInt(capacityStr, 10);
      if (isNaN(capacity) || capacity <= 0) {
        throw new Error(`Invalid capacity in edge: ${line}`);
      }

      graph.addEdge(fromId, toId, capacity);
    }

    return graph;
  }
}