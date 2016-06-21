$(function () {

	$('#programmingChart').highcharts({

		chart: {
			polar: true,
			type: 'line'
		},

		title: {
			text: 'Programming Languages'
		},

		pane: {
			size: '70%'
		},

		xAxis: {
			categories: ['C/C++', 'Java', 'Python', 'C#', 'Bash', 'VBA'],
			tickmarkPlacement: 'on',
			lineWidth: 0
		},

		yAxis: {
			gridLineInterpolation: 'polygon',
			lineWidth: 0,
			min: 0,
			max: 9
		},

		tooltip: {
			shared: true,
			pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
		},

        credits: {
            enabled: false
        },

		series: [{
			name: 'Years of Experience',
			data: [9, 5, 5, 4, 5, 6],
			pointPlacement: 'on'
		}]

	});
});

$(function () {

	$('#softwareChart').highcharts({

		chart: {
			polar: true,
			type: 'line'
		},

		title: {
			text: 'Software and Tools'
		},

		pane: {
			size: '70%'
		},

		xAxis: {
			categories: ['Linux', 'Machine Learning', 'Virtualization', 'Cuda', 'Network programming', 'Visual Studio'],
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
			name: 'Years of Experience',
			data: [5, 2.5, 4, 3, 3, 7],
			pointPlacement: 'on'
		}]

	});
});
