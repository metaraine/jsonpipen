// # JSON Inferface
var com = require('commander');

// ## Initialize
com
  .version('0.0.1')
  .option('-r, --read', 'Output as line by line representation for use with grep and other line tools')
  .parse(process.argv);

process.stdin.resume();
process.stdin.setEncoding('utf8');


// ## Helper Functions
function tnl(string){
  return "\t" + string + "\n";
}


// ## Main
var data = "";
process.stdin.on('data', function(chunk){
  data += chunk;
});

process.stdin.on('end', function(){
  try{
    var parsed = JSON.parse(data);
  }catch(err){
    console.log("Malformed JSON");
  }

  var final;
  if(com.args[0]){
    try{
      var selector = new Function( "object", "return object." + com.args[0]);
      final = selector(parsed);
    }catch(err){
      console.log("Incorrectly formatted address");
    }
  }else{
    final = parsed;
  }
  if(!com.read){
    process.stdout.write(JSON.stringify(final, null, 2));
  }else{
    var lines = [];
    var path = "/";
    (function recurRead(obj, path){
      for(var k in obj){
        var sectionPath = path;
        if(obj.hasOwnProperty(k)){
          if(typeof obj[k] == 'object'){
            if(Array.isArray(obj[k])){
              sectionPath += k+"/";
              lines.push(sectionPath + tnl("[]"));
              recurRead(obj[k], sectionPath);
            }else{
              sectionPath += k+"/";
              lines.push(sectionPath + tnl("{}"));
              recurRead(obj[k], sectionPath);
            }
          }else{
            var fieldPath = path + k + "/";
            lines.push(fieldPath + tnl(obj[k]));
          }
        }
      }
    }(final, path));
    for(var i=0; i<lines.length ; i++){
      process.stdout.write(lines[i]);
    }
  }
});

