import { MaxFlowVisualizer } from './MaxFlowVisualizer.js';

console.log('MaxFlow Visualizer is starting...');

window.addEventListener('DOMContentLoaded', () => {
  // Initialize the MaxFlow Visualizer
  const visualizer = new MaxFlowVisualizer();
  visualizer.start();
});
