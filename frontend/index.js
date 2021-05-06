var nodes=[]
 class Method{
 
  checkAvailability(from,To,counter){
    if (from<counter&&To<counter&& from>-1&&To>-1){
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
   nodes[counter]=1;
   return dot;
    //remove last char } then concat new node counter;} to dot 
  }
  adjustDot(from,to,dot){
    dot=dot.substring(0,dot.length-1)
    dot=dot.concat(";"+from+"->"+to+"}");
    return dot;
  }

}