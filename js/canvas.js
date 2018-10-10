function removeByTag(tag_name) {
  var elements = document.getElementsByTagName(tag_name);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function getCurrentLayout() {
  var current_layout_id = document.getElementById("setupLayout").value;
  var layouts = config.layouts;
  for (var i = 0; i < layouts.length; i++) {
    if (layouts[i].id === current_layout_id) {
      current_layout = layouts[i];
      break;
    }
  }
  return current_layout;
}

function getCurrentWaveClimate() {
  var current_wave_climate_id = document.getElementById("setupWaveClimate").value;
  var wave_climates = config.wave_climates;
  for (var i = 0; i < wave_climates.length; i++) {
    if (wave_climates[i].name === current_wave_climate_id) {
      current_wave_climate = wave_climates[i];
      break;
    }
  }
  return current_wave_climate;
}


function redraw() {
  // Remove existing sketch
  removeByTag('svg')

  var canvas_w = window.innerWidth * 0.6;
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

  // Get current layout and wave climate
  current_layout = getCurrentLayout();
  current_wave_climate = getCurrentWaveClimate();

  // Get selected setup values
  var Hs_proto = current_wave_climate.Hs;
  var Tp_proto = current_wave_climate.Tp;
  var WL_proto = current_wave_climate.WL;
  var instruments = current_layout.instruments;

  var base_elev_model = config.base_elevation / config.scale;
  var WL_model = WL_proto / config.scale;
  var Hs_model = Hs_proto / config.scale;
  var Tp_model = Tp_proto / config.scale ** (1 / 2);

  var bathy = config.bathy;

  // Get origin
  var x0 = bathy[0][0];
  var y0 = bathy[0][1];

  var bathy_x_values = bathy.map(function(elt) {
    return elt[0] - x0;
  });
  var bathy_y_values = bathy.map(function(elt) {
    return elt[1] - y0;
  });

  var x_max = bathy_x_values[bathy_x_values.length - 1];

  // Append additional point at base of bathy
  if (bathy_y_values[bathy_y_values.length - 1] !== 0) {
    bathy_x_values.push(x_max);
    bathy_y_values.push(0);
  }

  // Update bathy values
  bathy = [];
  for (var i = 0; i < bathy_x_values.length; i++) {
    bathy.push([bathy_x_values[i], bathy_y_values[i]]);
  }

  // Update bathy definition in config
  config.bathy = bathy;

  var water = [
    [0, 0],
    [0, WL_model - base_elev_model],
    [x_max, WL_model - base_elev_model],
    [x_max, 0],
  ];

  // Create wavey water surface

  var bathy_x_min = Math.min.apply(null, bathy_x_values);
  var bathy_x_max = Math.max.apply(null, bathy_x_values);
  var bathy_y_min = Math.min.apply(null, bathy_y_values);
  var bathy_y_max = Math.max.apply(null, bathy_y_values);

  // Set wave direction
  var rtl = config.rtl;

  var model_w = bathy_x_max;
  var model_h = bathy_y_max;

  // Scale model to fit canvas
  var vertical_scale = config.v_scale;
  var x_scale = canvas_w / model_w;
  var y_scale = x_scale * vertical_scale;

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
    var y_model = instruments[i].proto_elev / config.scale - base_elev_model;
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
    drawDimLine(dim_pts, "X₁₃: \u00A0\u00A0", offshore = true);

    var dim_pts = [
      [x_p1, dim_y + 120 / y_scale],
      [x_p1 + mf_spacing.x_12, dim_y + 120 / y_scale],
    ];
    drawDimLine(dim_pts, "X₁₂: \u00A0\u00A0", offshore = true);

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

  function createTable() {
    // Remove content from existing table
    document.getElementById("probeTable").innerHTML = "";
    var table = document.getElementById("probeTable");

    // Add header
    var newRow = table.insertRow();
    newRow.className = "bordered";
    newRow.insertCell().textContent = "Layout";
    newRow.insertCell().textContent = "Wave climate";
    newRow.insertCell().textContent = "Location";
    newRow.insertCell().textContent = "x12 (m)";
    newRow.insertCell().textContent = "x13 (m)";

    var layouts = config.layouts;
    var wave_climates = config.wave_climates;
    for (var i = 0; i < layouts.length; i++) {
      var instruments = layouts[i].instruments;
      for (var j = 0; j < wave_climates.length; j++) {
        for (var k = 0; k < instruments.length; k++) {
          var newRow = table.insertRow();
          if (k === 0) {
            newRow.insertCell().textContent = layouts[i].name;
          } else {
            newRow.insertCell().textContent = "";
          }
          if (k === 0) {
            newRow.insertCell().textContent = wave_climates[j].name;
          } else {
            newRow.insertCell().textContent = "";
          }
          newRow.insertCell().textContent = instruments[k].location;

          // Calculate probe spacing
          var d_proto = wave_climates[j].WL - instruments[k].proto_elev;
          var Tp_proto = wave_climates[j].Tp;
          var d_model = d_proto / config.scale;
          var Tp_model = Tp_proto / config.scale ** (1 / 2);
          var mf_spacing = mansardFunkeSpacing(Tp_model, d_model);

          newRow.insertCell().textContent = mf_spacing.x_12;
          newRow.insertCell().textContent = mf_spacing.x_13;

          // Add empty row after each layout
          if (k === instruments.length - 1) {
            var newRow = table.insertRow();
            newRow.insertCell().textContent = "\u00A0";
          }
        }
      }
    }

    // Remove content from existing proto and model tables
    document.getElementById("protoTable").innerHTML = "";
    var proto_table = document.getElementById("protoTable");

    document.getElementById("modelTable").innerHTML = "";
    var model_table = document.getElementById("modelTable");

    function round(x, n) {
      return Math.round(x * 10 ** n) / 10 ** n
    }

    // Get current instruments
    var instruments = current_layout.instruments;
    var n = instruments.length;

    var proto_header_row = proto_table.insertRow();
    var proto_depth_row = proto_table.insertRow();
    var proto_hs_row = proto_table.insertRow();
    var proto_period_row = proto_table.insertRow();
    var proto_wavelength_row = proto_table.insertRow();
    proto_header_row.className = "bordered";

    var model_header_row = model_table.insertRow();
    var model_depth_row = model_table.insertRow();
    var model_hs_row = model_table.insertRow();
    var model_period_row = model_table.insertRow();
    var model_wavelength_row = model_table.insertRow();
    model_header_row.className = "bordered";

    proto_header_row.insertCell().innerHTML = "";
    proto_depth_row.insertCell().innerHTML = "Depth (m)";
    proto_hs_row.insertCell().innerHTML = "Hs (m)";
    proto_period_row.insertCell().innerHTML = "Tp (s)";
    proto_wavelength_row.insertCell().innerHTML = "Lp (m)";

    model_header_row.insertCell().innerHTML = "";
    model_depth_row.insertCell().innerHTML = "Depth (m)";
    model_hs_row.insertCell().innerHTML = "Hs (m)";
    model_period_row.insertCell().innerHTML = "Tp (s)";
    model_wavelength_row.insertCell().innerHTML = "Lp (m)";

    for (var i = 0; i < n; i++) {
      var length_scale = config.scale;
      var time_scale = config.scale ** (1 / 2);
      var proto_elev = instruments[i].proto_elev;
      var proto_WL = current_wave_climate.WL;
      var proto_Hs = current_wave_climate.Hs;
      var proto_Tp = current_wave_climate.Tp;

      var proto_d = proto_WL - proto_elev;

      proto_spacing = mansardFunkeSpacing(proto_Tp, proto_d)
      var proto_Lp = proto_spacing.Lp;

      proto_header_row.insertCell().innerHTML = instruments[i].location, 1;
      proto_depth_row.insertCell().innerHTML = round(proto_d, 1);
      proto_hs_row.insertCell().innerHTML = round(proto_Hs, 1);
      proto_period_row.insertCell().innerHTML = round(proto_Tp, 1);
      proto_wavelength_row.insertCell().innerHTML = round(proto_Lp, 1);

      model_header_row.insertCell().innerHTML = instruments[i].location;
      model_depth_row.insertCell().innerHTML = round(proto_d / length_scale, 3);
      model_hs_row.insertCell().innerHTML = round(proto_Hs / length_scale, 3);
      model_period_row.insertCell().innerHTML = round(proto_Tp / time_scale, 2);
      model_wavelength_row.insertCell().innerHTML = round(proto_Lp / length_scale, 1);
    }
  }

  createTable();
  resizeAccordions();

}

redraw();
