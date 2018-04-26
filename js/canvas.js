function removeByTag(tag_name) {
  var elements = document.getElementsByTagName(tag_name);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}


function redraw() {
  // Remove existing sketch
  removeByTag('svg')

  var canvas_w = window.innerWidth - 500;
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

  // Get selected setup values
  var wave_climate_name = document.getElementById('setupWaveClimate').value
  for (var i = 0; i < config.wave_climates.length; i++) {
    if (config.wave_climates[i].name === wave_climate_name) {
      var Hs_proto = config.wave_climates[i].Hs;
      var Tp_proto = config.wave_climates[i].Tp;
      var WL_proto = config.wave_climates[i].WL;
    }
  }

  var lyt_id = document.getElementById('setupLayout').value
  for (var i = 0; i < config.layouts.length; i++) {
    if (config.layouts[i].id === lyt_id) {
      var instruments = config.layouts[i].instruments;
    }
  }

  var base_elev_model = config.base_elevation / config.scale;
  var WL_model = WL_proto / config.scale;
  var Hs_model = Hs_proto / config.scale;
  var Tp_model = Tp_proto / config.scale ** (1 / 2);



  var bathy = config.bathy;

  var bathy_x_values = bathy.map(function(elt) {
    return elt[0];
  });
  var bathy_y_values = bathy.map(function(elt) {
    return elt[1];
  });

  var x_max = bathy_x_values[bathy_x_values.length - 1];
  var water = [
    [0, 0],
    [0, WL_model - base_elev_model],
    [x_max, WL_model - base_elev_model],
    [x_max, 0],
  ];

  var bathy_x_min = Math.min.apply(null, bathy_x_values);
  var bathy_x_max = Math.max.apply(null, bathy_x_values);
  var bathy_y_min = Math.min.apply(null, bathy_y_values);
  var bathy_y_max = Math.max.apply(null, bathy_y_values);

  // Set wave direction
  var rtl = document.getElementById('rtl').checked;

  var model_w = bathy_x_max;
  var model_h = bathy_y_max;

  // Scale model to fit canvas
  var vertical_exaggeration = 4
  var x_scale = canvas_w / model_w;
  var y_scale = canvas_h / model_h / vertical_exaggeration;

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
    // .attr("id", "bathy")
    .attr("points", toSvgUnits(bathy));

  // Get depths of instruments
  for (var i = 0; i < instruments.length; i++) {
    var y_model = instruments[i].proto_elev / config.scale - base_elev_model + WL_model;
    var elev_model = instruments[i].proto_elev / config.scale;
    var mf_spacing = mansardFunkeSpacing(Tp_model, y_model);
    var x_p1 = bathyInterp(config.bathy, y_model);

    // Draw dimension line
    var dim_y = WL_model - base_elev_model;

    var dim_pts = [
      [x_p1, dim_y + 0.8],
      [x_p1 + mf_spacing.x_13, dim_y + 0.8],
    ];
    drawDimLine(dim_pts, "x_13: ");

    var dim_pts = [
      [x_p1, dim_y + 0.4],
      [x_p1 + mf_spacing.x_12, dim_y + 0.4],
    ];
    drawDimLine(dim_pts, "x_12: ");
  }


  function drawDimLine(dim_pts, prefix) {
    var dim_label_pts = [
      [(dim_pts[0][0] + dim_pts[1][0]) / 2, dim_pts[0][1]],
    ];

    var dim_value = Math.abs(dim_pts[0][0] - dim_pts[1][0]);
    dim_value = Math.round(dim_value * 1000) / 1000;

    // Draw dimension line
    canvas.append("polyline")
      .style("stroke", "black")
      .attr("marker-start", "url(#arrow-start)")
      .attr("marker-end", "url(#arrow-end)")
      .attr("points", toSvgUnits(dim_pts));

    // Draw dimension text
    if (rtl) {
      var text_anchor = "start";
      var text_dx = 20;
    } else {
      var text_anchor = "end";
      var text_dx = -20;
    }
    canvas.append("text")
      .attr("x", toSvgUnits(dim_pts)[0][0] + text_dx)
      .attr("y", toSvgUnits(dim_pts)[0][1])
      // .attr("paint-order", "stroke")
      // .attr("stroke-width", "20px")
      // .attr("stroke", "#ffffff")
      .attr("text-anchor", text_anchor)
      .attr("alignment-baseline", "middle")
      .text(prefix + dim_value + " m ");
  }

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
}

redraw()
