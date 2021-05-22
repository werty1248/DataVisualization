function heatmap_initialize() {
    svg = d3.select("#svg");
	//이전 차트 전부 삭제
	svg.selectAll("*").remove();
	container = svg.append("g");
	
    xAxis = svg.append("g");
    yAxis = svg.append("g");

    xScale = d3.scaleBand();
    yScale = d3.scaleLinear();

    svg.append("defs")
		.append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", heatmap_width + margin.left + margin.right)
		.attr("height", heatmap_height + margin.top + margin.bottom);
		
    svg.attr("width", heatmap_width + margin.left + margin.right).attr("height", heatmap_height + margin.top + margin.bottom);
    container.attr("transform", `translate(${margin.left}, ${margin.top})`).attr("clip-path", "url(#clip)");
}

function heatmap_update(po_data, xVar, yVar, xMin, xMax) {
	
	var hourlydata = {};
	var hourlydatalist = [];
	var max = -1;
	var min = 9999;
	
	var days = ["Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat"]
	
	po_data.forEach(d => {
		date = new Date(d[xVar]);
		date_key = "" + date.getHours() + "_" + date.getDay()
		if(hourlydata[date_key] == undefined)
			hourlydata[date_key] = [];
		if(date >= xMin && date <= xMax)
			hourlydata[date_key].push(d[yVar]);
	});
	
	for (const [key, value] of Object.entries(hourlydata)) {
		var mean = 0;
		value.forEach(d => {mean += d});
		mean /= value.length;
		hourlydatalist.push([key, mean]);
		if(mean > max)
			max = mean
		if(mean < min)
			min = mean
	}
	
    xScale = d3.scaleLinear().domain([0, 24]).range([0, heatmap_width]);
    yScale = d3.scaleBand().domain(days).range([heatmap_height, 0]);
	var Color = d3.scaleLinear().range(["#FFFFFF", "#206010"]).domain([min, max])
	
	container.selectAll("heat")
      .data(hourlydatalist)
	  .enter()
      .append("rect")
      .attr("x", d => xScale(d[0].split("_")[0]))
      .attr("y", d => yScale(days[d[0].split("_")[1]]))
      .attr("width", heatmap_size - 2)
      .attr("height", heatmap_size - 2)
      .style("fill", function(d) { return Color(d[1] ? d[1] : 0)} );
    xAxis
        .attr("transform", `translate(${margin.left}, ${margin.top + heatmap_height})`)
        .transition()
        .call(d3.axisBottom(xScale));

    yAxis
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .transition()
        .call(d3.axisLeft(yScale));
}


