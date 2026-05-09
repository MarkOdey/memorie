import http from "http";

http
  .createServer(function (request, response) {
    if (request.method === "POST") {
      //   console.log("This is a options", request);

      var data = "";
      request.on("data", function (chunk) {
        data += chunk;
      });

      request.on("end", function () {
        console.log(data);

        //response.end(body);
      });
    }

    if (request.method === "POST") {
      console.log("This is a post", request);
    }

    if (request.method === "GET") {
      console.log("This is a get", request);
    }
    // res.writeHead(200, { "Content-Type": "text/html" });

    // res.end("Hello World!");
  })
  .listen(8080);
