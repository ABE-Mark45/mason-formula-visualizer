/*
class to hold edge information
*/
class Edge {
    constructor(to, weight) {
        this.to = to;
        this.weight = weight;
    }
}

/*
class to hold graph infromation in an adjacency list format
*/

class Graph {
    constructor() {
        this.V = 0;
        this.adj_list = {};
    }

    add_node(u) {
        this.V++;
        this.adj_list[u] = [];
    }

    add_edge(from, to, weight) {
        this.adj_list[from].push(new Edge(to, '(' + weight + ')'));
    }

    edit_edge(from, to, weight){
        let edges = this.adj_list[from]
        for (let i = 0;i < edges.length;i++){
            let edge = edges[i];
            if (edge.to == to)
                edge.weight = weight;
        }
    }



    remove_node(removedNode) {
        delete this.adj_list[removedNode];

        for (let node in this.adj_list)
            this.adj_list[node] = this.adj_list[node].filter(edge => edge.to !== removedNode);

    }
    remove_edge(from, to) {
        this.adj_list[from] = this.adj_list[from].filter(edge => edge.to !== to);
    }
}


/*
the function rearranges the loop to start from the node with the least index
*/
function sort_cycle(cycle) {
    let min = cycle[0], min_i = 0;

    for (let i = 1; i < cycle.length; i++) {
        if (cycle[i] < min) {
            min = cycle[i];
            min_i = i;
        }
    }

    let sorted_cycle = [];

    for (let i = min_i; i < cycle.length; i++)
        sorted_cycle.push(cycle[i]);

    for (let i = 1; i <= min_i; i++)
        sorted_cycle.push(cycle[i]);

    return sorted_cycle;
}

/*
array equality check by value
*/
function is_array_equal(a, b) {
    if (a.length != b.length)
        return false;

    for (let i = 0; i < a.length; i++)
        if (a[i] !== b[i])
            return false;
    return true;
}


/*
helper function to generate_cycles wrapper function.
The function initiates a dfs seatch and stores all the cycles in the cycles object
@{param} g: Graph
*/
function dfs_generate_loop(g, visited, stack, cycles, from) {
    if (visited[from]) {
        let current_cycle = [];
        current_cycle.push(from);
        let tmp_stack = [];

        while (stack[stack.length - 1] != from) {
            current_cycle.push(stack[stack.length - 1]);
            tmp_stack.push(stack.pop());
        }

        current_cycle.push(from);
        current_cycle = sort_cycle(current_cycle);
        let is_unique = true;


        for (let i = 0; i < cycles.length; i++) {
            if (is_array_equal(cycles[i], current_cycle)) {
                is_unique = false;
                break;
            }
        }

        if (is_unique) {
            cycles.push(current_cycle);
        }

        while (tmp_stack.length > 0)
            stack.push(tmp_stack.pop());

        return;
    }

    visited[from] = true;
    stack.push(from);

    g.adj_list[from].forEach(edge => dfs_generate_loop(g, visited, stack, cycles, edge.to));

    visited[from] = false;
    stack.pop();
}

/*
generates all simple cycles in a graph
*/
function generate_cycles(g) {
    let visited = {};
    let stack = [];
    let cycles = [];

    let startNode = parseInt(Object.keys(g.adj_list)[0]);

    dfs_generate_loop(g, visited, stack, cycles, startNode);

    cycles = cycles.map(cycle => cycle.reverse());
    return cycles;
}

/*
a class to hold non-touching loops which can be multiplied together
*/
class LoopGroup {
    constructor(loop) {
        this.loops = [loop];    // loops array: holds loops indices in the cycles array
    }

    add(loop) {
        this.loops.push(loop);
    }

    /*
    Generates set representation of all nodes which exist in the loop group for fast search
    */
    generate_node_set(cycles) {
        return new Set(this.loops.reduce((result, current_loop) =>
            result.concat(cycles[current_loop])
            , []));
    }

    /*
    creates a deep copy of the loop group object
    */

    clone() {
        let x = new LoopGroup();
        x.loops = this.loops.slice();
        return x;
    }
}

/*
generates a compatibility matrix of all loops.
The matrix is a symmetric n x n matrix where n is the number of loops.
matrix[i][j] = true if the loops i and j are non touching, otherwise false
*/
function generate_cycles_conflicts(cycles) {
    let cycles_conflicts = new Array(cycles.length).fill(0).map(row => new Array(cycles.length).fill(true));

    for (let i = 0; i < cycles.length; i++)
        cycles_conflicts[i][i] = false;

    let cycle_sets = cycles.map(cycle => new Set(cycle));
    for (let i = 0; i < cycle_sets.length; i++) {
        let set_a = cycle_sets[i];
        for (let j = i + 1; j < cycle_sets.length; j++) {
            let set_b = cycle_sets[j];
            for (let node of set_b) {
                if (set_a.has(node)) {
                    cycles_conflicts[i][j] = false;
                    cycles_conflicts[j][i] = false;
                    break;
                }
            }
        }
    }
    // console.log(cycles_conflicts);
    return cycles_conflicts;
}


