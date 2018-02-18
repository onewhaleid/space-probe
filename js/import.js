// Import JSON data
document.getElementById('import').onclick = function() {
  var files = document.getElementById('selectFiles').files;
  if (files.length <= 0) {
    return false;
  }

  var reader = new FileReader();

  reader.onload = function(f) {
    var result = JSON.parse(f.target.result);
    var formatted = JSON.stringify(result, null, 2);
    document.getElementById('result').value = formatted;
    console.log(result);
  }
  reader.readAsText(files.item(0));
};
