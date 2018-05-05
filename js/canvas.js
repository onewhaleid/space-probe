function removeByTag(tag_name) {
  var elements = document.getElementsByTagName(tag_name);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}


function redraw() {
  // Remove existing sketch
  removeByTag('svg')

  var canvas_w = window.innerWidth - 400;
  var canvas_h = canvas_w * 0.2;

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

  // Define probe housing
  canvas.append("svg:defs").append("svg:marker")
    .attr("id", "box")
    .attr("refX", 6)
    .attr("refY", 6)
    .attr("markerWidth", 30)
    .attr("markerHeight", 30)
    .attr("markerUnits", "userSpaceOnUse")
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 0 12 18 12 18 0")
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
  var vertical_exaggeration = 2;
  var x_scale = canvas_w / model_w;
  var y_scale = x_scale * vertical_exaggeration;

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
    var d_model = -instruments[i].proto_elev / config.scale + WL_model;
    var elev_model = instruments[i].proto_elev / config.scale;
    var mf_spacing = mansardFunkeSpacing(Tp_model, d_model);
    var x_p1 = bathyInterp(config.bathy, y_model);
    var x_p2 = x_p1 + mf_spacing.x_12;
    var x_p3 = x_p1 + mf_spacing.x_13;

    // Draw dimension line
    var dim_y = WL_model - base_elev_model;

    // Draw probes
    var p_top = dim_y + 30 / y_scale;
    var p_bottom = Math.max(dim_y - 0.6, y_model + 10 / y_scale);
    var p_x = [x_p1, x_p2, x_p3];

    for (var j = 0; j < p_x.length; j++) {
      var probe_pts = [
        [p_x[j], p_top],
        [p_x[j], p_bottom]
      ];
      canvas.append("polyline")
        .style("stroke", "black")
        .attr("marker-start", "url(#box)")
        .attr("points", toSvgUnits(probe_pts));
    }

    console.log(instruments[i].location)
    // Label locations
    canvas.append("text")
      .attr("x", toSvgUnits([
        [x_p2]
      ])[0][0])
      .attr("y", toSvgUnits([
        [0, dim_y + 160 / y_scale]
      ])[0][1])
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .text(instruments[i].location);

    // Draw probe spacing
    var dim_pts = [
      [x_p1, dim_y + 80 / y_scale],
      [x_p1 + mf_spacing.x_13, dim_y + 80 / y_scale],
    ];
    drawDimLine(dim_pts, "X₁₃: \u00A0\u00A0", offshore=true);

    var dim_pts = [
      [x_p1, dim_y + 120 / y_scale],
      [x_p1 + mf_spacing.x_12, dim_y + 120 / y_scale],
    ];
    drawDimLine(dim_pts, "X₁₂: \u00A0\u00A0", offshore=true);

  }


  function drawDimLine(dim_pts, prefix, offshore) {
    var dim_label_pts = [
      [(dim_pts[0][0] + dim_pts[1][0]) / 2, dim_pts[0][1]],
    ];

    var dim_value = Math.abs(dim_pts[0][0] - dim_pts[1][0]);

    // Draw dimension line
    canvas.append("polyline")
      .style("stroke", "black")
      .attr("marker-start", "url(#arrow-start)")
      .attr("marker-end", "url(#arrow-end)")
      .attr("points", toSvgUnits(dim_pts));

    // Draw dimension text
    if (rtl === offshore) {
      var text_anchor = "start";
      var text_dx = 20;
    } else {
      var text_anchor = "end";
      var text_dx = -20;
    }

    if (!offshore) {
      text_dx *= -1;
    }


    canvas.append("text")
      .attr("x", toSvgUnits(dim_pts)[0][0] + text_dx)
      .attr("y", toSvgUnits(dim_pts)[0][1])
      .attr("text-anchor", text_anchor)
      .attr("alignment-baseline", "middle")
      .text(prefix + dim_value.toFixed(3) + " m ");
  }

  function toSvgUnits(pts_raw) {
    var pts = [];
    for (var i = 0; i < pts_raw.length; i++) {
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
