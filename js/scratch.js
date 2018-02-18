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
var inst_id = 0

// Add rows to table
function addInstrument() {
  table = document.getElementById('instrumentsTable');
  last_row = document.getElementById('last_row');
  row = document.createElement('tr');
  last_row.parentNode.insertBefore(row, last_row);
  row.id = "inst_" + inst_id;
  inst_id += 1;
  loc = row.insertCell();
  loc.innerHTML = "<input type='text' value='new_location'>";
  depth = row.insertCell();
  depth.innerHTML = "<input type='text' value='0'>";
  btn = row.insertCell();
  btn.innerHTML = "<button onclick='removeInstrument(this.parentNode.parentNode.id)'>-</button>";
  document.body.appendChild(table);
}

// Remove rows from table
function removeInstrument(id) {
  console.log(document.getElementById(id))
  document.getElementById(id).remove()
}
