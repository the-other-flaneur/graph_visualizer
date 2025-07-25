# graph_visualizer

Test graph:

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

Ford-Fulkerson method.

The ford-fulkerson method repeatedly finds augmenting paths through the residual graph and augments the flow until no more augmenting paths can be found.

An augmenting path is a path of edges on in the residual graph with unused capacity greater than zero from the source s to the sink t.

In the augmenting path the bottleneck value is the smallest capacity of an edge in the path, we can use the bottleneck value to augment the flow.

Augmenting the flow means updating the flow values of the edges along the augmenting path. For forward edges this means increasing the flow by the bottleneck value.
Also decreasing the flow along each residual edge among the path.
