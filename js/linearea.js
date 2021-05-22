function linearea_initialize() {
    svg = d3.select("#svg");
	//이전 차트 전부 삭제
	svg.selectAll("*").remove();
	
	minmax = svg.append("path");
	q1q3 = svg.append("path");
    container = svg.append("path");
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
    minmax.attr("transform", `translate(${margin.left}, ${margin.top})`).attr("clip-path", "url(#clip)");
	q1q3.attr("transform", `translate(${margin.left}, ${margin.top})`).attr("clip-path", "url(#clip)");
}

function linearea_update(p_data, po_data, xVar, yVar, xMin, xMax) {
	var boxdatadict = {};
	p_data.forEach(d => {
		if(d[xVar] in boxdatadict)
			boxdatadict[d[xVar]]['data'].push(d[yVar]);
		else
			boxdatadict[d[xVar]] = {'data': [d[yVar]]};
	});
	
	var boxdata = [];
	var min_of_min = 9999;
	var max_of_max = -9999;
	
	for (const [key, value] of Object.entries(boxdatadict)) {
		boxdatadict[key]['data'] = boxdatadict[key]['data'].sort(d3.ascending)
		
		q1 = d3.quantile(boxdatadict[key]['data'], .25);
		q3 = d3.quantile(boxdatadict[key]['data'], .75);
		min = boxdatadict[key]['data'][0]
		max = boxdatadict[key]['data'][boxdatadict[key]['data'].length - 1];
		
		if(min_of_min > min)
			min_of_min = min
		if(max_of_max < max)
			max_of_max = max
		
		boxdata.push({"q1":q1, "q3":q3, "min":min, "max":max, 'var':new Date(key)});
	}
	
    xScale = d3.scaleTime().domain([xMin, xMax]).range([0, width]);
    yScale = d3.scaleLinear().domain(d3.extent(p_data, d => d[yVar])).range([height, 0]);
	
    minmax.datum(boxdata)
		.attr("fill", "#F0F0B6")
		.attr("stroke", "#F0F0B6")
		.attr("stroke-width", 1)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("d", d3.line()
		.x(d => xScale(d['var']))
		.y(d => yScale(d['max'])))
		.attr("d", d3.area()
		.x(d => xScale(d['var']))
		.y0(d => yScale(d['min']))
		.y1(d => yScale(d['max'])));
		
    q1q3.datum(boxdata)
		.attr("fill", "#F0B6B6")
		.attr("stroke", "#F0B6B6")
		.attr("stroke-width", 1)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("d", d3.line()
		.x(d => xScale(d['var']))
		.y(d => yScale(d['max'])))
		.attr("d", d3.area()
		.x(d => xScale(d['var']))
		.y0(d => yScale(d['q1']))
		.y1(d => yScale(d['q3'])));
		
    container.datum(po_data)
		.attr("fill", "none")
		.attr("stroke", "red")
		.attr("stroke-width", 2)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("d", d3.line().x(d => xScale(d[xVar])).y(d => yScale(d[yVar])));
	
    xAxis
        .attr("transform", `translate(${margin.left}, ${margin.top + height})`)
        .transition()
        .call(d3.axisBottom(xScale));

    yAxis
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .transition()
        .call(d3.axisLeft(yScale));
}


