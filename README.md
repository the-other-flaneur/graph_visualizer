# Max Flow Visualizer

**Live Demo**: [https://maxflowgraphvisualizer.netlify.app/](https://maxflowgraphvisualizer.netlify.app/)

An interactive web-based visualization tool for maximum flow algorithms, built to enhance understanding of network flow concepts from Discrete Mathematics II.

## Purpose

This project was developed as a personal learning tool during my Discrete Mathematics II course at university. The goal was to create an interactive visualization that would help me (and potentially other students) better understand how different maximum flow algorithms work by seeing them in action step-by-step.

**Try it now**: Visit [maxflowgraphvisualizer.netlify.app](https://maxflowgraphvisualizer.netlify.app/) to start exploring!

## Features

- **Interactive Graph Input**: Create flow networks using a simple text format
- **Multiple Algorithms**: Compare different approaches to solving max flow problems
  - Ford-Fulkerson Algorithm (DFS-based)
  - Edmonds-Karp Algorithm (BFS-based)
  - Dinic's Algorithm (Level graph approach)
- **Step-by-Step Visualization**: Watch algorithms progress one step at a time
- **Animated Playback**: See the full algorithm execution with adjustable speed
- **Real-time Statistics**: Track steps, execution time, and current maximum flow
- **Path Highlighting**: Visual feedback showing augmenting paths as they're discovered

## How to Use

Visit the [live demo](https://maxflowgraphvisualizer.netlify.app/) and follow these steps:

### Graph Input Format

Define your flow network using this simple text format in the input area:

```
s
t
a
b
sa:10
ab:5
bt:8
st:15
```

- Single characters on their own lines define nodes
- Format `XY:capacity` defines an edge from node X to node Y with given capacity
- Source node must be named 's' and sink node must be named 't'

### Example Networks to Try

**Simple Network:**
```
s
t
a
sa:20
at:10
st:10
```

**More Complex Network:**
```
s
t
a
b
c
sa:16
sb:10
ac:12
bc:4
bt:10
ct:20
```

**Challenge Network:**
```
s
t
a
b
c
d
sa:10
sb:8
ac:5
ad:8
bc:3
bd:2
cd:5
ct:10
dt:8
```

### Controls

- **Load Graph**: Parse and visualize your input network
- **Clear**: Reset the visualization
- **Algorithm Selection**: Choose between Ford-Fulkerson, Edmonds-Karp, or Dinic's
- **Solve**: Run the complete algorithm instantly
- **Play/Pause**: Animate the algorithm step-by-step
- **Step**: Advance one step at a time
- **Speed Slider**: Adjust animation speed (0.5x to 3x)

## Learning Objectives

Through building and using this visualizer, I gained deeper understanding of:

- **Graph Theory Concepts**: Flow networks, augmenting paths, residual graphs
- **Algorithm Design Patterns**: DFS vs BFS approaches, level graphs
- **Complexity Analysis**: How different algorithms perform on various network structures
- **Implementation Details**: Converting theoretical algorithms into working code
- **Data Structures**: Graph representation, path finding, state management

## Technical Implementation
Project Structure
```
├── index.html              # Main HTML file and entry point
├── style.css               # Application styling
├── src/
│   ├── main.ts             # Application entry point and initialization
│   ├── MaxFlowVisualizer.ts # Main orchestrator class
│   ├── NetworkGraph.ts     # Graph data structure and operations
│   ├── Parser.ts           # Graph input parsing and validation
│   ├── SVGRenderer.ts      # Visual rendering and highlighting
│   └── algorithms/         # Algorithm implementations
│       ├── Algorithm.ts    # Base algorithm interface/abstract class
│       ├── FordFulkerson.ts # Ford-Fulkerson implementation
│       ├── EdmondsKarp.ts  # Edmonds-Karp implementation
│       └── Dinics.ts       # Dinic's algorithm implementation
├── tsconfig.json           # TypeScript configuration
├── netlify.toml           # Netlify deployment configuration
└── README.md              # This file
``` 
### Architecture
The project follows a clean, modular architecture:

main.ts: Entry point that initializes the visualizer
MaxFlowVisualizer.ts: Main orchestrator managing UI interactions and algorithm execution
NetworkGraph.ts: Core graph data structure with nodes, edges, and flow operations
Parser.ts: Handles parsing and validation of user input into graph structures
SVGRenderer.ts: Manages all visual rendering, highlighting, and graph drawing
algorithms/: Self-contained algorithm implementations

Algorithm.ts: Common interface and shared functionality
FordFulkerson.ts: DFS-based augmenting path algorithm
EdmondsKarp.ts: BFS-based variant of Ford-Fulkerson
Dinics.ts: Level graph-based algorithm for improved performance

### Technologies Used

- **Vanilla TypeScript**: For type safety and better development experience
- **ES6 Modules**: For clean code organization
- **SVG**: For scalable graph visualization
- **Netlify**: For seamless deployment and hosting

### Deployment

The project is automatically deployed to Netlify from the main branch, making it accessible to anyone with an internet connection. This allows for easy sharing with classmates and instructors.

## Educational Value

This project demonstrates several key computer science concepts:

1. **Algorithm Visualization**: Making abstract algorithms concrete and observable
2. **Graph Algorithms**: Practical implementation of classic network flow algorithms  
3. **Software Architecture**: Designing maintainable, modular code
4. **User Interface Design**: Creating intuitive controls for complex operations
5. **Performance Analysis**: Comparing algorithm efficiency in real-time
6. **Web Development**: Building and deploying interactive web applications

## Sharing and Usage

Feel free to share the live demo with:
- **Classmates**: Help others understand max flow algorithms
- **Study Groups**: Use for collaborative learning sessions
- **Instructors**: Demonstrate algorithm concepts in presentations
- **Future Students**: A resource for understanding these concepts

Direct link: [https://maxflowgraphvisualizer.netlify.app/](https://maxflowgraphvisualizer.netlify.app/)

## Contributing

While this is primarily a personal learning project, suggestions and improvements are welcome! You can:

- Try the [live demo](https://maxflowgraphvisualizer.netlify.app/) and provide feedback
- Report bugs or suggest features via Issues
- Submit pull requests for improvements
- Share interesting test cases or network examples

Built with ❤️ as part of my Computer Science journey | [Portfolio](https://theotherflaneur.vercel.app/)
