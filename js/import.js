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
