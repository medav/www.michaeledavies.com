var app = require('express')();
var http = require('http').Server(app);
var marked = require('marked');
var fs = require('fs');
var path = require('path');
Liquid = require('liquid-node');
global.engine = new Liquid.Engine;

global.pages = JSON.parse(fs.readFileSync('json_content/pages.json'));
global.default_route_module = require('./js_srv/default_route.js');

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
    if(global.pages[page].custom_route) {
        global.pages[page].route_module = 
            require('./js_srv/' + global.pages[page].route_module_filename);

    }
    else {
        global.pages[page].route_module = global.default_route_module;
    }

    global.pages[page].route_handler = 
        global.pages[page].route_module.route_handler;

    if(global.pages[page].route_handler == null) {
        console.error('Page route handler is null');
    }
    else {
        route(page, global.pages[page].route_handler);
    }
}

app.get('/', function(req, res) {
    var page = global.pages['index'];
    page.route_handler(req, res, 'index');
});

app.get('/js/*', function(req, res) {
    var jsfilename = __dirname + '/js_cl/' + req.params[0];
    res.sendFile(jsfilename);
});

app.get('/img/*', function(req, res) {
    var imgfilename = __dirname + '/img/' + req.params[0];
    res.sendFile(imgfilename);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});