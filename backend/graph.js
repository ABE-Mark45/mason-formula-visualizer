class Edge {
    constructor(to, weight) {
        this.to = to;
        this.weight = weight;
    }
}

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
        this.adj_list[from].push(new Edge(to, weight));
    }



    remove_node(removedNode) {
        delete this.adj_list[removedNode];

        for (let from in this.adj_list)
            this.adj_list[from].filter(edge => edge.to !== from);
    }

    remove_edge(from, to) {
        this.adj_list[from].filter(edge => edge.to !== to);
    }
}


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

function is_array_equal(a, b) {
    if (a.length != b.length)
        return false;

    for (let i = 0; i < a.length; i++)
        if (a[i] !== b[i])
            return false;
    return true;
}


/*
Generate loops in a graph
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

    /*
    for(let edge in g.adj_list[from]) {
        console.log('edge: ', edge);
        dfs_generate_loop(g, visited, stack, cycles, edge.to);
    }
    */

    visited[from] = false;
    stack.pop();
}


function generate_loops(g) {
    let visited = {};
    let stack = [];
    let cycles = [];

    let startNode = parseInt(Object.keys(g.adj_list)[0]);

    dfs_generate_loop(g, visited, stack, cycles, startNode);

    cycles = cycles.map(cycle => cycle.reverse());
    return cycles;
}


class LoopGroup {
    constructor(loop) {
        this.loops = [loop];
    }

    add(loop) {
        this.loops.push(loop);
    }

    generate_node_set(cycles) {
        return new Set(this.loops.reduce((result, current_loop) =>
            result.concat(cycles[current_loop])
            , []));
    }

    clone() {
        let x = new LoopGroup();
        x.loops = this.loops.slice();
        return x;
    }
}


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

function get_transfer_function(g, cycle) {
    let transfer_array = [];

    for (let i = 1; i < cycle.length; i++) {
        let edge = g.adj_list[cycle[i - 1]].find(e => e.to === cycle[i]);
        transfer_array.push(edge.weight);
    }
    return transfer_array;
}



function generate_forward_paths(g) {
    let nodes = Object.keys(g.adj_list);
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

function generate_deltas(cycles, forward_paths, non_touching_loops) {
    return forward_paths.map(cur_forward_path => 
        non_touching_loops.map(container =>
            container.filter(loop_group => {
                let node_set = loop_group.generate_node_set(cycles);
                for (let node of cur_forward_path)
                    if (node_set.has(node))
                        return false;

                return true;
            })
        )
    );
}


function testGraph() {
    let g = new Graph();

    for (let i = 1; i <= 8; i++)
        g.add_node(i);

    g.add_edge(1, 2, 'a');
    g.add_edge(2, 3, 'b');
    g.add_edge(3, 4, 'c');
    g.add_edge(4, 5, 'd');
    g.add_edge(4, 7, 'e');
    g.add_edge(5, 6, 'f');
    g.add_edge(6, 5, 'g');
    g.add_edge(6, 7, 'h');
    g.add_edge(6, 8, 'i');
    g.add_edge(7, 8, 'j');
    g.add_edge(7, 3, 'k');
    g.add_edge(8, 6, 'l');
    g.add_edge(8, 2, 'm');

    let fp = generate_forward_paths(g);

    console.log('forward path: ');
    console.log(fp);

    let cycles = generate_loops(g);

    console.table(cycles);
    let transfers = cycles.map(cycle => get_transfer_function(g, cycle));

    let conflicts = generate_cycles_conflicts(cycles);

    // console.table(conflicts);

    let non_touching_loops = generate_non_touching_cycle_groups(cycles, conflicts);

    // non_touching_loops.forEach(container => {
    //     container.forEach(loop_group => console.log(loop_group));
    //     console.log('---------------');
    // });

    // non_touching_loops.forEach(container => {
    //     container.forEach(loop_group => console.log(loop_group.generate_node_set(cycles)));
    //     console.log('---------------');
    // });

    console.log(generate_deltas(cycles, fp, non_touching_loops));
}

testGraph();