/*
generates the non-touching loop groups in a container to calculate the big delta in the denominator.
If we have, for example, delta = 1 - [L_1 + L_2 + L_3] - [L_1*L_2 + L_2*L_3] + [L_1*L_2*L_3], the return
array will be
[
    [
        LoopGroup{ loops: [1] },
        LoopGroup{ loops: [2] },
        LoopGroup{ loops: [3] }
    ],
    [
        LoopGroup{ loops: [1, 2] },
        LoopGroup{ loops: [2, 3] }
    ],
    [
        LoopGroup{ loops: [1, 2, 3] }
    ]
]
*/
function generate_non_touching_cycle_groups(cycles, cycles_conflicts) {
    let non_touching_loops_container = [[]];

    for (let i = 0; i < cycles.length; i++)
        non_touching_loops_container[0].push(new LoopGroup(i));

    while (true) {
        let new_loop_group_container = [];

        let last_loop_group_container = non_touching_loops_container[non_touching_loops_container.length - 1];

        last_loop_group_container.forEach(loop_group => {
            for (let k = loop_group.loops[loop_group.loops.length - 1]; k < cycles.length; k++) {
                let can_be_added = true;
                for (let loop_a of loop_group.loops) {
                    if (!cycles_conflicts[loop_a][k]) {
                        can_be_added = false;
                        break;
                    }
                }
                let newly_added_loop_group = loop_group.clone();
                newly_added_loop_group.add(k);
                if (can_be_added) {
                    new_loop_group_container.push(newly_added_loop_group);
                }
            }
        });

        if (new_loop_group_container.length)
            non_touching_loops_container.push(new_loop_group_container);
        else
            break;
    }

    return non_touching_loops_container;
}


/*
The function takes in a path (loop, or froward path) and generates an array
containing all the transfer functions along the way
*/
function get_transfer_function(g, path) {
    let transfer_array = [];

    for (let i = 1; i < path.length; i++) {
        let edge = g.adj_list[path[i - 1]].find(e => e.to === path[i]);
        transfer_array.push(edge.weight);
    }
    return transfer_array.join('*');
}

function get_loop_gains(g, cycles) {
    return cycles.map(cycle => math.simplify(get_transfer_function(g, cycle)).toString());
}

function get_forward_paths_gains(g, forward_paths) {
    return forward_paths.map(path => math.simplify(get_transfer_function(g, path)).toString());
}

/*
generates forward paths
*/
function generate_forward_paths(g) {
    let nodes = Object.keys(g.adj_list);
    console.log(nodes);
    let start_node = parseInt(nodes[0]);
    let end_node = parseInt(nodes[nodes.length - 1]);
    let visited = { start_node: true };
    let stack = [start_node];
    let forward_paths = [];

    const dfs = function (node) {
        if (node === end_node) {
            forward_paths.push(stack.slice());
            return;
        }

        g.adj_list[node].forEach(edge => {
            let to = edge.to;
            if (!visited[to]) {
                visited[to] = true;
                stack.push(to);
                dfs(to);
                visited[to] = false;
                stack.pop();
            }
        })
    };

    dfs(start_node, end_node);
    return forward_paths;
}


/*
Generates the delta_i for every forward path in this format
if delta_1 = 1 + [L_1] - [L_1*L_2]
[
    ** forward_path 1**
    [
        [
            LoopGroup{ loops: [1] }
        ],
        [
            LoopGroup{ loops: [1, 2]}
        ]
    ]
]
or if delta_1 = delta_2 = 1, the function returns
[
    [
        []
    ],
    [
        []
    ]
]

Please check all entries in each forward path container while alternating signs
*/
function generate_deltas(cycles, forward_paths, non_touching_loops, loop_gains) {
    let deltas = forward_paths.map(cur_forward_path =>
        non_touching_loops.map(container =>
            container.filter(loop_group => {
                let node_set = loop_group.generate_node_set(cycles);
                for (let node of cur_forward_path)
                    if (node_set.has(node))
                        return false;

                return true;
            })
        ).filter(container => container.length)
    );

    return deltas.map(d => get_big_delta(d, loop_gains));
}


