var marked = require('marked');
var fs = require('fs');

function ComparePostByDate(p1,p2) {
    if (p1.year < p2.year)
        return 1;
    if (p1.year > p2.year)
        return -1;
    
    if (p1.month < p2.month)
        return 1;
    if (p1.month > p2.month)
        return -1;

    if (p1.day < p2.day)
        return 1;
    if (p1.day > p2.day)
        return -1;

    return 0;
}

function LoadBits() {
    global.bits = JSON.parse(fs.readFileSync('pages/bits/bits.json'));

    global.bits.sort(ComparePostByDate);

    for(var id in global.bits) {
        var content_filename = 'pages/bits/posts/' + global.bits[id].page_name + '.md';
        var markdown_content = fs.readFileSync(content_filename, {encoding: 'utf-8'});
        global.bits[id].html_content = marked(markdown_content);
    }
}

function SendContent(res, page, template) {
    LoadBits();

    template.render({ Posts: global.bits }).then(
    function(result) { 
        var shared_template_dict = { Pages: global.pages, PageTitle: pages[page].friendly_name, Content: result };
        global.shared_template.render(shared_template_dict).then(
            function(result) { res.send(result); });
    });
}

function LookupPost(page) {
    LoadBits();

    for (var id in global.bits) {
        if (global.bits[id].page_name == page) return id;
    }

    return null;
}

function SendPost(res, page, template) {
    LoadBits();

    var id = LookupPost(page);
    var page_title = pages["bits"].friendly_name + ' // ' + global.bits[id].title;

    template.render({ Post: global.bits[id] }).then(
    function(result) { 
        var shared_template_dict = { Pages: global.pages, PageTitle: page_title, Content: result };
        global.shared_template.render(shared_template_dict).then(
            function(result) { res.send(result); });
    });
}

function HandleRoute(req, res, page) {
    
    var template_filename = 'pages/bits/' + page + '.html';
    var post_template_filename = 'pages/bits/post.html';

    var template_content = fs.readFileSync(template_filename);
    var post_template_content = fs.readFileSync(post_template_filename);

    console.log();

    if (req.params.op == null) {
        global.engine.parse(template_content).then(function(template) {
            SendContent(res, page, template);
        });  
    }
    else {
        global.engine.parse(post_template_content).then(function(template) {
            SendPost(res, req.params.op, template);
        }); 
    }
    
}

exports.route_handler = HandleRoute;