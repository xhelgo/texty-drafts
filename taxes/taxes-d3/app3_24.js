import taxesCalculator from './calculator_24.js';

let data1 = [];
let data2 = [];
let data3 = [];
let data4 = [];
let data5 = [];

for (let i = 7100; i <= 1000000;) {
  let result1 = taxesCalculator(i, '1');
  let result2 = taxesCalculator(i, '2');
  let result3 = taxesCalculator(i, '3');
  let result4 = taxesCalculator(i, 'pdfo');
  let result5 = taxesCalculator(i, 'diia');

  data1.push({rate: (result1.rate * 100).toFixed(2), income: i, sum: (result1.sum).toFixed(0), naRuky: (result1.naRuky).toFixed(0)});
  data2.push({rate: (result2.rate * 100).toFixed(2), income: i, sum: (result2.sum).toFixed(0), naRuky: (result2.naRuky).toFixed(0)});
  data3.push({rate: (result3.rate * 100).toFixed(2), income: i, sum: (result3.sum).toFixed(0), naRuky: (result3.naRuky).toFixed(0)});
  data4.push({rate: (result4.rate * 100).toFixed(2), income: i, sum: (result4.sum).toFixed(0), naRuky: (result4.naRuky).toFixed(0)});
  data5.push({rate: (result5.rate * 100).toFixed(2), income: i, sum: (result5.sum).toFixed(0), naRuky: (result5.naRuky).toFixed(0)});

  if (i === 7100) {
    i += 900;
  } else {
    i += 1000;
  }
}

