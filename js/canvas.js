function removeByTag(tag_name) {
  var elements = document.getElementsByTagName(tag_name);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function redraw() {
  removeByTag('svg')

  var canvas_w = window.innerWidth - 50;
  var canvas_h = canvas_w * 0.3;

  // Create canvas
  var canvas = d3.select("#canvas").append("svg")
    .attr("id", "canvas")
    .attr("width", canvas_w)
    .attr("height", canvas_h);

  var water = [
    [0, 0],
    [0, 1000],
    [30000, 1000],
    [30000, 0],
  ];

  var bathy = config.bathy;

  var bathy_x_values = bathy.map(function(elt) {
    return elt[0];
  });
  var bathy_y_values = bathy.map(function(elt) {
    return elt[1];
  });

  var bathy_x_min = Math.min.apply(null, bathy_x_values);
  var bathy_x_max = Math.max.apply(null, bathy_x_values);
  var bathy_y_min = Math.min.apply(null, bathy_y_values);
  var bathy_y_max = Math.max.apply(null, bathy_y_values);

  // Set wave direction
  var rtl = false;

  var model_w = bathy_x_max;
  var model_h = bathy_y_max;

  // Scale model to fit canvas
  var x_scale = canvas_w / model_w;
  var y_scale = canvas_h / model_h / 2;

  function toSvgUnits(pts_raw) {
    var pts = [];
    for (i = 0; i < pts_raw.length; i++) {
      // Flip x coordinate if required
      x = rtl * canvas_w - (rtl * 2 - 1) * pts_raw[i][0] * x_scale;
      // Invert y coordinate to fit SVG canvas
      y = canvas_h - pts_raw[i][1] * y_scale;
      pts.push([x, y]);
    }
    return pts;
  }

  // Draw water
  canvas.append("polyline")
    .style("stroke", "none")
    .style("fill", "#8198e0")
    .attr("id", "water")
    .attr("points", toSvgUnits(water));

  // Draw bathy
  canvas.append("polyline")
    .style("stroke", "black")
    .style("fill", "#cccccc")
    .attr("id", "bathy")
    .attr("points", toSvgUnits(bathy));

  // Draw dimension line
  var dim_pts = [
    [0, 400],
    [20000, 400],
  ];
  canvas.append("polyline")
    .style("stroke", "black")
    .attr("marker-end", "url(#arrow)")
    .attr("points", toSvgUnits(dim_pts));
  //
  // // Update data
  // var pts = [
  //   [0, 0],
  //   [0, 100],
  //   [40000, 100],
  //   [40000, 0],
  // ]
  //
  // d3.select("#water").attr("points", toSvgUnits(pts))
}

redraw()
