var marked = require('marked');
var fs = require('fs');

function CompareProjectByDate(p1,p2) {
    if (p1.start_year < p2.start_year)
        return 1;
    if (p1.start_year > p2.start_year)
        return -1;
    
    if (p1.end_year < p2.end_year)
        return 1;
    if (p1.end_year > p2.end_year)
        return -1;

    return 0;
}

function LoadPortfolio() {
    global.portfolio = JSON.parse(fs.readFileSync('pages/portfolio/portfolio.json'));

    global.portfolio.sort(CompareProjectByDate);

    for(var id in global.portfolio) {
        var content_filename = 'pages/portfolio/projects/' + global.portfolio[id].short_name + '.md';
        var markdown_content = fs.readFileSync(content_filename, {encoding: 'utf-8'});
        global.portfolio[id].html_content = marked(markdown_content);
    }
}



function SendContent(res, page, template) {
    LoadPortfolio();

    template.render({ Portfolio: global.portfolio }).then(
    function(result) { 
        var shared_template_dict = { Pages: global.pages, PageTitle: pages[page].friendly_name, Content: result };
        global.shared_template.render(shared_template_dict).then(
            function(result) { res.send(result); });
    });

}

function HandleRoute(req, res, page) {
    var template_filename = 'pages/portfolio/' + page + '.html';
    var template_content = fs.readFileSync(template_filename);

    global.engine.parse(template_content).then(function(template) {
        SendContent(res, page, template);
    });  
}

exports.route_handler = HandleRoute;