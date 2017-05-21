function MakeChart(chartname, data) {
    Highcharts.chart(chartname, {

        chart: {
            polar: true,
            type: 'line'
        },

        title: {
            text: data['title']
        },

        pane: {
            size: '70%'
        },

        xAxis: {
            categories: data['xlabels'],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },

        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0,
            max: 7
        },

        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
        },

        credits: {
            enabled: false
        },

        series: [{
            name: data['ylabel'],
            data: data['yvalues'],
            pointPlacement: 'on'
        }]

    });
}

$(function() {
    MakeChart('programmingChart', {
        'title': 'Programming Languages',
        'xlabels': ['C/C++', 'Java', 'Python', 'C#', 'Bash', 'VBA'],
        'ylabel' : 'Years of Experience',
        'yvalues': [9, 5, 5, 4, 5, 6]
    });

    MakeChart('softwareChart', {
        'title': 'Software and Tools',
        'xlabels': ['Linux', 'Machine Learning', 'Virtualization', 'Cuda', 'Network programming', 'Visual Studio'],
        'ylabel' : 'Years of Experience',
        'yvalues': [5, 2.5, 4, 3, 3, 7]
    });
});