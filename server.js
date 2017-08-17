var StaticServer = require('static-server');

var server = new StaticServer({
    rootPath: './docs/',
    port: 3000
});

server.start(function () {
    console.log('server started on port ' + server.port);
});
