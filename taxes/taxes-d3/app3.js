import taxesCalculator from './calculator.js';

let data1 = [];
let data2 = [];
let data3 = [];
let data4 = [];
let data5 = [];

for (let i = 4000; i <= 1000000; i += 1000) {
    data1.push({rate: (taxesCalculator(i, '1') * 100).toFixed(2), income: i});
    data2.push({rate: (taxesCalculator(i, '2') * 100).toFixed(2), income: i});
    data3.push({rate: (taxesCalculator(i, '3') * 100).toFixed(2), income: i});
    data4.push({rate: (taxesCalculator(i, 'pdfo') * 100).toFixed(2), income: i});
    data5.push({rate: (taxesCalculator(i, 'diia') * 100).toFixed(2), income: i});
}



function createGraph(data, title, elementId) {
  // set the dimensions and margins of the graph
  let margin = {top: 30, right: 30, bottom: 30, left: 30},
      width = 290 - margin.left - margin.right,
      height = 290 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  let svg = d3.select(elementId)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      // .style('background-color', '#fffaec')
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Add a rectangle for the chart background color
  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "#fffaec");

  let padding = 10;

  // Add X axis
  let x = d3.scaleLinear()
    .domain([0, d3.max(data, d => parseFloat(d.rate))])
    .range([padding, width - padding]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .attr("class", "x-axis-ticks")
    .select(".domain").remove(); // Remove the x-axis line  // Add X axis label

  // Add the rect
  svg.append("rect")
    .attr("class", "x-axis-label") // Add the class
    .attr("width", 64)
    .attr("height", 12)
    .attr("transform", "translate(" + 0 + "," + (height + margin.bottom - 24) + ")") // Position the rect
    .style("fill", "#FFFFFF"); // Set the background color

  svg.append("text")
    .attr("class", "x-axis-label") // Add the class
    .attr("text-anchor", "start") // this makes it easy to centre the text as the transform is applied to the anchor
    .attr("transform", "translate(" + padding + "," + (height + margin.bottom - 14) + ")") // text is drawn off the screen top left, move down and out and rotate
    .text("Відсоток:");


  // Define the values you want to see on the y-axis
  // let yAxisValues = [10000, 50000, 100000, 500000, 1000000, 1500000];

  // Add Y axis
  // let y = d3.scaleLinear()
  let y = d3.scaleLog()
    .domain([5000, d3.max(data, d => Math.max(1, d.income))]) // Ensure domain doesn't start at 0 for log scale
    // .domain([0, d3.max(1, d => d.income)]) // linear scale
    .range([height - padding, padding]);
  svg.append("g")
    // .attr("transform", "translate(0," + width + ")")
    .call(d3.axisLeft(y)
      .tickValues([5000, 10000, 20000, 30000, 40000, 50000, 100000, 200000, 300000, 400000, 500000, 1000000])
      .tickFormat(d => d3.format("")(d / 1000)) // Divide by 1000 before formatting
    )
    .attr("class", "y-ticks")
    // .tickValues(yAxisValues)) // Use the defined values as tick values
    .select(".domain").remove(); // Remove the y-axis line
  // Add Y axis label
  svg.append("text")
    .attr("class", "y-axis-label") // Add the class
    .attr("text-anchor", "start") // this makes it easy to centre the text as the transform is applied to the anchor
    .attr("transform", "translate(" + (margin.left - padding - 50) + "," + (padding - 15) + ")") // text is drawn off the screen top left, move down and out and rotate
    .text("ЗП, \n тис. грн:");

  // Recolor axes tick labels
  svg.selectAll(".tick text")
    .style("fill", "#C7BDAE");

  // Add title
  svg.append("text")
    .attr("class", "title") // Add the class
    .attr("text-anchor", "end") // Align the text to the right
    .attr("x", width) // Position the text at the right edge of the SVG
    .attr("y", padding - 15) // Position the text at the top of the SVG, below the padding
    .text(title);




    
  // This allows to find the closest X index of the mouse:
  let bisect = d3.bisector(function(d) { return d.income; }).left;

  // Create the text that travels along the curve of chart
  let focusText = svg
  .append('g')
  .append('text')
    .style("opacity", 1)
    .attr("text-anchor", "end") // Align the text to the end, so it aligns to the right
    .attr("alignment-baseline", "middle")
    .attr("x", width - 25) // Position at the right edge of the SVG
    .attr("y", 25); // Position at the top of the SVG

  // Add the chart line
  svg
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.rate) })
      .y(function(d) { return y(d.income) })
      )
    .style("stroke", "#675230");

  // Create a rect on top of the svg area: this rectangle recovers mouse position
  svg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

  let verticalLine = svg.append('line')
    .style("stroke", "#B0AA9E")
    .style("stroke-width", 1)
    .style("stroke-dasharray", ("5, 5"))
    .style("opacity", 1); // initial visibility

  let horizontalLine = svg.append('line')
    .style("stroke", "#B0AA9E")
    .style("stroke-width", 1)
    .style("stroke-dasharray", ("5, 5"))
    .style("opacity", 1); // initial visibility

  // Create the circle that travels along the curve of chart
  let focus = svg
    .append('g')
    .append('circle')
      .style("fill", "#ED2238")
      // .attr("stroke", "black")
      .attr('r', 8)
      .style("opacity", 0) // initial visibility
      .attr("cx", x(data[0].rate))
      .attr("cy", y(data[0].income))

  // What happens when the mouse move -> show the annotations at the right positions.
  function mouseover() {
    d3.selectAll('circle').style("opacity", 1);
    focusText.style("opacity",1)
    verticalLine.style("opacity", 1);
    horizontalLine.style("opacity", 1);
    }



  function mousemove() {
    // recover coordinate we need
    let y0 = y.invert(d3.mouse(this)[1]);
    let i = bisect(data, y0, 1);
    let selectedData = data[i]
  
    // Update the position of the pointers on all graphs
    graphs.forEach(graph => {
      let i = graph.bisect(graph.data, selectedData.income, 1);
      let selectedDataForGraph = graph.data[i];

      graph.focus
        .attr("cx", graph.x(selectedDataForGraph.rate))
        .attr("cy", graph.y(selectedData.income));

        
      graph.focusText
        .text('')
        .append('tspan')
        .attr('x', 220)
        .text("Сума: ")
        .attr("class", "suma-text");
      
      graph.focusText
        .append('tspan')
        .text(selectedDataForGraph.income)
        .attr("class", "suma-numbers");
      
      graph.focusText
        .append('tspan')
        .attr('x', 220)
        .attr('dy', '15')
        .text("Податок: ")
        .attr("class", "podatok-text");
      
      graph.focusText
        .append('tspan')
        .text(selectedDataForGraph.rate + "%")
        .attr("class", "podatok-numbers");


      graph.verticalLine
        .attr("x1", graph.x(selectedDataForGraph.rate))
        .attr("y1", 0)
        .attr("x2", graph.x(selectedDataForGraph.rate))
        .attr("y2", height);

      graph.horizontalLine
        .attr("x1", 0)
        .attr("y1", graph.y(selectedData.income))
        .attr("x2", width)
        .attr("y2", graph.y(selectedData.income));
    });
  }

  function mouseout() {
    focus.style("opacity", 10)
    focusText.style("opacity", 10)
    verticalLine.style("opacity", 10)
    horizontalLine.style("opacity", 10);
  }

  return { data, focus, focusText, verticalLine, horizontalLine, x, y, bisect };

}

