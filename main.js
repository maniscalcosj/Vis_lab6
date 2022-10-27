/* code modularized, so import functions from other js files to be called in main */
import AreaChart from './AreaChart.js';
import StackedAreaChart from './StackedAreaChart.js';

/* load data and total the columns (minus the date attribute) */
d3.csv("unemployment.csv", d3.autoType).then(data => {
  /* calculate total unemployment */
  data.map(d => {
    d.total = d3.sum(data.columns.filter(d => d !== 'date'), i => d[i])
  })
  
  /* make stackedAreaChart object and call update within that class */
  const stackedAreaChart = StackedAreaChart(".areaChart");
  stackedAreaChart.update(data);

  /* make areaChart object and call update within that class */
  const areaChart = AreaChart(".areaChart");
  areaChart.update(data); 

  /* pass handler callback */
  areaChart.on("brushed", (range) =>{
    stackedAreaChart.filterByDate(range); // coordinating with stackedAreaChart
  })
  
})
















