window.addEventListener('load', init);

function init() {
    window.mts.map = L.map('map', {
        center: [40, -80],
        zoom: 1
    });

    getTileInfos();
}

function getTileInfos() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        window.mts.tileInfos = JSON.parse(this.responseText).data;  // Store for debugging
        addTileLayersToMap(window.mts.tileInfos);
    }
  };
  xhttp.open('GET', '/api/tiles', true);
  xhttp.send();
}

function addTileLayersToMap(tileInfos) {
    var layers = {}
    for (var i in tileInfos) {
        var tileInfo = tileInfos[i];
        layers[tileInfo.title] = L.tileLayer('/api/tiles/' + tileInfo.name + '/{z}/{x}/{y}.png');
    }

    L.control.layers(null, layers).addTo(window.mts.map);
}