function get_big_delta(non_touching_loops, loop_gains) {
    let ans = '1';

    let negative = 1;

    non_touching_loops.forEach(container => {
        if (negative)
            ans += ' - (';
        else
            ans += ' + (';

        negative = 1 - negative;
        let container_gain = container.map(loop_group =>
            loop_group.loops.map(loop_index => loop_gains[loop_index]).join(' * ')
        );
        ans += container_gain.llength ? container_gain.join(' + ') : '0';
        ans += ')';
        console.log('-------');
    });

    return math.simplify(ans).toString();
}


function solve(graph) {
    const forward_paths = generate_forward_paths(graph);

    const cycles = generate_cycles(graph);

    const cycles_conflicts = generate_cycles_conflicts(cycles);

    const non_touching_loops = generate_non_touching_cycle_groups(cycles, cycles_conflicts);

    const loop_gains = get_loop_gains(graph, cycles);

    const forward_paths_gains = get_loop_gains(graph, forward_paths);

    const big_delta = get_big_delta(non_touching_loops, loop_gains);

    const deltas = generate_deltas(cycles, forward_paths, non_touching_loops, loop_gains);

    const transfer_numerator = math.simplify(forward_paths_gains.map((path, index) => path + '*' + deltas[index]).join(' + ')).toString();

    const final_gain = math.simplify('(' + transfer_numerator + ') / (' + big_delta + ')').toString();

    return [forward_paths, forward_paths_gains, cycles, loop_gains, non_touching_loops, big_delta, deltas, final_gain];
}


/*
let graph = new Graph();

for(let i = 0; i <= 6;i++)
    graph.add_node(i);

graph.add_edge(0, 1, 1);
graph.add_edge(1, 2, 5);
graph.add_edge(1, 5, 10);
graph.add_edge(2, 3, 10);
graph.add_edge(3, 4, 2);
graph.add_edge(3, 2, -1);
graph.add_edge(4, 6, 1);
graph.add_edge(4, 3, -2);
graph.add_edge(4, 1, -1);
graph.add_edge(5, 4, 2);
graph.add_edge(5, 5, -1);

let g2 = new Graph();

for(let i = 1; i <= 5; i++)
    g2.add_node(i);

g2.add_edge(1, 2, 1);
g2.add_edge(1, 3, 1);
g2.add_edge(2, 3, 'G1');
g2.add_edge(3, 4, 'G2');
g2.add_edge(4, 3, '-H1');
g2.add_edge(4, 2, '-H2');
g2.add_edge(4, 5, 1);

let g3 = new Graph();

for (let i = 1; i <= 8; i++)
    g3.add_node(i);

g3.add_edge(1, 2, 'a');
g3.add_edge(2, 3, 'b');
g3.add_edge(3, 4, 'c');
g3.add_edge(4, 5, 'd');
g3.add_edge(4, 7, 'e');
g3.add_edge(5, 6, 'f');
g3.add_edge(6, 5, 'g');
g3.add_edge(6, 7, 'h');
g3.add_edge(6, 8, 'i');
g3.add_edge(7, 8, 'j');
g3.add_edge(7, 3, 'k');
g3.add_edge(8, 6, 'l');
g3.add_edge(8, 2, 'm');



let test_cases = [graph];

function testGraph(g)
{
    let fp = generate_forward_paths(g);
    console.log('forward path: ', JSON.stringify(fp));
    let cycles = generate_cycles(g);
    console.log('cycles: ', JSON.stringify(cycles));

    let cycles_conflicts = generate_cycles_conflicts(cycles);
    let non_touching_loops = generate_non_touching_cycle_groups(cycles, cycles_conflicts);
    console.log('non_touching_loops: ', non_touching_loops);


    let loop_gains = get_loop_gains(g, cycles);
    console.log('loop_gain: ', loop_gains);

    let forward_paths_gains = get_forward_paths_gains(g, fp);
    console.log('loop_gain: ', forward_paths_gains);

    let big_delta = get_big_delta(non_touching_loops, loop_gains);
    console.log('big_delta: ', big_delta);

    let deltas = generate_deltas(cycles, fp, non_touching_loops, loop_gains);
    console.log('deltas: ', deltas);

    let transfer_numerator = math.simplify(forward_paths_gains.map((path, index) => path + '*' + deltas[index]).join(' + ')).toString();
    console.log('transfer numerator: ', transfer_numerator);

    let final_gain = math.simplify('(' + transfer_numerator + ') / (' + big_delta + ')').toString();
    console.log('final gain: ', final_gain);

    console.log('----------------------------------------------------');
}

test_cases.forEach(g => testGraph(g));
*/