function createGraph(data, title, elementId, limit) {
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
    .style("fill", "#fffaec")
    .style("class", "chart-background");

  let padding = 10;
  
  let x = d3.scaleLinear()
    .domain([0, 45])
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
    .text("Відсоток");
  
  // Add Y axis
  let y = d3.scaleLog()
    .domain([5500, d3.max(data, d => Math.max(1, d.income))]) // Ensure domain doesn't start at 0 for log scale
    .range([height - padding, padding]);
  svg.append("g")
    .call(d3.axisLeft(y)
      .tickValues([5000, 10000, 20000, 30000, 40000, 50000, 100000, 200000, 300000, 400000, 500000, 1000000])
      .tickFormat(d => d3.format("")(d / 1000)) // Divide by 1000 before formatting
    )
    .attr("class", "y-ticks")
    .select(".domain").remove(); // Remove the y-axis line
  
  // Add Y axis label
  svg.append("text")
    .attr("class", "y-axis-label") // Add the class
    .attr("text-anchor", "start") // this makes it easy to centre the text as the transform is applied to the anchor
    .attr("transform", "translate(" + (margin.left - padding - 50) + "," + (padding - 15) + ")") // text is drawn off the screen top left, move down and out and rotate
    .text("ЗП, \n тис. грн");

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

  // Add the chart line
  svg
    .append("path")
    .datum(data) // Use the filtered data
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.rate) })
      .y(function(d) { return y(d.income) })
      )
    .style("stroke", "#675230");

  // This allows to find the closest X index of the mouse:
  let bisect = d3.bisector(function(d) { return d.income; }).left;
    
  // Create a rect on top of the svg area: this rectangle recovers mouse position
  let svgElement = svg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width)
    .attr('height', height)
    .on('mousemove', mousemove)
    .on('touchmove', mousemove);

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
      .attr('r', 7)
      .style("opacity", 10) // initial visibility
      .attr("cx", x(data[0].rate))
      .attr("cy", y(data[0].income))
      .attr("class", "pointer");

  let infoGroup = svg.append('g')
    .attr("class", "info-group")
    .attr("style", "visibility: hidden");

  let infoCircle = infoGroup
    .append('circle')
    .style("fill", "#ED2238")
    .attr('r', 7)
    .attr("cx", 68)
    .attr("cy", 14);
  
  let infoText = infoGroup
    .append('text')
    .attr("x", 68)
    .attr("y", 14)
    .attr("dy", ".35em")
    .text("i")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .style("font-family", "Georgia")
    .style("font-size", "10px")
    .style("pointer-events", "none");

    tippy('.info-group', {
      content: '<div style="font-family: Inter; font-size: 14px; padding: 7px;">Тут враховані: <br>- податок на доходи фізичних осіб (ПДФО) — 18% зарплати, платить працівник; <br>- військовий збір — 1,5% зарплати, платить працівник; <br>- єдиний соціальний внесок (ЄСВ) — 22% зарплати, платить роботодавець.</div>',
      allowHTML: true,
    });

  let pfdoCaption = svg
  .append('g')
  .append('text')
    .style("opacity", 1)
    .style("pointer-events", "none")
    .attr("text-anchor", "start") // Align the text to the end, so it aligns to the right
    .attr("alignment-baseline", "middle")
    .attr("x", 10) // Position at the right edge of the SVG
    .attr("y", height - 50); // Position at the top of the SVG

  pfdoCaption
    .append('tspan')
    .attr('x', 10)
    .text("*Розраховано податок на")
    .attr("class", "caption-text");

  pfdoCaption
    .append('tspan')
    .attr('x', 10)
    .text("доходи фізичних осіб (ПДФО)")
    .attr('dy', '12.5')
    .attr("class", "caption-text");
  
  pfdoCaption
  .append('tspan')
  .attr('x', 10)
  .text("і податок, який платить")
  .attr('dy', '12.5')
  .attr("class", "caption-text");

  pfdoCaption
  .append('tspan')
  .attr('x', 10)
  .text("роботодавець")
  .attr('dy', '12.5')
  .attr("class", "caption-text");

  // Create the text that travels along the curve of chart
  let focusText = svg
  .append('g')
  .append('text')
    .style("opacity", 1)
    .style("pointer-events", "none")
    .attr("text-anchor", "end") // Align the text to the end, so it aligns to the right
    .attr("alignment-baseline", "middle")
    .attr("x", width - 25) // Position at the right edge of the SVG
    .attr("y", 20); // Position at the top of the SVG 

  let limitReached = svg
  .append('g')
  .append('text')
    .style("opacity", 0)
    .attr("class", "limit-hover")
    .attr("text-anchor", "start") // Align the text to the end, so it aligns to the right
    .attr("alignment-baseline", "middle")
    .attr("x", 7.5) // Position at the right edge of the SVG
    .attr("y", height-12.5) // Position at the top of the SVG
    .text("Річний ліміт вичерпано")
    .style("pointer-events", "none");

  function mousemove() {
    // recover coordinate we need
    let mouseY = d3.mouse(this)[1];
    let y0 = y.invert(mouseY);
    
    let i = bisect(data, y0, 1);
    let selectedData = data[i]

    // If the mouse is within 10 pixels from the top, select the maximum value
    if (mouseY < 10) {
      selectedData = data[data.length - 1];
    }
    
    // Update the position of the pointers on all graphs
    graphs.forEach(graph => {
      
      let i = graph.bisect(graph.data, selectedData.income, 1);

      if (selectedData.income * 12 > graph.limit) {
        i = graph.bisect(graph.data, graph.limit / 12, 1) - 1;

        graph.limitReached
          .style("opacity", 1);

      } else {
        graph.limitReached
          .style("opacity", 0);
      }

      let selectedDataForGraph = graph.data[i];
      
      graph.focus
        .attr("cx", graph.x(selectedDataForGraph.rate))
        .attr("cy", graph.y(selectedDataForGraph.income));
        
      graph.focusText
        .text('')
        .append('tspan')
        .attr('x', 220)
        .text("Зарплата: ")
        .attr("class", "suma-text");
      
      graph.focusText
        .append('tspan')
        .text(selectedDataForGraph.income + " грн")
        .attr("class", "suma-numbers");
      
      graph.focusText
        .append('tspan')
        .attr('x', 220)
        .attr('dy', '15')
        .text("Податок: ")
        .attr("class", "podatok-text tooltip");
      
      graph.focusText
        .append('tspan')
        .attr("class", "podatok-numbers")
        .text(selectedDataForGraph.rate.toString().replace(/\./, ',') + "% /")
        .attr('dy', '0px');
    
      graph.focusText
        .append('tspan')
        .attr("class", "podatok-numbers-hrn")
        .text(" " + selectedDataForGraph.sum + " грн");
      
      graph.focusText
        .append('tspan')
        .attr('x', 220)
        .attr("class", "podatok-numbers-hrn-break")
        .text(" " + selectedDataForGraph.sum + " грн")
        .attr('dy', '15px');

      graph.focusText
        .append('tspan')
        .attr('x', 220)
        .attr('dy', '15')
        .text("На руки: ")
        .attr("class", "naruky-text");
      
      graph.focusText
        .append('tspan')
        .attr("class", "naruky-numbers")
        .text(selectedDataForGraph.naRuky + " грн")
        .attr('dy', '0px');


      graph.verticalLine
        .attr("x1", graph.x(selectedDataForGraph.rate))
        .attr("y1", 0)
        .attr("x2", graph.x(selectedDataForGraph.rate))
        .attr("y2", height)
        .attr("class", "vertical-line");

      graph.horizontalLine
        .attr("x1", 0)
        .attr("y1", graph.y(selectedDataForGraph.income))
        .attr("x2", width)
        .attr("y2", graph.y(selectedDataForGraph.income))
        .attr("class", "horizontal-line");

      // Hide the limit message
      let limitMessages = document.querySelectorAll('.limit-message');
      limitMessages.forEach(message => {
        message.style.display = 'none';
        message.onmousemove = function() {
          this.style.display = 'none';
        };
      });

    });
    
  }
  
  return { data, focus, focusText, verticalLine, horizontalLine, x, y, bisect, svg, limit, limitReached };

}

