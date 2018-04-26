var config = {
  'project': 'wrl20xxxxx',
  'operator': 'DH',
  'scale': 10,
  'datum': 'AHD',
  'base_elevation': -12,
  'rtl': false,
  'bathy': [
    [0, 0],
    [5.000, 0],
    [7.500, 0.450],
    [25.000, 0.800],
    [30.000, 0.800],
    [30.000, 0],
  ],
  'layouts': [{
    'id': 'layout_0',
    'name': 'wave climate calibration',
    'instruments': [{
      'location': 'offshore',
      'proto_elev': -10,
    }, ],
  }, ],
  'wave_climates': [{
    'name': '1y ARI',
    'Hs': 2,
    'Tp': 12,
    'WL': 0,
  }, ]
}


// Add new instrument location
var new_instrument = {
  'location': 'structure',
  'proto_elev': -8,
}

config['layouts'][0]['instruments'].push(new_instrument)

// Download configuration
function download(obj, type) {
  var json_data = document.createElement("a");
  var file = new Blob([JSON.stringify(obj)], {
    type: type
  });
  json_data.href = URL.createObjectURL(file);
  json_data.download = 'config.json';
  json_data.click();
}

// Set up event listeners for base elevation and scale
document.getElementById('scale').addEventListener('input', function() {
  htmlToJson();
  updateUiElements();
});

document.getElementById('base_elevation').addEventListener('input', function() {
  htmlToJson();
  updateUiElements();
});


// Set up row id generator
var layout_id = 0;

// Add rows to table
function addLayout(layout_name, manual = false) {
  var table = document.getElementById('layoutsTable');
  var last_row = document.getElementById('layoutsLastRow');
  var row = document.createElement('tr');
  last_row.parentNode.insertBefore(row, last_row);

  row.id = 'layout_' + layout_id;
  row.className = 'layout';
  layout_id += 1;
  var layout = row.insertCell();
  var name_input = document.createElement('input');
  layout.appendChild(name_input);
  name_input.type = 'text';
  name_input.value = layout_name || row.id;
  name_input.addEventListener('input', function() {
    htmlToJson();
    updateUiElements();
  });

  // Add delete button
  var btn = row.insertCell();
  btn.innerHTML = "<button onclick='removeTableRow(this.parentNode.parentNode.id)'>-</button>";

  // Update select fields in instrument definitions
  updateUiElements();

  if (manual) {
    htmlToJson();
  };
}

// Set up row id generator
var wave_climate_id = 0;

// Add rows to wave climate table
function addWaveClimate(wave_climate_name, water_level = 0, Hs = 0, Tp = 0, manual = false) {
  var table = document.getElementById('waveClimatesTable');
  var last_row = document.getElementById('waveClimatesLastRow');
  var row = document.createElement('tr');
  last_row.parentNode.insertBefore(row, last_row);

  row.id = 'wave_climate_' + wave_climate_id;
  row.className = 'wave_climate';
  wave_climate_id += 1;
  var wave_climate = row.insertCell();
  var wave_climate_input = document.createElement('input');
  wave_climate.appendChild(wave_climate_input);
  wave_climate_input.type = 'text';
  wave_climate_input.value = wave_climate_name || row.id;
  wave_climate_input.addEventListener('input', function() {
    htmlToJson();
  });

  var water_level_input = document.createElement('input');
  row.insertCell().appendChild(water_level_input);
  water_level_input.type = 'text';
  water_level_input.value = water_level;
  water_level_input.size = 10;
  water_level_input.addEventListener('input', function() {
    htmlToJson();
  });

  var Hs_input = document.createElement('input');
  row.insertCell().appendChild(Hs_input);
  Hs_input.type = 'text';
  Hs_input.value = Hs;
  Hs_input.size = 2;
  Hs_input.addEventListener('input', function() {
    htmlToJson();
  });

  var Tp_input = document.createElement('input');
  row.insertCell().appendChild(Tp_input);
  Tp_input.type = 'text';
  Tp_input.value = Tp;
  Tp_input.size = 2;
  Tp_input.addEventListener('input', function() {
    htmlToJson();
  });

  // Add delete button
  var btn = row.insertCell();
  btn.innerHTML = "<button onclick='removeTableRow(this.parentNode.parentNode.id)'>-</button>";

  if (manual) {
    updateUiElements();
    htmlToJson();
  }
}

function createLayoutSelect(target_select, lyt_id) {
  // Get layout rows
  // var layouts = document.getElementsByClassName('layout');
  var layouts = config.layouts;
  target_select.innerHTML = '';
  for (var i = 0; i < layouts.length; i++) {
    var opt = document.createElement('option');
    opt.value = layouts[i].id;
    opt.innerHTML = layouts[i].name;
    target_select.appendChild(opt);
    if (lyt_id) {
      target_select.value = lyt_id;
    }
  }
}

