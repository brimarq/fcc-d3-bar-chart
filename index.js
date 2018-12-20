let json, req = new XMLHttpRequest();

/** Create hidden tooltip div */
const tooltip = d3.select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .each( function() {
    d3.select(this).append("span").attr("id", "date");
    d3.select(this).append("span").attr("id", "gdp");
  })
;

/** Send http req */
req.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json',true);
req.send();
req.onload = function() {
  json = JSON.parse(req.responseText);
  drawSvg();
};

function drawSvg() {
  
  /** Set initial svg dimensions to 16:10 ratio */
  const w = 800;
  const h = w / 1.6;

  /** Set "margins" for the chart */
  const margin = {top: h * .1, right: w * .07, bottom: h * .1, left: w * .06};

  /** Set width and height for the chart */
  const width = w - margin.left - margin.right;
  const height = h - margin.top - margin.bottom;

  /** Set width for each bar */
  const barWidth = width / json.data.length;

  /** Set the scales for x and y axes */
  const xScale = d3.scaleTime()
    .domain([new Date(json.from_date), new Date(json.to_date)])
    .range([0 , width])
  ;
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(json.data, (d) => d[1])])
    .range([height, 0]) // keeps the plot right-side-up 
  ; 
  
  /** Axes to be called */
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);
  
  /** Create svg element */
  const svg = d3.select("main div#svg-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  ;

  /** Create svg defs */
  const defs = d3.select("svg").append("defs");

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
    })
  ;

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
    })
  ;

  /** Chart title text */
  svg.append("text")
    .attr("id", "title")
    .attr("x", (w / 2))
    .attr("y", margin.top / 4 * 3)
    .attr("fill", "#222")
    .style("text-anchor", "middle")
    .style("font-size", "1.25em")
    .style("font-weight", "bold")
    .text("United States Gross Domestic Product")
    .append("tspan")
    .attr("x", (w / 2))
    .attr("dy", 20)
    .attr("fill", "#222")
    .style("font-weight", "normal")
    .style("font-size", "0.7em")
    .text("Quarterly, 1947 - 2015 Q3")
  ;

  const barChart = svg.append("g")
    .attr("id", "bar-chart")
  ;
  
  // Temp outline for bar chart
  // barChart.style("outline", "1px solid yellow");

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
    .attr("fill", "url(#grad1)")
  ;

  /** Create barChart axes */
  // barChart x-axis 
  barChart.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
  ;

  // barChart y-axis
  barChart.append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(0, 0)")
    .call(yAxis)
  ;

  // barChart y-axis label
  barChart.append("text")
    .attr("x", 25)
    .attr("y", height / 2 )
    .style("text-anchor", "middle")
    .text("GDP in Billions of Dollars")
    .attr("transform", function(d) { 
      const x = d3.select(this).attr("x");
      const y = d3.select(this).attr("y");
      return "rotate(-90 " + x + " " + y + ")"
    })
  ;

  /** Now, get barChart bbox dimensions and bind data to barChart */
  barChart.each(function() {
    let data = {};
    data.bboxWidth = d3.format(".2~f")(this.getBBox().width);
    data.bboxHeight = d3.format(".2~f")(this.getBBox().height);
    d3.select("g#x-axis").each(function() {
      data.xAxisHeight = d3.format(".2~f")(this.getBBox().height)
    });
    d3.select("g#y-axis").each(function() {
      data.yAxisWidth = d3.format(".2~f")(this.getBBox().width)
    });
    d3.select(this).datum(data);
  });

  /** Center the barChart group in the svg */
  barChart.attr("transform", function(d) {
    let bboxWDiff = d.bboxWidth - width;
    let bboxHDiff = d.bboxHeight - height;
    let newX = Math.round(margin.left + (bboxWDiff / 2));
    let newY = Math.round(margin.top + (bboxHDiff / 2) - (d.xAxisHeight / 2));
    return "translate(" + newX + "," + newY + ")"
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
    })
  ;
  
}