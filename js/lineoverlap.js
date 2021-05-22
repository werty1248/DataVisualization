function lineoverlap_initialize() {
    svg = d3.select("#svg");
	//이전 차트 전부 삭제
	svg.selectAll("*").remove();
	container = svg.append("g");
	emphasize = svg.append("g");
	
    xAxis = svg.append("g");
    yAxis = svg.append("g");

    xScale = d3.scaleTime();
    yScale = d3.scaleLinear();

    svg.append("defs")
		.append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
    container.attr("transform", `translate(${margin.left}, ${margin.top})`).attr("clip-path", "url(#clip)");
    emphasize.attr("transform", `translate(${margin.left}, ${margin.top})`).attr("clip-path", "url(#clip)");
}

function lineoverlap_update(po_data, xVar, yVar, xMin, xMax, exMin, exMax) {
	
	var hourlydata = {};
	var empdata = {};
	var hourlydatalist = [];
	var empdatalist = [];
	var hour;
	
	po_data.forEach(d => {
		time = new Date(d[xVar]);
		date = new Date(d[xVar]).toDateString();
		if(hourlydata[date] == undefined) {
			hourlydata[date] = [];
			empdata[date] = [];
		}
		if(xMin <= time && xMax >= time)
			hourlydata[date].push(d);
		if(exMin <= time && exMax >= time)
			empdata[date].push(d);
	});
	
	for (const [key, value] of Object.entries(hourlydata))
		hourlydatalist.push(value);
	for (const [key, value] of Object.entries(empdata))
		empdatalist.push(value);
	
    xScale = d3.scaleLinear().domain([0, 24]).range([0, width]);
    yScale = d3.scaleLinear().domain(d3.extent(po_data, d => d[yVar])).range([height, 0]);
	
    container.selectAll("path")
		.data(hourlydatalist)
		.join("path")
		.attr("fill", "none")
		.attr("stroke", "grey")
		.attr("stroke-width", 1)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("d", d3.line()
			.x(d => xScale(new Date(d[xVar]).getHours()))
			.y(d => yScale(d[yVar])));
			
	emphasize.selectAll("path")
		.data(empdatalist)
		.join("path")
		.attr("fill", "none")
		.attr("stroke", "red")
		.attr("stroke-width", 1)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("d", d3.line()
			.x(d => xScale(new Date(d[xVar]).getHours()))
			.y(d => yScale(d[yVar])));
    xAxis
        .attr("transform", `translate(${margin.left}, ${margin.top + height})`)
        .transition()
        .call(d3.axisBottom(xScale));

    yAxis
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .transition()
        .call(d3.axisLeft(yScale));
}


