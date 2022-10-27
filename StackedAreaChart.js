export default function StackedAreaChart(container) {
  
  /* initialize default title to be the total */
  let defaultTitle="Total Number Unemployed";
  
  // initialization
  /* define margins and container dimensions */
  const margin = {top: 20, right: 10, bottom: 20, left: 50};
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  /* create chart container */
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  /* define scale for x-axis (no domain) */
  const xScale = d3.scaleTime()
    .range([0, width]);

  /* define y axis linear scale (no domain) */
  const yScale = d3.scaleLinear()
    .range([height, 0]);

  /* ordinal scale to color code stacked categories */
  const ordinalScale = d3.scaleOrdinal()
    .range(d3.schemeTableau10);

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

  /* format y axis */
  const yLabels = svg.append("g")
    .attr("class"," axis yAxis");

  /* add y axis header */
  const yHeader = svg.append("text")
    .attr("class", "yHeader")
    .attr("x", 0)
    .attr("y", 0 - margin.top)
    .attr("dy", "1em")
    .style("text-anchor", "start")
    .text("Total Number Unemployed");

  /* filter domain */
  let selected = null, xDomain, data; 

  function filterByDate(range) {
    xDomain = range;
    update(data);
  }

  function update(_data) {
    
    /* so update(data) can be called anywhere in the function */
    data = _data;
    
    /* set "industries" (keys) to selected if not null, otherwise use all category names */
    const industries = selected? [selected] : data.columns.filter(d => d !== 'date');

    /* get industry key names */ 
    //let industries = data.columns.slice(1);

    /* compute stack */
    let stack = d3.stack()
      .keys(industries)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    let stackedData = stack(data);

    /* update domains of the scales */
    ordinalScale.domain(industries);
    
    /* set domain for xScale */
    xScale.domain(xDomain ? xDomain : d3.extent(data.map(d => d.date)))
      .nice(d3.timeWeek)
      .clamp(true); // only worried about range of view
    
    /* get yMax */
    let yMax = d3.max(stackedData, 
      d => d3.max(d, d => d[1]) // compute the max of the nested array using y1 or d[1]
    );
    yScale.domain([0,yMax]);

    /* Create area generator */
    const area = d3.area()
      .x(d => xScale(d.data.date))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]));

    /* Create areas based on the stack */
    const areas = svg.selectAll(".stackArea")
      .data(stackedData, d => d.key);

    const stacks = areas.join(
      enter => enter.append("path")
        .attr("class", "stackArea")
        .attr("d", area)
        .attr("fill", d => ordinalScale(d.key)),
      update => update.attr("d", area),
      exit => exit.remove()
    );  
    
    stacks.on("click", (event, d) => {
      // toggle selected based on d.key
      if (selected === d.key) {
        selected = null;
        /* change default y header back to original */
        defaultTitle = "Total Number Unemployed";
      } else {
        selected = d.key;
        /* make sure y header does not change while single key selected */
        defaultTitle = d.key;
      }
      update(data); // simply update the chart again
    });

    /* update axes */
    xLabels.call(xAxis);
    yLabels.call(yAxis);
    
    
    /* functions to update the y header and highlight stacked area */
    let switchHeader = function(event, d) {
      yHeader.text(d.key);
      d3.select(this).style("opacity", 0.5);
    }
    
    let defaultHeader = function() {
      yHeader.text(defaultTitle);
      d3.select(this).style("opacity", 1);
    }
    
    stacks.on("mouseover", switchHeader)
      .on("mouseleave", defaultHeader);

  }  

  return {
    update,
    filterByDate
  }
    
  
}