function updateGraph(graph, newData) {
  // Update the data
  graph.data = newData;

  // Select the graph and bind the new data to it
  let line = d3.select(graph.elementId)
    .select(".line") // assuming your line has a class of "line"
    .datum(graph.data);

  // Define the line generator
  let lineGenerator = d3.line()
    .x(function(d) { return graph.x(d.rate) })
    .y(function(d) { return graph.y(d.income) });

  // Redraw the line with the new data
  line.transition()
    .duration(1000)
    .attr("d", lineGenerator);
}

function movePointerToY(yValue) {
  
  graphs.forEach(graph => {

    let i = graph.bisect(graph.data, yValue, 1);
    let selectedDataForGraph = graph.data[i];

    graph.focus
      .attr("cx", graph.x(selectedDataForGraph.rate))
      .attr("cy", graph.y(yValue));

      graph.focusText
      .text('')
      .append('tspan')
      .attr('x', 210)
      .text("Сума: ")
      .attr("class", "suma-text");
    
    graph.focusText
      .append('tspan')
      .text(selectedDataForGraph.income)
      .attr("class", "suma-numbers");
    
    graph.focusText
      .append('tspan')
      .attr('x', 210)
      .attr('dy', '15')
      .text("Податок: ")
      .attr("class", "podatok-text");
    
    graph.focusText
      .append('tspan')
      .text(selectedDataForGraph.rate + "%")
      .attr("class", "podatok-numbers");

      graph.verticalLine
      .attr("x1", graph.x(selectedDataForGraph.rate))
      .attr("y1", 0)
      .attr("x2", graph.x(selectedDataForGraph.rate))
      .attr("y2", 360);
    graph.horizontalLine
      .attr("x1", 0)
      .attr("y1", graph.y(yValue))
      .attr("x2", 370)
      .attr("y2", graph.y(yValue));
  });

}

function handleSubmit(event) {
  event.preventDefault();
  let income_i = parseInt(document.getElementById('incomeInput').value);

  data1.push({rate: (taxesCalculator(income_i, '1') * 100).toFixed(2), income: income_i});
  data2.push({rate: (taxesCalculator(income_i, '2') * 100).toFixed(2), income: income_i});
  data3.push({rate: (taxesCalculator(income_i, '3') * 100).toFixed(2), income: income_i});
  data4.push({rate: (taxesCalculator(income_i, 'pdfo') * 100).toFixed(2), income: income_i});
  data5.push({rate: (taxesCalculator(income_i, 'diia') * 100).toFixed(2), income: income_i});
  console.log(data5);

  // Sort the data by income
  data1.sort((a, b) => a.income - b.income);
  data2.sort((a, b) => a.income - b.income);
  data3.sort((a, b) => a.income - b.income);
  data4.sort((a, b) => a.income - b.income);
  data5.sort((a, b) => a.income - b.income);

  // Update the graphs with the new data
  updateGraph(graphs[0], data1);
  updateGraph(graphs[1], data2);
  updateGraph(graphs[2], data3);
  updateGraph(graphs[3], data4);
  updateGraph(graphs[4], data5);

  // Move the pointer to the submitted y value
  movePointerToY(income_i);
}



document.getElementById('inputField').addEventListener('submit', handleSubmit);

let graphs = [
  createGraph(data1, "ФОП 1", "#my_dataviz1"),
  createGraph(data2, "ФОП 2", "#my_dataviz2"),
  createGraph(data3, "ФОП 3", "#my_dataviz3"),
  createGraph(data4, "ПДФО", "#my_dataviz4"),
  createGraph(data5, "ДІЯ.City", "#my_dataviz5")
];
