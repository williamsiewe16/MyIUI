(function($) {

	let graphData = $('.graphData').data('graph')

	if(graphData != undefined) buildCharts()

	// Bar Chart 2
	barChart();
	$(window).resize(function(){
		barChart();
	});



function buildCharts(){


	// School Chart
	let data = graphData.schoolData; let schoolColors = []
	data.forEach(d => {
		schoolColors.push("#"+(Math.random()*0xFFFFFF<<0).toString(16))
	})
	let schoolChartData = {
		labels: data.map(d => d._id),
		datasets: [{ backgroundColor: schoolColors, data: data.map(d => d.total)}]
	};
	if($("#schoolGraph").length != 0){
		let schoolCtx = document.getElementById('schoolGraph').getContext('2d');
		window.myBar = new Chart(schoolCtx, {type: 'bar', data: schoolChartData, options: {responsive: true, legend: {display: false}}});
	}

	// Country Chart
	data = graphData.countryData; let countryColors = []
	data.forEach(d => {
		countryColors.push("#"+(Math.random()*0xFFFFFF<<0).toString(16))
	})
	let countryChartData = {
		labels: data.map(d => d._id),
		datasets: [{ backgroundColor: countryColors, data: data.map(d => d.total)}]
	};
	if($("#countryGraph").length != 0){
		let countryCtx = document.getElementById('countryGraph').getContext('2d');
		window.myBar = new Chart(countryCtx, {type: 'bar', data: countryChartData, options: {responsive: true, legend: {display: false}}});
	}

	// City Chart
	data = graphData.cityData; let cityColors = []
	data.forEach(d =>{
		cityColors.push("#"+(Math.random()*0xFFFFFF<<0).toString(16))
	})
	let cityChartData = {
		datasets: [{ backgroundColor: cityColors, data: data.map(d => d.total)}],
		labels: data.map(d => d._id)
	}
	if($("#cityGraph").length != 0){
		let cityCtx = document.getElementById('cityGraph').getContext('2d');
		window.myLine = new Chart(cityCtx, {type: 'bar', data: cityChartData, options: {responsive: true, legend: {display: false,}, tooltips: {mode: 'index', intersect: false,}}});
	}

	// Sex Chart
	data = graphData.sexData; let sexColors = []
	data.forEach(d =>{
		sexColors.push("#"+(Math.random()*0xFFFFFF<<0).toString(16))
	})
	let sexChartData = {
		datasets: [{ backgroundColor: sexColors, data: data.sort().map(d => d.total)}],
		labels: data.sort().map(d => d._id)
	}
	if($("#sexGraph").length != 0){
		let sexCtx = document.getElementById('sexGraph').getContext('2d');
		window.myLine = new Chart(sexCtx, {type: 'pie', data: sexChartData, options: {responsive: true, legend: {display: false,}, tooltips: {mode: 'index', intersect: false,}}});
	}

	// Level Chart
	data = graphData.levelData; let levelColors = []
	data.forEach(d =>{
		levelColors.push("#"+(Math.random()*0xFFFFFF<<0).toString(16))
	})
	let levelChartData = {
		datasets: [{ backgroundColor: levelColors, data: data.map(d => d.total)}],
		labels: data.map(d => d._id)
	}
	if($("#levelGraph").length != 0){
		let levelCtx = document.getElementById('levelGraph').getContext('2d');
		window.myLine = new Chart(levelCtx, {type: 'doughnut', data: levelChartData, options: {responsive: true, legend: {display: false,}, tooltips: {mode: 'index', intersect: false,}}});
	}

}


function barChart(){
	$('.bar-chart').find('.item-progress').each(function(){
		let itemProgress = $(this),
			itemProgressWidth = $(this).parent().width() * ($(this).data('percent') / 100);
		itemProgress.css('width', itemProgressWidth);
	});
}

})(jQuery);
