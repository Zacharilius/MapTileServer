// modules
const http = require('http')
    , express = require('express')
    , fs = require('fs')
    , url = require('url')
    , path = require('path')
    , mapnik = require('mapnik')
    , mercator = require('./sphericalmercator');

// config data
const hostname = '127.0.0.1'
    , port = 8080
    , TILE_SIZE = 256;

const app = express();

mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins, 'shape.input'));

app.use(express.static('public'))

app.get('/', function (req, res) {
    try {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(fs.readFileSync('./index.html'));
    } catch (err) {
        res.end('Not found: ' + req.url);
    }
});

app.get('/admin/:urlId/:z/:x/:y.png', function (req, res) {
    console.log(req.params);  // FIXME
    let [urlId, z, x, y] = [req.params.urlId, req.params.z, req.params.x, req.params.y];
    let name = 'admin' + urlId;

    const map = new mapnik.Map(TILE_SIZE, TILE_SIZE);

    let bbox = mercator.xyz_to_envelope(+x,+y,+z, false);

    map.bufferSize = 64;
    map.load(`./map-data/style-${name}.xml`, (err, map) => {
        if (err) {
            throw err;
        }
        const mapnikImage = new mapnik.Image(TILE_SIZE, TILE_SIZE);

        map.extent = bbox;
        map.render(mapnikImage, (err, image) => {
            if (err) throw err;

            //toSaveImage([name,z,x,y])

            res.writeHead(200, {'Content-Type': 'image/png'});
            res.end(image.encodeSync('png'));

        });
    });
});

app.listen(port, function() {
    console.log(`Server listening at: http://${hostname}:${port}/`);
});

/**
 * Save the render (PNG) image to create tiles
 * Important:
 *      - Install package: "npm install mkdirp --save"
 *      - Add the following line in the top:
 *            , mkdirp = require('mkdirp')
 */
function toSaveImage(args) {
    let [name,z,x,y] = args,
        dir = `./${name}/${z}/${x}`,
        png_path = `${dir}/${y}.png`;

    if(!fs.existsSync(png_path)){
        makeDir(dir);
        image.save(png_path, 'png32');
    }
}

/**
 * Valid if exist directory else it create
 */
function makeDir(dir) {
    if (!fs.existsSync(dir)){
        mkdirp.sync(dir);
    }
}
