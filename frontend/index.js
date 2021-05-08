var nodes = []
var vals = []
var smallest = 0;
class Method {
  renderDot(graph) {
    let str = "digraph {";
    
    //add node numbers to str
    Object.keys(graph.adj_list).forEach(node => {str += node + ";"})

    //add edges
    Object.keys(graph.adj_list).forEach(node => {
      //for each node, iterate over edges
      graph.adj_list[node].forEach(edge =>{
        let from = node;
        let to = edge.to;
        let value = edge.weight;
        str += from + "->" + to + "[label=" + "\"" + value + "\"" + ",arrowhead=normal]" + ";"
      })
    })


    str += "}";
    return str;
  }

  edgeExists(graph, from , to){
    let found = false;
    graph.adj_list[from].forEach(edge =>{
      if (edge.to == to)
        found = true;
    })

    return found
  }


  checkAvailability(from, To, dot) {
    if (dot.includes(from) && dot.includes(To) && !dot.includes(";" + from + "->" + To)) {
      console.log(from, To, counter)
      return true
    }
    else {
      console.log(from, To, counter)
      return false
    }

  }
  appendDot(counter, dot) {
    dot = dot.substring(0, dot.length - 1)
    if (counter == 0) {
      dot = dot.concat(+counter + "}");
    }
    else {
      dot = dot.concat(";" + counter + "}");
    }
    var newNode = []
    var newVal = [];
    vals.push(newVal);
    nodes.push(newNode);
    return dot;
    //remove last char } then concat new node counter;} to dot 
  }
  adjustDot(from, to, dot, value) {
    dot = dot.substring(0, dot.length - 1)
    dot = dot.concat(";" + from + "->" + to + "[label=" + "\"" + value + "\"" + ",arrowhead=normal]" + "}");
    var r = [to, value]
    nodes[from].push(r);
    nodes[to].push([from, value])
    //nodes[from][to].push(value);

    console.log(nodes);
    console.log(vals);
    return dot;
  }

  deleteEdgeFromDot(from, To, dot) {
    var value;
    for (let i = 0; i < nodes[from].length; i++) {
      if (nodes[from][i][0] == To) {
        value = nodes[from][i][1]
      }
    }
    //console.log(";"+from+"->"+To+"[label="+"\""+value+"\""+",arrowhead=normal]")
    return dot.replace(";" + from + "->" + To + "[label=" + "\"" + value + "\"" + ",arrowhead=normal]", "");
  }
  deleteNodeFromDot(dot, node) {

    for (let index = 0; index < nodes[node].length; index++) {
      console.log(";" + node + "->" + nodes[node][index][0] + "[label=" + "\"" + nodes[node][index][1] + "\"" + ",arrowhead=normal]")
      dot = dot.replace(";" + node + "->" + nodes[node][index][0] + "[label=" + "\"" + nodes[node][index][1] + "\"" + ",arrowhead=normal]", "");
      //nodes[node][index].splice(0,2);
      console.log(nodes);
    }
    for (let i = 0; i < nodes.length; i++) {
      if (i != node) {
        for (let j = 0; j < nodes[i].length; j++) {
          if (nodes[i][j][0] == node) {
            dot = dot.replace(";" + i + "->" + nodes[i][j][0] + "[label=" + "\"" + nodes[i][j][1] + "\"" + ",arrowhead=normal]", "")

            //nodes[i][j].splice(0,2);
            console.log(nodes);
          }

        }
      }

    }
    if (node == smallest) {
      dot = dot.replace(node + ";", " ")
      smallest++;
    } else {
      dot = dot.replace(";" + node, " ")
    }
    console.log(nodes);
    return dot
  }

}