function createWaveClimateSelect(target_select, wave_climate_name) {
  // Get layout rows
  // var layouts = document.getElementsByClassName('layout');
  var wave_climates = config.wave_climates;
  target_select.innerHTML = '';
  for (var i = 0; i < wave_climates.length; i++) {
    var opt = document.createElement('option');
    opt.value = wave_climates[i].name;
    opt.innerHTML = wave_climates[i].name;
    target_select.appendChild(opt);
    if (wave_climate_name) {
      target_select.value = wave_climate_name;
    }
  }
}


// Set up row id generator
var inst_id = 0

// Add rows to table
function addInstrument(location_name, l_id, elev = 0, manual = false) {
  var table = document.getElementById('instrumentsTable');
  var last_row = document.getElementById('instrumentsLastRow');
  var row = document.createElement('tr');
  last_row.parentNode.insertBefore(row, last_row);
  row.id = 'inst_' + inst_id;
  row.className = 'instrument';
  inst_id += 1;

  var layout = row.insertCell();
  var select = document.createElement('select');
  select.className = 'layoutSelect';
  layout.appendChild(select);
  select.addEventListener('input', function() {
    htmlToJson();
  });

  createLayoutSelect(select, l_id);

  var loc = row.insertCell();
  var location_input = document.createElement('input');
  loc.appendChild(location_input);
  location_input.type = 'text';
  location_input.value = location_name || row.id;
  location_input.addEventListener('input', function() {
    htmlToJson();
  });

  var elev_input = document.createElement('input');
  row.insertCell().appendChild(elev_input);
  elev_input.type = 'text';
  elev_input.value = elev;
  elev_input.size = 10;
  elev_input.addEventListener('input', function() {
    htmlToJson();
  });

  var btn = row.insertCell();
  btn.innerHTML = '<button onclick="removeTableRow(this.parentNode.parentNode.id)">-</button>';

  if (manual) {
    htmlToJson();
  }
}

// Add rows to table
function updateSetupOptions() {
  var select = document.getElementById('setupLayout');
  createLayoutSelect(select, config.layouts[0].id);

  var select = document.getElementById('setupWaveClimate');
  createWaveClimateSelect(select, config.wave_climates[0].name);
}


function updateUiElements() {
  // Check all layout selects are up to date
  var instruments = document.getElementsByClassName('instrument')
  for (var i = 0; i < instruments.length; i++) {
    var old_select = instruments[i].getElementsByClassName('layoutSelect')[0];
    var old_layout_id = old_select.value;
    createLayoutSelect(old_select);

    // Remember current value
    if (old_layout_id) {
      old_select.value = old_layout_id;
    }
  }

  updateSetupOptions()
}

function htmlToJson() {
  // Put input values into JSON config data
  config.project = document.getElementById('project').value;
  config.operator = document.getElementById('operator').value;
  config.scale = Number(document.getElementById('scale').value);
  config.base_elevation = document.getElementById('base_elevation').value;
  config.datum = document.getElementById('datum').value;
  config.rtl = document.getElementById('rtl').checked;

  // Get wave climate
  var wave_climates_json = [];
  var wave_climates = document.getElementsByClassName('wave_climate');
  for (var i = 0; i < wave_climates.length; i++) {
    var climate = {};
    climate.name = wave_climates[i].querySelector('td:nth-child(1) > input[type="text"]').value;
    climate.WL = Number(wave_climates[i].querySelector('td:nth-child(2) > input[type="text"]').value);
    climate.Hs = Number(wave_climates[i].querySelector('td:nth-child(3) > input[type="text"]').value);
    climate.Tp = Number(wave_climates[i].querySelector('td:nth-child(4) > input[type="text"]').value);
    wave_climates_json.push(climate);
  }
  config.wave_climates = wave_climates_json;

  // Get instrument data
  instruments_json = [];
  var instruments = document.getElementsByClassName('instrument');
  for (var i = 0; i < instruments.length; i++) {
    var instrument = {};
    instrument.layout_id = instruments[i].querySelector('td:nth-child(1) > select').value;
    instrument.location = instruments[i].querySelector('td:nth-child(2) > input[type="text"]').value;
    instrument.proto_elev = instruments[i].querySelector('td:nth-child(3) > input[type="text"]').value;
    instruments_json.push(instrument);
  }

  // Get layout data
  var layouts_json = [];
  var layouts = document.getElementsByClassName('layout');
  for (var i = 0; i < layouts.length; i++) {
    var layout = {};
    layout.name = layouts[i].querySelector('td:nth-child(1) > input[type="text"]').value;
    layout.id = layouts[i].id;
    layout.instruments = [];
    // Add instruments
    for (var j = 0; j < instruments_json.length; j++) {
      if (instruments_json[j].layout_id === layout.id) {
        layout.instruments.push(instruments_json[j]);
      }
    }
    layouts_json.push(layout);
  }
  config.layouts = layouts_json;

  updateSetupOptions()
  redraw()
}

