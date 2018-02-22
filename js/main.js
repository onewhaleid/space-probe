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
  'instruments': [{
      'location': 'location_1',
      'proto_depth': 10,
    },
    {
      'location': 'location_2',
      'proto_depth': 3,
    },
  ],
  'wave_climates': [{
    'name': '1y ARI',
    'Hs': 2,
    'Tp': 12,
    'WL': 1.5,
  }, ]
}


// Add new instrument location
var new_instrument = {
  'location': 'location_3',
  'proto_depth': 2.5,
}

config['instruments'].push(new_instrument)

console.log(config['instruments'])

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
var layout_id = 0

// Add rows to table
function addLayout(layout_name) {
  table = document.getElementById('layoutsTable');
  last_row = document.getElementById('layoutsLastRow');
  row = document.createElement('tr');
  last_row.parentNode.insertBefore(row, last_row);

  row.id = 'layout_' + layout_id;
  row.className = 'layout';
  layout_id += 1;
  layout = row.insertCell();
  input = document.createElement('input');
  layout.appendChild(input);
  input.type = 'text';

  if (layout_name === "") {
    input.value = row.id;
  } else {
    input.value = layout_name;
  }

  // Add delete button
  btn = row.insertCell();
  btn.innerHTML = "<button onclick='removeTableRow(this.parentNode.parentNode.id)'>-</button>";

  // Update select fields in instrument definitions
  updateConfig()
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
function addInstrument(location_name) {
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

  createLayoutSelect(select)

  var loc = row.insertCell();
  var input = document.createElement('input');
  input.type = 'text';

  if (location_name === "") {
    input.value = row.id;
  } else {
    input.value = location_name;
  }

  loc.appendChild(input);

  var depth = row.insertCell();
  depth.innerHTML = "<input type='text' value='0'>";
  var btn = row.insertCell();
  btn.innerHTML = '<button onclick="removeTableRow(this.parentNode.parentNode.id)">-</button>';

}

function updateConfig() {
  // Check all layout selects are up to date
  var instruments = document.getElementsByClassName('instrument')
  for (var i = 0; i < instruments.length; i++) {
    var old_select = instruments[i].getElementsByClassName('layoutSelect')[0];
    var layout_id = old_select.value;
    createLayoutSelect(old_select)

    // Remember current value
    if (layout_id) {
      old_select.value = layout_id;
    }
  }
}

// Remove rows from table
function removeTableRow(id) {
  console.log(document.getElementById(id))
  document.getElementById(id).remove()
  updateConfig()
}

// Add one layout and instrument
addLayout('wave climate calibration')
addInstrument('offshore')
addInstrument('structure')
