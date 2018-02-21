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
function addLayout() {
  table = document.getElementById('layoutsTable');
  last_row = document.getElementById('layoutsLastRow');
  row = document.createElement('tr');
  last_row.parentNode.insertBefore(row, last_row);

  row.id = 'layout_' + layout_id;
  row.className = 'layout';
  layout_id += 1;
  layout = row.insertCell();
  input = document.createElement('input');
  input.type = 'text';
  input.value = row.id;
  layout.appendChild(input);

  // Add delete button
  btn = row.insertCell();
  btn.innerHTML = "<button onclick='removeTableRow(this.parentNode.parentNode.id)'>-</button>";

  // Update select fields in instrument definitions
  instrument_rows = document.getElementsByClassName('layoutSelect');

  // createLayoutSelect(target_select)
}

function createLayoutSelect(target_select){
  // Get layout rows
  layouts = document.getElementsByClassName('layout');
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
function addInstrument() {
  table = document.getElementById('instrumentsTable');
  last_row = document.getElementById('instrumentsLastRow');
  row = document.createElement('tr');
  last_row.parentNode.insertBefore(row, last_row);
  row.id = 'inst_' + inst_id;
  inst_id += 1;

  layout = row.insertCell();
  select = document.createElement('select');
  select.className = 'layoutSelect';
  layout.appendChild(select);

  createLayoutSelect(select)

  loc = row.insertCell();
  input = document.createElement('input');
  input.type = 'text';
  input.value = row.id;
  loc.appendChild(input);

  depth = row.insertCell();
  depth.innerHTML = "<input type='text' value='0'>";
  btn = row.insertCell();
  btn.innerHTML = '<button onclick="removeTableRow(this.parentNode.parentNode.id)">-</button>';
}


// Remove rows from table
function removeTableRow(id) {
  console.log(document.getElementById(id))
  document.getElementById(id).remove()
}

// Add one layout and instrument
addLayout()
addInstrument()
