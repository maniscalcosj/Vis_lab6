export default function AreaChart(container) {
  
  // input: selector for a chart container e.g., ".chart"
  // initialization 
  /* define margins and container dimensions */
  const margin = {top: 20, right: 10, bottom: 20, left: 50};
  const width = 900 - margin.left - margin.right;
  const height = 250 - margin.top - margin.bottom;

  /* create chart container */
  const svg = d3.select(container).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  /* create single path for the area */
  const areaPath = svg.append("path")
    .attr("class", "areaPath");
  
  /* define scale for x-axis (no domain) */
  const xScale = d3.scaleTime()
    .range([0, width]);

  /* define y axis linear scale (no domain) */
  const yScale = d3.scaleLinear()
    .range([height, 0]);

  /* add x axis at bottom of chart */
  const xAxis = d3.axisBottom()
    .scale(xScale);
  
  /* add y axis at left of chart */
  const yAxis = d3.axisLeft()
    .scale(yScale);

  /* format x axis */
  const xLabels = svg.append("g")
    .attr("class","axis xAxis")
    .attr("transform",`translate(0, ${height})`);
  
  /* format x axis */
  const yLabels = svg.append("g")
    .attr("class","axis yAxis");

  /* add y axis header */
  const yHeader = svg.append("text")
    .attr("class", "yHeader")
    .attr("x", 0)
    .attr("y", 0 - margin.top)
    .attr("dy", "1em")
    .style("text-anchor", "start")
    .text("Total Number Unemployed");
  
    
  /* create default brush and initialize listeners and dispatch */
  const listeners = {brushed:null};
  const dispatch = d3.dispatch("brush", "brushend");
  const defaultSelection = null; 

  /* brush selection */
  function brushed({selection}) {
    if (selection) {listeners["brushed"](selection.map(xScale.invert))};
  }

  /* brush no selection */
  function brushend({selection}) {
    if (!selection) {listeners["brushed"](defaultSelection)};
  }

  /* create brush */
  const brush = d3
    .brushX()
    .extent([[0, 0],[width, height]])
    .on("brush",brushed)
    .on("end", brushend);

  /* add the brush by calling upon a SVG group */
  svg.append("g").attr('class', 'brush').call(brush);   

  function update(data){ 

    // update scales, encodings, axes (use the total count)

    /* Update Scale Domains */
    // get extents of dates
    let extentX = d3.extent(data.map(d => d.date));
    let minX = extentX[0];
    let maxX = extentX[1];

    xScale.domain([minX, maxX]);

    /* get max number of stores to set y axis limit */
    let extentY = d3.extent(data.map(d => d.total));
    let maxY = extentY[1];

    yScale.domain([0, maxY]);

    /* create area generator */
    const area = d3.area()
      .x(d => xScale(d.date))
      .y1(d => yScale(d.total))
      .y0(yScale(0));

    /* bind data to area path and make blue */
    areaPath.datum(data)
      .attr("d", area)
      .attr("fill", "blue");

    /* update labels */
    xLabels.call(xAxis);

    yLabels.call(yAxis);

  }
  
  /* callback for brushed event */
  function on(event, listener) {
    listeners[event] = listener;
  }

  return {
    update, // ES6 shorthand for "update": update
    on
  }    
  
}