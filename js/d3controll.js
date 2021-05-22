let svg; // the main container, <svg>
let container, minmax, q1q3, emphasize; // <g> for circles
let xAxis; // <g> for the x axis
let yAxis; // <g> for the y axis
let legend; // <g> for the legend

let width = 400, height = 400;
let heatmap_size = 25;
let heatmap_height = heatmap_size * 7;
let heatmap_width = heatmap_size * 25;
let margin = { top: 10, right: 10, bottom: 40, left: 40 };
let pollutant_info = {"1":"SO2","3":"NO2","5":"CO","6":"O3","8":"PM10","9":"PM2.5"};
let full_data = []; // loaded data
let xScale, yScale;
let periodSlider, empPeriodSlider;


//데이터 로딩 및 변환 관련
function str2date(str) {
    var y = str.substr(0, 4);
    var m = str.substr(4, 2);
    var d = str.substr(6, 2);
    var h = str.substr(8, 2);
    var M = str.substr(10, 2);
    var s = str.substr(12, 2);
    return new Date(y,m-1,d,h,M,s);
}

d3.csv("AIR_HOUR_202001.csv", function(csvData) {
    csvData["측정항목"] = pollutant_info[csvData["측정항목 코드"]];
	csvData["평균값"] = +csvData["평균값"];
	csvData["지자체 기준초과 구분"] = +csvData["지자체 기준초과 구분"];
	csvData["국가 기준초과 구분"] = +csvData["국가 기준초과 구분"];
	console.log(csvData);
	csvData["저장일시"] = str2date(csvData["저장일시"]);
	csvData["측정일시"] = str2date(csvData["측정일시"]);
	
	if(csvData["측정기 상태"] === "0")
		full_data.push(csvData)
	}).then(d => {console.log("Data Load Finished");
	initialize();});
	
//임시로 빼놓기(라인차트)
function line_initialize() {
    svg = d3.select("#svg");
	svg.selectAll("*").remove();
    container = svg.append("g");
    xAxis = svg.append("g");
    yAxis = svg.append("g");

    xScale = d3.scaleLinear();
    yScale = d3.scaleLinear();

    svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

    container.attr("transform", `translate(${margin.left}, ${margin.top})`);
	
}

function line_update(data, xVar, yVar, xMin, xMax) {
    xScale = d3.scaleLinear().domain(d3.extent(data, d => d[xVar])).range([0, width]);
    yScale = d3.scaleLinear().domain(d3.extent(data, d => d[yVar])).range([height, 0]);
	
    container.selectAll("circle")
		.data(data)
        .join("circle")
        .transition()
        .attr("cx", d => xScale(d[xVar]))
        .attr("cy", d => yScale(d[yVar]))
        .attr("r", 3)

    xAxis
        .attr("transform", `translate(${margin.left}, ${margin.top + height})`)
        .transition()
        .call(d3.axisBottom(xScale));

    yAxis
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .transition()
        .call(d3.axisLeft(yScale));
}

// 차트 초기화
function initialize() {
	//remove하되 update 안함
	removeAndUpdate(false);
	
    d3.selectAll('input[name="views"]').on("change", removeAndUpdate);
    d3.select("#observatory").on("change", update);
    d3.selectAll('input[name="pollutant"]').on("change", update);
	  
	periodSlider = new rSlider({
		target: '#period',
		values: function() {
			var daysOfYear = [];
			for (var d = new Date(2020, 0, 1); d <= new Date(2020, 1, 1); d.setDate(d.getDate() + 1)) {
				daysOfYear.push(d.getFullYear() + "-" + String(d.getMonth()+1) + "-" + d.getDate());
			}
			return daysOfYear
		}(),
		range: true,
		autoWidth: true,
		scale:    true,
		labels:   false,
		onChange: update
	});
	
	empPeriodSlider = new rSlider({
		target: '#emp_period',
		values: function() {
			var daysOfYear = [];
			for (var d = new Date(2020, 0, 1); d <= new Date(2020, 1, 1); d.setDate(d.getDate() + 1)) {
				daysOfYear.push(d.getFullYear() + "-" + String(d.getMonth()+1) + "-" + d.getDate());
			}
			return daysOfYear
		}(),
		range: true,
		autoWidth: true,
		scale:    true,
		labels:   false,
		onChange: update
	});
}

// 새로운 차트 생성
function removeAndUpdate(needUpdate = true) {
	let vistype = d3.select('input[name="views"]:checked').node().value;
	if(vistype === "heatmap") {
		heatmap_initialize();
		if(d3.select('#emphasize').node().style.visibility === "visible") {
			console.log("Disable emphasize period slider")
			d3.select('#emphasize').node().style.visibility = "hidden";
		}
	}
	else if(vistype === "linearea") {
		periodSlider.setValues("2020-1-1", "2020-1-7");
		linearea_initialize();
		if(d3.select('#emphasize').node().style.visibility === "visible") {
			console.log("Disable emphasize period slider")
			d3.select('#emphasize').node().style.visibility = "hidden";
		}
	}
	else {
		empPeriodSlider.setValues("2020-1-25", "2020-2-1");
		lineoverlap_initialize();
		if(d3.select('#emphasize').node().style.visibility === "hidden") {
			console.log("Enable emphasize period slider")
			d3.select('#emphasize').node().style.visibility = "visible";
		}
	}
	if(needUpdate)
		update();
}

//차트 업데이트
function update() {
	let vistype = d3.select('input[name="views"]:checked').node().value;
    let xVar = "측정일시";
    let yVar = "평균값";
    let pollutant = d3.select('input[name="pollutant"]:checked').node().value;
	let observatory = d3.select('#observatory').node().value;
	let period = periodSlider.getValue().split(",");
	let emp_period = empPeriodSlider.getValue().split(",");
	
	//데이터 가시화
	if(vistype === "heatmap") {
	}
	else if(vistype === "linearea") {
	}
	else {
		//강조 기간 슬라이더 재배치
		if(Date.parse(period[0]) > Date.parse(emp_period[0])) {
			emp_period[0] = period[0]
			empPeriodSlider.setValues(emp_period[0], emp_period[1])
		}
		if(Date.parse(period[1]) < Date.parse(emp_period[1])) {
			emp_period[1] = period[1]
			empPeriodSlider.setValues(emp_period[0], emp_period[1])
		}
	}
	
	//로그
	if(vistype === "lineoverlap")
		console.log("" + vistype + " - " + observatory + " " + pollutant + " from " + period[0] + " to " + period[1] + " with Emphasize period from " + emp_period[0] + " to " + emp_period[1]);
	else
		console.log("" + vistype + " - " + observatory + " " + pollutant + " from " + period[0] + " to " + period[1]);
	
	// 특정 항목 데이터 전체
	let p_data = full_data.filter(function(d) {
		return d["측정항목"] === pollutant;
	});
	
	// 특정 측정소의 특정 항목 데이터 전체
	let po_data = full_data.filter(function(d) {
		return d["측정항목"] === pollutant && d["측정소 코드"] === observatory;
	});
	
	//각 차트 업데이트
	if(vistype === "heatmap") {
		heatmap_update(po_data, xVar, yVar, new Date(period[0]), new Date(period[1]));
	}
	else if(vistype === "linearea") {
		linearea_update(p_data, po_data, xVar, yVar, new Date(period[0]), new Date(period[1]));
	}
	else {
		lineoverlap_update(po_data, xVar, yVar, new Date(period[0]), new Date(period[1]), new Date(emp_period[0]), new Date(emp_period[1]));
	}
}





