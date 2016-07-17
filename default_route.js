var fs = require('fs');
var marked = require('marked');

function SendContent(res, page, template) {
    var content_filename = 'pages/' + page + '/' + page + '.md';
    var markdown_content = fs.readFileSync(content_filename, {encoding: 'utf-8'});
    var page_content = marked(markdown_content);

    template.render({ MarkdownContent: page_content }).then(
    function(result) { 
        var shared_template_dict = { Pages: global.pages, PageTitle: pages[page].friendly_name, Content: result };
        global.shared_template.render(shared_template_dict).then(
            function(result) { res.send(result); });
    });

}

function DefaultRouteHandler(req, res, page) {
    var template_filename = 'pages/' + page + '/' + page + '.html';
    var template_content = fs.readFileSync(template_filename);

    global.engine.parse(template_content).then(function(template) {
        SendContent(res, page, template);
    });    
}

exports.route_handler = DefaultRouteHandler;