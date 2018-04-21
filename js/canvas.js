function removeByTag(tag_name) {
  var elements = document.getElementsByTagName(tag_name);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}


function redraw() {
  // Remove existing sketch
  removeByTag('svg')

  var canvas_w = window.innerWidth - 300;
  var canvas_h = canvas_w * 0.3;

  // Create canvas
  var canvas = d3.select("#canvas").append("svg")
    .attr("id", "canvas")
    .attr("width", canvas_w)
    .attr("height", canvas_h);

  // Define arrow
  canvas.append("svg:defs").append("svg:marker")
    .attr("id", "arrow-start")
    .attr("refX", 6)
    .attr("refY", 6)
    .attr("markerWidth", 30)
    .attr("markerHeight", 30)
    .attr("markerUnits", "userSpaceOnUse")
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 12 0 0 6 12 12 9 6")
    .style("fill", "black");

  canvas.append("svg:defs").append("svg:marker")
    .attr("id", "arrow-end")
    .attr("refX", 6)
    .attr("refY", 6)
    .attr("markerWidth", 30)
    .attr("markerHeight", 30)
    .attr("markerUnits", "userSpaceOnUse")
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 12 6 0 12 3 6")
    .style("fill", "black");

  var water = [
    [0, 0],
    [0, 600],
    [30000, 600],
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
  var vertical_exaggeration = 4
  var x_scale = canvas_w / model_w;
  var y_scale = canvas_h / model_h / vertical_exaggeration;

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

  function drawDimLine(dim_pts) {
    var dim_label_pts = [
      [(dim_pts[0][0] + dim_pts[1][0]) / 2, dim_pts[0][1]],
    ]

    var dim_value = Math.abs(dim_pts[0][0] - dim_pts[1][0])

    // Draw dimension line
    canvas.append("polyline")
      .style("stroke", "black")
      .attr("marker-start", "url(#arrow-start)")
      .attr("marker-end", "url(#arrow-end)")
      .attr("points", toSvgUnits(dim_pts));

    // Draw dimension text
    canvas.append("text")
      .attr("x", toSvgUnits(dim_label_pts)[0][0])
      .attr("y", toSvgUnits(dim_label_pts)[0][1])
      .attr("paint-order", "stroke")
      .attr("stroke-width", "20px")
      .attr("stroke", "#ffffff")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "20")
      .text(dim_value + " mm");
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
    [10000, 1000],
    [20000, 1000],
  ];

  drawDimLine(dim_pts)


}

redraw()
