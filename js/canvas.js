var canvas_h = 200;
var canvas_w = 800;

var canvas = d3.select("body").append("svg")
  .attr("width", canvas_w)
  .attr("height", canvas_h);


var coords = [
  [0, 0],
  [5000, 0],
  [7500, 250],
  [25000, 400],
  [30000, 400],
  [30000, 0],
  [0, 0],
];

// Set wave direction
var rtl = false;

var model_w = 30000;
var model_h = 1500;

// Scale model to fit canvas
var x_scale = canvas_w / model_w;
var y_scale = canvas_h / model_h;

function toSvgUnits(x) {
  for (i = 0; i < x.length; i++) {
    // Flip x coordinate if required
    x[i][0] = rtl * canvas_w - (rtl - 0.5).toFixed() * x[i][0] * x_scale;
    // Invert y coordinate to fit SVG canvas
    x[i][1] = canvas_h - x[i][1] * y_scale;
  }
  return x
}

canvas.append("polyline")
  .style("stroke", "black")
  .style("fill", "#cccccc")
  .attr("points", toSvgUnits(coords));