function updateGraph(graph, newData) {
  // Update the data
  graph.data = newData;
}

function movePointerToY(yValue) {
  
  graphs.forEach(graph => {

    let i = graph.bisect(graph.data, yValue, 1);
    let selectedDataForGraph = graph.data[i];

    graph.limitReached
      .style("opacity", 0);

    graph.focus
      .attr("cx", graph.x(selectedDataForGraph.rate))
      .attr("cy", graph.y(yValue));

    graph.focusText
      .text('')
      .append('tspan')
      .attr('x', 220)
      .text("Зарплата: ")
      .attr("class", "suma-text");
    
    graph.focusText
      .append('tspan')
      .text(selectedDataForGraph.income + " грн")
      .attr("class", "suma-numbers");
    
    graph.focusText
      .append('tspan')
      .attr('x', 220)
      .attr('dy', '15')
      .text("Податок: ")
      .attr("class", "podatok-text tooltip");
    
    graph.focusText
      .append('tspan')
      .attr("class", "podatok-numbers")
      .text(selectedDataForGraph.rate.toString().replace(/\./, ',') + "% /")
      .attr('dy', '0px');
  
    graph.focusText
      .append('tspan')
      .attr("class", "podatok-numbers-hrn")
      .text(" " + selectedDataForGraph.sum + " грн");
    
    graph.focusText
      .append('tspan')
      .attr('x', 220)
      .attr("class", "podatok-numbers-hrn-break")
      .text(" " + selectedDataForGraph.sum + " грн")
      .attr('dy', '15px');

    graph.focusText
      .append('tspan')
      .attr('x', 220)
      .attr('dy', '15')
      .text("На руки: ")
      .attr("class", "naruky-text");
    
    graph.focusText
      .append('tspan')
      .attr("class", "naruky-numbers")
      .text(selectedDataForGraph.naRuky + " грн")
      .attr('dy', '0px');

    graph.verticalLine
      .attr("x1", graph.x(selectedDataForGraph.rate))
      .attr("y1", 0)
      .attr("x2", graph.x(selectedDataForGraph.rate))
      .attr("y2", 230);

    graph.horizontalLine
      .attr("x1", 0)
      .attr("y1", graph.y(yValue))
      .attr("x2", 230)
      .attr("y2", graph.y(yValue));
      
  });
}

function handleSubmit(event) {
  event.preventDefault();
  let income_i = parseInt(document.getElementById('incomeInput').value);

  // Calculate the annual income
  let annualIncome = income_i * 12;
  
  const LIMITS = {
    "fop1": 1118900,
    "fop2": 5587800,
    "fop3": 7818900,
    "pdfo": null,
    "diia": 9348240
  };

  // Check the annual income against the limits and show/hide the limit message
  for (let graphId in LIMITS) {
    let limit = LIMITS[graphId];
    let limitMessage = document.querySelector('#' + graphId + ' .limit-message');
    
    if (limit !== null && annualIncome > limit) {
      limitMessage.style.display = 'flex';
    } else {
      limitMessage.style.display = 'none';
    }
  }

  let result1 = taxesCalculator(income_i, '1');
  let result2 = taxesCalculator(income_i, '2');
  let result3 = taxesCalculator(income_i, '3');
  let result4 = taxesCalculator(income_i, 'pdfo');
  let result5 = taxesCalculator(income_i, 'diia');

  data1.push({rate: (result1.rate * 100).toFixed(2), income: i, sum: (result1.sum).toFixed(0), naRuky: (result1.naRuky).toFixed(0)});
  data2.push({rate: (result2.rate * 100).toFixed(2), income: i, sum: (result2.sum).toFixed(0), naRuky: (result2.naRuky).toFixed(0)});
  data3.push({rate: (result3.rate * 100).toFixed(2), income: i, sum: (result3.sum).toFixed(0), naRuky: (result3.naRuky).toFixed(0)});
  data4.push({rate: (result4.rate * 100).toFixed(2), income: i, sum: (result4.sum).toFixed(0), naRuky: (result4.naRuky).toFixed(0)});
  data5.push({rate: (result5.rate * 100).toFixed(2), income: i, sum: (result5.sum).toFixed(0), naRuky: (result5.naRuky).toFixed(0)});

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
  createGraph(data1, "ФОП 1-ї групи", "#fop1", 1185700),
  createGraph(data2, "ФОП 2-ї групи", "#fop2", 5921400),
  createGraph(data3, "ФОП 3-ї групи", "#fop3", 8285700),
  createGraph(data4, "Зарплата", "#pdfo", 12000000),
  createGraph(data5, "ДІЯ.City", "#diia", 10079040)
];

// Set the default pointer value on page load
window.addEventListener('load', function() {
  // Set the value of the input field
  document.getElementById('incomeInput').value = '10000';

  // Call the handleSubmit function with a mock event object
  handleSubmit({ preventDefault: function(){} });

  document.getElementById('incomeInput').value = '';
});
