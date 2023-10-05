const w = 650;
const h = 400;
const paddingY = 20;
const paddingL = 48;
const paddingR = 20;
const msInDay = 1000 * 60 * 60 * 24;

function daysInQuarter(date) {
  const next = new Date(date.toString());
  next.setMonth(next.getMonth() + 3);
  return (next - date) / msInDay;
}
function getTooltipHTML([date, gdp]) {
  return (
    "<strong>" +
    date.getFullYear() +
    ", Q" +
    (Math.ceil(date.getMonth() / 4) + 1) +
    "</strong><br />$" +
    gdp.toString().replace(/(\d)(?=((\d{3})+\.)|((\d{3})+$))/g, "$1,") +
    " Billion"
  );
}

d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then(data => {
    const chart = d3.select("#container");
    const info = data.data;
    const infoWithDateObj = info.map(arr => [new Date(arr[0]), arr[1]]);
    const maxGDP = d3.max(info, d => d[1]);

    const toDate = new Date(data["to_date"]);
    toDate.setMonth(toDate.getMonth() + 3);
    const fromDate = new Date(data["from_date"]);
    const durationInDays = (toDate - fromDate) / msInDay;

    chart
      .append("h1")
      .text("US Gross Domestic Product(GDP)")
      .attr("id", "title");

    const svg = chart
      .append("svg")
      .attr("width", w + paddingL + paddingR)
      .attr("height", h)
      .attr("id", "vis-container")
      .style("background-color", "#fff");

    const xScale = d3
      .scaleTime()
      .domain([fromDate, toDate])
      .range([paddingL, w + paddingL]);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxGDP])
      .range([paddingY, h - paddingY])
      .nice();

    const yAxisScale = d3
      .scaleLinear()
      .domain([0, maxGDP])
      .range([h - paddingY, paddingY])
      .nice();

    const rainbow = d3.scaleSequential(
      t => `${d3.hsl(t * 160 + 120, 1, 0.69)}`
    );

    const tooltip = chart
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

    svg
      .selectAll("rect")
      .data(infoWithDateObj)
      .enter()
      .append("rect")
      .attr("id", (d, i) => `bar-${i}`)
      .attr("x", d => xScale(d[0]))
      .attr("y", d => h - yScale(d[1]))
      .attr("width", d => (daysInQuarter(d[0]) * w) / durationInDays)
      .attr("height", d => yScale(d[1]) - paddingY)
      .attr("class", "bar")
      .style("fill", (d, i) => rainbow(i / info.length))
      .attr("data-date", (d, i) => info[i][0])
      .attr("data-gdp", d => d[1])
      .on("mouseover", (d, i) => {
        tooltip
          .html(getTooltipHTML(d))
          .style("left", d3.event.target.x.baseVal.value + paddingL + 4 + "px")
          .style("top", d3.event.target.y.baseVal.value + 80 + "px")
          .attr("data-date", info[i][0])
          .transition()
          .duration(100)
          .delay(20)
          .style("opacity", .9);
      })
      .on("mouseout", () => {
        tooltip
          .style("left", 0)
          .style("top", 0)
          .transition()
          .duration(0)
          .style("opacity", 0);
      });

    const xAxis = d3.axisBottom().scale(xScale);
    svg
      .append("g")
      .call(xAxis)
      .attr("transform", `translate(0, ${h - paddingY})`)
      .attr("id", "x-axis");

    const yAxis = d3.axisLeft().scale(yAxisScale);
    svg
      .append("g")
      .call(yAxis)
      .attr("transform", `translate(${paddingL}, 0)`)
      .attr("id", "y-axis");
    svg
      .append("text")
      .text("GDP value, Billions of USD$")
      .attr("transform", "rotate(-90) translate(-100, 0)")
      .attr("x", -h / 2)
      .attr("y", paddingL + paddingR);
  })
  .catch(e => console.error(e));