// Import JSON data
document.getElementById('importJson').onclick = function() {
  var files = document.getElementById('selectJson').files;
  if (files.length <= 0) {
    return false;
  }

  var reader = new FileReader();

  reader.onload = function(f) {
    var result = JSON.parse(f.target.result);
    var formatted = JSON.stringify(result, null, 2);
    document.getElementById('dataJson').value = formatted;
  }
  reader.readAsText(files.item(0));
};


// Import csv data
document.getElementById('importCsv').onclick = function() {
  var files = document.getElementById('selectCsv').files;
  if (files.length <= 0) {
    return false;
  }

  var reader = new FileReader();

  reader.onload = function(f) {
    var csv_string = f.target.result;
    document.getElementById('dataCsv').value = csv_string;
  }
  reader.readAsText(files.item(0));

};
