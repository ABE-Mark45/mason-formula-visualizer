class Edge
{
    constructor(to, weight)
    {
        this.to = to;
        this.weight = weight;
    }
}

class Graph
{
    constructor()
    {
        this.V = 0;
        this.adj_list = {};
    }

    add_node(u)
    {
        this.V++;
        this.adj_list[u] = [];
    }

    add_edge(from, to, weight)
    {
        this.adj_list[from].push(new Edge(to, weight));
    }

    

    remove_node(removedNode)
    {
        delete this.adj_list[removedNode];
        
        for(let from in this.adj_list)
        {
            for(let i = 0; i < a[from].length;i++)
            {
                let edge = a[from][i];
                if(edge.to === removedNode)
                {
                    a[from].splice(i, 1);
                    break;
                }
            }
        }
    }

    remove_edge(from, to)
    {
        for(let i = 0; i < a[from].length;i++)
        {
            let edge = a[from][i];
            if(edge.to === to)
            {
                a[from].splice(i, 1);
                break;
            }
        }
    }
}


function sort_cycle(cycle)
{
    let min = cycle[0], min_i = 0;

    for(let i = 1; i < cycle.length; i++)
    {
        if(cycle[i] < min)
        {
            min = cycle[i];
            min_i = i;
        }
    }

    let sorted_cycle = [];

    for(let i = min_i; i < cycle.length; i++)
        sorted_cycle.push(cycle[i]);

    for(let i = 1; i <= min_i; i++)
        sorted_cycle.push(cycle[i]);

    return sorted_cycle;
}

function is_array_equal(a, b)
{
    if(a.length != b.length)
    return false;
    
    for(let i = 0; i < a.length;i++)
        if(a[i] !== b[i])
            return false;
    return true;
}


/*
Generate loops in a graph
@{param} g: Graph
*/
function dfs_generate_loop(g, visited, stack, cycles, from)
{
    if(visited[from])
    {
        let current_cycle = [];
        current_cycle.push(from);
        let tmp_stack = [];

        while(stack[stack.length - 1] != from)
        {
            current_cycle.push(stack[stack.length - 1]);
            tmp_stack.push(stack.pop());
        }

        current_cycle.push(from);
        current_cycle = sort_cycle(current_cycle);
        let is_unique = true;


        for(let i = 0; i < cycles.length; i++)
        {
            if(is_array_equal(cycles[i], current_cycle))
            {
                is_unique = false;
                break;
            }
        }

        if(is_unique) {
            cycles.push(current_cycle);
        }

        while(tmp_stack.length > 0)
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

function generate_loops(g)
{
    let visited = {};
    let stack = [];
    let cycles = [];

    let startNode = parseInt(Object.keys(g.adj_list)[0]);

    dfs_generate_loop(g, visited, stack, cycles, startNode);

    return cycles;
}


function testGraph()
{
    let g = new Graph();

    for(let i = 1; i <= 8;i++)
        g.add_node(i);

    g.add_edge(1, 2);
    g.add_edge(2, 3);
    g.add_edge(3, 4);
    g.add_edge(4, 5);
    g.add_edge(4, 7);
    g.add_edge(5, 6);
    g.add_edge(6, 5);
    g.add_edge(6, 7);
    g.add_edge(6, 8);
    g.add_edge(7, 8);
    g.add_edge(7, 3);
    g.add_edge(8, 6);
    g.add_edge(8, 2);

    console.log(generate_loops(g));
}

testGraph();