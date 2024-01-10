let http = require("http");

let fs = require("fs");

let http_server = http.createServer(function(request, response){
     fs.readFile("index.html", function(err, data){
        if (err){
            console.log("Error en fs.readFile");
            return
        }
        response.writeHead(200);
        response.end(data);
    });

    console.log("Archivos actualizados");
}).listen(8082);