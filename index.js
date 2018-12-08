let json, req = new XMLHttpRequest();

req.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json',true);
req.send();
req.onload = function() {
  json = JSON.parse(req.responseText);
  console.log(d3.extent(json.data, (d) => d[0]));
  console.log(d3.extent(json.data, (d) => d[1]));
  console.log(json.data.length);
  console.log((json.data.length / 4) - 1);
  const years = json.data.map(d => d[0].slice(0, 4));
  
  console.log(d3.timeYear.range("1947", "2015", 2));
  
  drawSvg();
};

// const w = 500;
// const h = 500;

// const svg = d3.select("main")
//   .append("svg")
//   .attr("width", w)
//   .attr("height", h);

function drawSvg() {
  
  const h = 500;
  const w = h * 1.6;
  const padding = h * .05;
  const vbXmin = padding * -1;
  const vbYmin = padding * -1;
  const vbWidth = w + padding;
  const vbHeight = h + padding;
  const barWidth = (w - padding * 2) / json.data.length;

  const dates = json.data.map(d => new Date(d[0]));
  // console.log(dates);
  
  const xScale = d3.scaleTime()
    .domain([new Date(json.from_date), new Date(json.to_date)])
    .range([padding, w - padding]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(json.data, (d) => d[1])])
    .range([h - padding, padding]); // keeps the plot right-side-up 

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  const svg = d3.select("div#container")
    .append("svg")
    // .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", vbXmin + " " + vbYmin + " " + vbWidth + " " + vbHeight)
    // .attr("width", w)
    // .attr("height", h)
    .classed("svg-content", true);

  svg.selectAll("rect")
    .data(json.data)
    .enter()
    .append("rect")
    .classed("bar", true)
    .attr("x", (d, i) => (padding + (i * barWidth)))
    .attr("y", (d) => yScale(d[1]))
    .attr("width", barWidth)
    .attr("height", (d) => (h - padding) - yScale(d[1]))
    .attr("data-date", (d) => d[0])
    .attr("data-gdp", (d) => d[1])
    .attr("fill", "green");

  svg.append("g")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);

  svg.append("g")
    .attr("transform", "translate(" + padding + ", 0)")
    .call(yAxis);
  
}





