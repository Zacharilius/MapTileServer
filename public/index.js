window.addEventListener('load', init);

function init() {
    var admin0url = '/admin/0/{z}/{x}/{y}.png';
    var admin1url = '/admin/1/{z}/{x}/{y}.png';

    var admin0 = L.tileLayer(admin0url);
    var admin1 = L.tileLayer(admin1url);

    var map = L.map('map', {
        center: [40, -80],
        zoom: 1,
        layers: [admin0]
    });

    var layers = {
        "Admin 0": admin0,
        "USA Admin 1": admin1
    };

    L.control.layers(null,layers).addTo(map);
}
