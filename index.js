let json, req = new XMLHttpRequest();

const tooltip = d3.select("body")
  .append("div")
  .attr("id", "tooltip")
  // .attr("data-date", "")
  // .attr("data-gdp", "")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .each( function() {
    d3.select(this).append("span").attr("id", "date");
    d3.select(this).append("span").attr("id", "gdp");
  })
;

req.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json',true);
req.send();
req.onload = function() {
  json = JSON.parse(req.responseText);
  console.log(d3.extent(json.data, (d) => d[0]));
  console.log(d3.extent(json.data, (d) => d[1]));
  
  drawSvg();
};


function drawSvg() {
  
  // Set initial svg dimensions to 16:10 ratio
  const w = 800;
  const h = w / 1.6;

  const margin = {top: 20, right: 10, bottom: 20, left: 10};

  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  /** Set width for each bar */
  const barWidth = width / json.data.length;

  /** Set the scales for x and y axes */
  const xScale = d3.scaleTime()
    .domain([new Date(json.from_date), new Date(json.to_date)])
    .range([0 , width]);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(json.data, (d) => d[1])])
    .range([height, 0]) // keeps the plot right-side-up 
    ; 
  
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.format("$,"));

  /** Create hidden temp svg to capture axis tick sizes, then remove it */
  let xAxisMaxTickH = 0;
  let yAxisMaxTickW = 0;
  const tempSvg = d3.select("div#svg-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("visibility", "hidden")
    ;
  
   // temp x-axis 
  tempSvg.append("g")
    .attr("id", "x-axis-temp")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  // temp y-axis
  tempSvg.append("g")
    .attr("id", "y-axis-temp")
    .attr("transform", "translate(0, 0)")
    .call(yAxis);
    
  d3.select("g#x-axis-temp")
    .selectAll(".tick")
    .each(function(d) {
      let xTickH = Math.ceil(this.getBBox().height);
      if (xTickH > xAxisMaxTickH) xAxisMaxTickH = xTickH;
    });
  
  d3.select("g#y-axis-temp")
    .selectAll(".tick")
    .each(function(d) {
      let yTickW = Math.ceil(this.getBBox().width);
      if (yTickW > yAxisMaxTickW) yAxisMaxTickW = yTickW;
    });

  tempSvg.remove();
  
  console.log(yAxisMaxTickW);
  console.log(xAxisMaxTickH);
  
  const svg = d3.select("main div#svg-container")
    // .style("padding-bottom", (100 * (h / w) + "%"))
    .append("svg")
    .attr("width", width + margin.left + margin.right + yAxisMaxTickW)
    .attr("height", height + margin.top + margin.bottom + xAxisMaxTickH)
    // .attr("id", "svg-content")
    // .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    ;

  /** Create svg defs */
  const defs = svg.append("defs");

  // linearGradients for bars
  defs.append("linearGradient")
    .attr("id", "grad1")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    .each( function() {
      d3.select(this).append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "hsl(120, 100%, 45%)")
        .attr("stop-opacity", "1"),
      d3.select(this).append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "hsl(120, 100%, 35%)")
        .attr("stop-opacity", "1")
    });

  defs.append("linearGradient")
    .attr("id", "grad2")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    .each( function() {
      d3.select(this).append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "hsl(120, 100%, 85%)")
        .attr("stop-opacity", "1"),
      d3.select(this).append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "hsl(120, 100%, 90%)")
        .attr("stop-opacity", "1")
    });

  const barChart = svg.append("g")
    .attr("id", "bar-chart")
    .attr("transform", "translate(" + (margin.left + yAxisMaxTickW) + "," + margin.top + ")");
  
  // Temp outline for bar chart
  barChart.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("stroke", "blue")
    .attr("stroke-weight", "2")
    .attr("fill", "none");

  /** Chart title text */
  barChart.append("text")
    .attr("x", (width / 2) - (yAxisMaxTickW / 2))
    .attr("y", 12)
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("United States Gross Domestic Product (1947 Q1 - 2015 Q3)");

  /** Create bars from json data */
  barChart.selectAll("rect")
    .data(json.data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d, i) => (i * barWidth))
    .attr("y", (d) => yScale(d[1]))
    .attr("width", barWidth)
    .attr("height", (d) => height - yScale(d[1]))
    .attr("data-date", (d) => d[0])
    .attr("data-gdp", (d) => d[1])
    .attr("fill", "url(#grad1)");

  // x-axis 
  barChart.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  // y-axis
  barChart.append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(0, 0)")
    .call(yAxis);
  // y-axis label
  barChart.append("text")
    .attr("x", 25)
    .attr("y", height / 2 )
    .style("text-anchor", "middle")
    .text("GDP in Billions")
    .attr("transform", function(d) { 
      const x = d3.select(this).attr("x");
      const y = d3.select(this).attr("y");
      return "rotate(-90 " + x + " " + y + ")"
    });

  /** Hover effects for bar fill and tooltip */
  barChart.selectAll(".bar")
    .on("mouseover", function(d) {
      d3.select(this).attr("fill", "url(#grad2)");
      tooltip
        .style("visibility", "visible")
        .attr("data-date", d[0])
        .attr("data-gdp", d[1])
        .selectAll("span")
        .each(function() {
          d3.select("#date").text(function() {
            const year = d[0].slice(0, 4);
            const mo = d[0].slice(5, 7);
            switch (mo) {
              case '01': return year + " Q1";
              case '04': return year + " Q2";
              case '07': return year + " Q3";
              case '10': return year + " Q4";
              default: return "";
            }
          })
          d3.select("#gdp").text(function() {
            return d3.format(" $,.6~r")(d[1]) + " B";
          })
        });
    })
    .on("mousemove", function(d) { 
      tooltip
        .style("top", (d3.event.pageY - 50) + "px")
        .style("left", (d3.event.pageX + 20) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill", "url(#grad1)");
      tooltip.style("visibility", "hidden");
    });
  
}