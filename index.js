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
  const h = 400;
  const w = h * 1.6;


  /** Set the scales for x and y axes */
  const xScale = d3.scaleTime()
    .domain([new Date(json.from_date), new Date(json.to_date)])
    .range([0 , w]);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(json.data, (d) => d[1])])
    .range([h, 0]); // keeps the plot right-side-up 
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  /** Create hidden temp svg to capture axis tick sizes, then remove it */
  let xAxisMaxTickH = 0;
  let yAxisMaxTickW = 0;
  const tempSvg = d3.select("div#container")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .style("visibility", "hidden")
    ;
  
   // temp x-axis 
  tempSvg.append("g")
    .attr("id", "x-axis-temp")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis);
  // temp y-axis
  tempSvg.append("g")
    .attr("id", "y-axis-temp")
    .attr("transform", "translate(0, 0)")
    .call(yAxis);
    
  d3.select("g#x-axis-temp")
    .selectAll(".tick")
    .each(function(d) {
      let h = this.getBBox().height;
      if (h > xAxisMaxTickH) xAxisMaxTickH = h;
    });
  
  d3.select("g#y-axis-temp")
    .selectAll(".tick")
    .each(function(d) {
      let w = this.getBBox().width;
      if (w > yAxisMaxTickW) yAxisMaxTickW = w;
    });

  tempSvg.remove();
  
  console.log(yAxisMaxTickW);
  console.log(xAxisMaxTickH);

  /** Set "margins" for viewBox area outside of chart */
  const marginSize = 0.1;
  const margin = {
    top: h * marginSize,
    right: h * marginSize,
    bottom: h * marginSize,
    left: h * marginSize
  };

  // Set padding for svg element
  const padding = h * .1;


  /** Set viewBox dimensions  */
  const vbXmin = 0 - yAxisMaxTickW - margin.left;
  const vbYmin = 0 - margin.top;
  // Top and left margins are factored in to make up for their neg values. 
  const vbXmax = w + margin.right + -vbXmin;
  const vbYmax = h + xAxisMaxTickH + margin.bottom + -vbYmin;
  
  /** Chart coordinates */
  const chartXmid = (w / 2) - (yAxisMaxTickW / 2);
  const chartYmid = h / 2;
  
  /** Set width of each bar */
  const barWidth = w / json.data.length;
  

  

  
  /** Create the svg viewBox */ 
  const svg = d3.select("div#container")
    .append("svg")
    // .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", vbXmin + " " + vbYmin + " " + vbXmax + " " + vbYmax)
    // .attr("width", w)
    // .attr("height", h)
    .attr("class", "svg-content");


  /** Create defs */
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
  
  /** Chart title text */
  svg.append("text")
    .attr("x", chartXmid)
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("United States GDP");

  // Create bars from json data
  svg.selectAll("rect")
    .data(json.data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d, i) => (i * barWidth))
    .attr("y", (d) => yScale(d[1]))
    .attr("width", barWidth)
    .attr("height", (d) => h - yScale(d[1]))
    .attr("data-date", (d) => d[0])
    .attr("data-gdp", (d) => d[1])
    .attr("fill", "url(#grad1)");

  // x-axis 
  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis);
  // y-axis
  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(0, 0)")
    .call(yAxis);

  svg.selectAll(".bar")
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
      const year = d[0].slice(0,4);
      tooltip
        .style("top", (d3.event.pageY - 50) + "px")
        .style("left", (d3.event.pageX + 20) + "px");
        // .style("left", function() {
        //   if (+year < 1982) {
        //     return (d3.event.pageX+10) + "px";
        //   } else {
        //     return (d3.event.pageX-150) + "px";
        //   }
        // });
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill", "url(#grad1)");
      tooltip.style("visibility", "hidden");
    });
  
}