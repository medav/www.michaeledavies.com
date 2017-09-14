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
            max: 10
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
        'xlabels': ['C and C++', 'Python', 'C#', 'Verilog', 'Java', 'JavaScript' ],
        'ylabel' : 'Years of Experience',
        'yvalues': [10, 6, 6, 3, 5, 3]
    });

    MakeChart('softwareChart', {
        'title': 'Software, Concepts, and Tools',
        'xlabels': ['Machine Learning', 'Virtualization', 'FPGA', 'Hardware Development', 'Operating Systems', 'Assembly'],
        'ylabel' : 'Years of Experience',
        'yvalues': [3, 3, 3, 3, 3, 5]
    });
});