var nodes=[]
 class Method{
 
  checkAvailability(from,To,dot){
    if (dot.includes(";"+from)&&dot.includes(";"+To)&&!dot.includes(";"+from+"->"+To)){
      console.log(from,To,counter)
      return true
    }
    else{
      console.log(from,To,counter)
      return false 
    }
       
  }
  appendDot(counter,dot){
    dot=dot.substring(0,dot.length-1)
   dot=dot.concat(";"+counter+"}");
   var newNode=[]
   nodes.push(newNode);
   return dot;
    //remove last char } then concat new node counter;} to dot 
  }
  adjustDot(from,to,dot){
    dot=dot.substring(0,dot.length-1)
    dot=dot.concat(";"+from+"->"+to+"}");
    nodes[from].push(to);
    console.log(nodes);
    return dot;
  }

  deleteEdgeFromDot(from,To,dot){
    return  dot.replace(";"+from+"->"+To,"");
  }
  deleteNodeFromDot(dot,node){
    dot=dot.replace(";"+node,"")
    for (let index = 0; index < nodes[node].length; index++) {
      dot=deleteEdgeFromDot(node,nodes[node][index],dot)
      nodes[node].splice(index,1);
    }
    for (let i = 0; i < nodes.length; i++) {
      if (i!=node) {
        for (let j = 0; j < nodes[i].length; j++) {
          if(nodes[i][j]==node){
            dot= dot.replace(";"+i+"->"+nodes[i][j],"")
            nodes[i].splice(j,1);
          }
          
        }
      }
      
    }
console.log(nodes);
return dot
  }

}