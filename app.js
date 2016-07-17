var app = require('express')();
var http = require('http').Server(app);
var fs = require('fs');
var path = require('path');
Liquid = require('liquid-node');
global.engine = new Liquid.Engine;

global.pages = JSON.parse(fs.readFileSync('pages.json'));
global.default_route_module = require('./default_route.js');

engine.parse(fs.readFileSync('templates/shared_template.html', {encoding: 'utf-8'}))
      .then(function(template) {
    global.shared_template = template;
});

function route(page, route_handler) {
    app.get('/' + page + '/:op?', function(req, res) {
        global.pages[page].route_handler(req, res, page);
    });
}

for(var page in global.pages) {
    try {
        global.pages[page].page_module = require('./pages/' + page + '/' + page + '.js');
    }
    catch (e) {
        console.log(e);
        continue;
    }
    

    global.pages[page].route_handler = 
        global.pages[page].page_module.route_handler;

    if(global.pages[page].route_handler == null) {
        global.pages[page].route_handler = global.default_route_module.route_handler;
    }

    route(page, global.pages[page].route_handler);
}

app.get('/', function(req, res) {
    var page = global.pages['index'];
    page.route_handler(req, res, 'index');
});

function RegisterPassthroughFileExtension(ext) {
    var route_string = '/*.' + ext
    app.get(route_string, function(req, res) {
        var filename = req.params[0];
        var fullname = __dirname + '/' + filename + '.' + ext;
        res.sendFile(fullname);
    });
}

RegisterPassthroughFileExtension('js');
RegisterPassthroughFileExtension('css');
RegisterPassthroughFileExtension('jpg');
RegisterPassthroughFileExtension('png');

http.listen(3000, function(){
  console.log('listening on *:3000');
});