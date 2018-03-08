var config = {
  'project': 'wrl20xxxxx',
  'operator': 'DH',
  'scale': 10,
  'datum': 'AHD',
  'base_elevation': -10,
  'bathy': [
    [0, 0],
    [5000, 0],
    [7500, 250],
    [25000, 400],
    [30000, 400],
    [30000, 0],
    [0, 0],
  ],
  'layouts': [{
    'id': 'layout_0',
    'name': 'wave climate calibration',
    'instruments': [{
      'location': 'offshore',
      'proto_elev': 10,
    }, ],
  }, ],
  'wave_climates': [{
    'name': '1y ARI',
    'Hs': 2,
    'Tp': 12,
    'WL': 1.5,
  }, ]
}


// Add new instrument location
var new_instrument = {
  'location': 'structure',
  'proto_elev': 10,
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
  var input = document.createElement('input');
  layout.appendChild(input);
  input.type = 'text';
  // input.onchange = updateUiElements();

  // if (layout_name === "") {
  //   input.value = row.id;
  // } else {
  //   input.value = layout_name;
  // }

  input.value = layout_name || row.id;


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
  var input = document.createElement('input');
  wave_climate.appendChild(input);
  input.type = 'text';

  if (wave_climate_name === "") {
    input.value = row.id;
  } else {
    input.value = wave_climate_name;
  }

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

function createLayoutSelect(target_select, l_id = null) {
  // Get layout rows
  var layouts = document.getElementsByClassName('layout');
  target_select.innerHTML = '';
  for (var i = 0; i < layouts.length; i++) {
    var opt = document.createElement('option');
    opt.value = layouts[i].id;
    opt.innerHTML = layouts[i].querySelector('input').value;
    target_select.appendChild(opt);
    if (l_id) {
      target_select.value = l_id;
    }
  }
}

// Set up row id generator
var inst_id = 0

// Add rows to table
function addInstrument(location_name, l_id = null, elev = 0, manual = false) {
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

  createLayoutSelect(select, l_id);

  var loc = row.insertCell();
  var input = document.createElement('input');
  input.type = 'text';
  input.value = location_name || row.id;

  loc.appendChild(input);

  var elev_input = document.createElement('input');
  row.insertCell().appendChild(elev_input);
  elev_input.type = 'text';
  elev_input.value = elev;
  elev_input.size = 10;

  var btn = row.insertCell();
  btn.innerHTML = '<button onclick="removeTableRow(this.parentNode.parentNode.id)">-</button>';

  if (manual) {
    htmlToJson();
  }
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
}

function htmlToJson() {
  // Put input values into JSON config data
  config.project = document.getElementById('project').value;
  config.operator = document.getElementById('operator').value;
  config.scale = Number(document.getElementById('scale').value);
  config.datum = document.getElementById('datum').value;

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
  console.log('JSON updated')
}

// Put config JSON data into html structure
function jsonToHtml() {
  document.getElementById('project').value = config.project;
  document.getElementById('operator').value = config.operator;
  document.getElementById('scale').value = config.scale;
  document.getElementById('datum').value = config.datum;
  document.getElementById('swl').innerHTML = 'SWL (m ' + config.datum + '):';

  // Update wave climate data
  for (var i = 0; i < config.wave_climates.length; i++) {
    var wave_climate = config.wave_climates[i];
    addWaveClimate(wave_climate.name, water_level = wave_climate.WL, Hs = wave_climate.Hs, Tp = wave_climate.Tp);
  }
}

// Update layout data
for (var i = 0; i < config.layouts.length; i++) {
  var layout = config.layouts[i];
  addLayout(layout.name);
  for (var j = 0; j < layout.instruments.length; j++) {
    var instrument = layout.instruments[j];
    addInstrument(instrument.location, l_id = layout.id, elev = instrument.proto_elev);
  }
  console.log('HTML updated');
}

// Remove rows from table
function removeTableRow(id) {
  document.getElementById(id).remove();
  updateUiElements();
}

function bathyInterp(points, elev) {
  // Find segment to interpolate
  var i = 0;
  while (points[i + 1][1] <= elev) {
    i++;
  }

  // Get segment endpoints
  x1 = points[i - 1][0];
  x2 = points[i][0];
  y1 = points[i - 1][1];
  y2 = points[i][1];

  forward = d3.scaleLinear()
    .domain([y1, y2])
    .range([x1, x2])(elev);
  backward = d3.scaleLinear()
    .domain([y2, y1])
    .range([x2, x1])(elev);

  return (forward + backward) / 2;
}


jsonToHtml();