function removeByClass(element_class) {
  var elements = document.getElementsByClassName(element_class);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

// Put config JSON data into html structure
function jsonToHtml() {
  document.getElementById('project').value = config.project;
  document.getElementById('operator').value = config.operator;
  document.getElementById('scale').value = config.scale;
  document.getElementById('base_elevation').value = config.base_elevation;
  document.getElementById('datum').value = config.datum;
  document.getElementById('rtl').checked = config.rtl;
  document.getElementById('swl').innerHTML = 'SWL (m ' + config.datum + '):';

  // Remove existing wave climates
  removeByClass('wave_climate');

  // Add new wave climates
  for (var i = 0; i < config.wave_climates.length; i++) {
    var w_climate = config.wave_climates[i];
    addWaveClimate(w_climate.name, w_climate.WL, w_climate.Hs, w_climate.Tp);
  }

  // Remove existing layouts and instruments
  removeByClass('layout');
  removeByClass('instrument');

  // Update layout data
  for (var i = 0; i < config.layouts.length; i++) {
    var lyt = config.layouts[i];
    addLayout(lyt.name);
    for (var j = 0; j < lyt.instruments.length; j++) {
      var inst = lyt.instruments[j];
      addInstrument(inst.location, lyt.id, inst.proto_elev);
    }
    console.log('HTML updated');
  }
  updateUiElements();
}

// Remove rows from table
function removeTableRow(id) {
  document.getElementById(id).remove();
  updateUiElements();
}

function bathyInterp(points, elev) {
  // Find segment to interpolate
  for (var i = 0; i < points.length-1; i++) {
    if (points[i + 1][1] >= elev) {
      break
    }
  }

  // Use last segment if elevation higher than bathy limit
  if (i === points.length-1) {
    i -= 1;
  }

  // Use first point if elevation lower than bathy limit
  if (elev < points[0][1]) {
    return points[0][0];
  }

  // Get segment endpoints
  x1 = points[i][0];
  x2 = points[i + 1][0];
  y1 = points[i][1];
  y2 = points[i + 1][1];

  forward = d3.scaleLinear()
    .domain([y1, y2])
    .range([x1, x2])(elev);
  backward = d3.scaleLinear()
    .domain([y2, y1])
    .range([x2, x1])(elev);

  return (forward + backward) / 2;
}

// Import existing JSON config data
function importJson() {
  var files = document.getElementById('selectJson').files;
  if (files.length <= 0) {
    return false;
  }
  var reader = new FileReader();
  reader.onload = function(f) {
    config = JSON.parse(f.target.result);
    jsonToHtml();
  }
  reader.readAsText(files.item(0));
};

// Import csv data
function importCsv() {
  var files = document.getElementById('selectCsv').files;
  if (files.length <= 0) {
    return false;
  }
  var reader = new FileReader();
  reader.onload = function(f) {
    var csv_string = f.target.result;
    document.getElementById('dataCsv').value = csv_string;
    var points = parseCsv(csv_string);
  }
  reader.readAsText(files.item(0));
};

// Parse csv
function parseCsv(csv_string) {
  var points = [];
  for (var i = 0; i < csv_string.length; i++) {
    var row = str[i].split(',');
    var x = parseFloat(row[0]);
    var y = parseFloat(row[1]);
    if (!isNaN(x) & !isNaN(y)) {
      points.push([x, y]);
    }
  }
  return points;
}

function mansardFunkeSpacing(T, d) {

  // Calculate wavelength
  var Lp = huntWavelength(T, d);

  var x = {};
  x.x_12 = Lp / 10;
  x.x_i1 = Lp / 5;
  x.x_i2 = Lp * 3 / 10;
  x.x_13 = (x.x_i1 + x.x_i2) / 2;

  x.x_12 = Math.round(x.x_12 * 1000) / 1000;
  x.x_13 = Math.round(x.x_13 * 1000) / 1000;
  x.x_i1 = Math.round(x.x_i1 * 1000) / 1000;
  x.x_i2 = Math.round(x.x_i2 * 1000) / 1000;

  return x;


  function huntWavelength(T, d) {

    var pi = Math.PI;
    var w = 2 * pi / T;
    var g = 9.8;

    var a1 = 0.666;
    var a2 = 0.355;
    var a3 = 0.1608465608;
    var a4 = 0.063209;
    var a5 = 0.0217540484;
    var a6 = 0.0065407983;

    var y = Math.pow(w, 2) * d / g;
    var y1 = a1 * y + a2 * Math.pow(y, 2) + a3 * Math.pow(y, 3) + a4 * Math.pow(y, 4) + a5 * Math.pow(y, 5) + a6 * Math.pow(y, 6);
    var y2 = Math.pow(y, 2) + y / (1 + y1);

    var Lp = 2 * pi * d / Math.sqrt(y2);
    return Lp;
  }
}

jsonToHtml();
