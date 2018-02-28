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
      'proto_ch': 10,
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
  'proto_ch': 10,
}

config['layouts'][0]['instruments'].push(new_instrument)
console.log(config)

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
function addLayout(layout_name) {
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
  input.onchange = 'updateConfig()'

  if (layout_name === "") {
    input.value = row.id;
  } else {
    input.value = layout_name;
  }

  // Add delete button
  var btn = row.insertCell();
  btn.innerHTML = "<button onclick='removeTableRow(this.parentNode.parentNode.id)'>-</button>";

  // Update select fields in instrument definitions
  updateConfig()
}

// Set up row id generator
var wave_climate_id = 0;

// Add rows to wave climate table
function addWaveClimate(wave_climate_name, water_level = null, Hs = null, Tp = null) {
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
  input.onchange = 'updateConfig()'

  if (wave_climate_name === "") {
    input.value = row.id;
  } else {
    input.value = wave_climate_name;
  }

  var water_level = row.insertCell();
  water_level.innerHTML = "<input type='text' value='0' size=10 >";
  var Hs = row.insertCell();
  Hs.innerHTML = "<input type='text' value='0' size=2>";
  var Tp = row.insertCell();
  Tp.innerHTML = "<input type='text' value='0' size=2>";

  // Add delete button
  var btn = row.insertCell();
  btn.innerHTML = "<button onclick='removeTableRow(this.parentNode.parentNode.id)'>-</button>";

  updateConfig();
}


function createLayoutSelect(target_select) {
  // Get layout rows
  var layouts = document.getElementsByClassName('layout');
  target_select.innerHTML = '';
  for (var i = 0; i < layouts.length; i++) {
    var opt = document.createElement('option');
    opt.value = layouts[i].id;
    opt.innerHTML = layouts[i].querySelector('input').value;
    target_select.appendChild(opt);
  }
}

// Set up row id generator
var inst_id = 0

// Add rows to table
function addInstrument(location_name, layout_id = null, elev = null, ch = null) {
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

  createLayoutSelect(select);

  var loc = row.insertCell();
  var input = document.createElement('input');
  input.type = 'text';

  if (location_name === "") {
    input.value = row.id;
  } else {
    input.value = location_name;
  }

  loc.appendChild(input);

  var elevation = row.insertCell();
  elevation.innerHTML = "<input type='text' value='0' size=10>";
  var chainage = row.insertCell();
  chainage.innerHTML = "<input type='text' value='0' size=10>";

  var btn = row.insertCell();
  btn.innerHTML = '<button onclick="removeTableRow(this.parentNode.parentNode.id)">-</button>';

}

function updateConfig() {
  // Check all layout selects are up to date
  var instruments = document.getElementsByClassName('instrument')
  for (var i = 0; i < instruments.length; i++) {
    var old_select = instruments[i].getElementsByClassName('layoutSelect')[0];
    var old_layout_id = old_select.value;
    createLayoutSelect(old_select)

    // Remember current value
    if (old_layout_id) {
      old_select.value = old_layout_id;
    }
  }
}

// Remove rows from table
function removeTableRow(id) {
  document.getElementById(id).remove()
  updateConfig()
}

// Put config JSON data into html structure
function loadConfig(config) {
  document.getElementById('project').value = config.project;
  document.getElementById('operator').value = config.operator;
  document.getElementById('scale').value = config.scale;
  document.getElementById('datum').value = config.datum;
  document.getElementById('swl').innerHTML = 'SWL (m ' + config.datum + '):';

  // Update layout data
  for (var i = 0; i < config.layouts.length; i++) {
    var layout = config.layouts[i];
    addLayout(layout.name);
    for (var j = 0; j < layout.instruments.length; j++) {
      var instrument = layout.instruments[j];
      addInstrument(instrument.location, l_id = layout.id, elev = instrument.proto_elev, ch = instrument.proto_ch);
    }
  }

  // Update wave climate data
  for (var i = 0; i < config.wave_climates.length; i++) {
    var wave_climate = config.wave_climates[i];
    addWaveClimate(wave_climate.name);
  }
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


loadConfig(config)

// Add one layout and instrument

// addLayout('wave climate calibration')
// addInstrument('offshore')
// addInstrument('structure')
