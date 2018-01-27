/* =============================================================================
    Imports
*/

const http = require('http'),
    fs = require('fs'),
    url = require('url'),
    path = require('path'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    webpack = require('webpack'),
    webpackConfig = require('./webpack.config.js'),
    express = require('express'),
    mapnik = require('mapnik'),
    mercator = require('./sphericalmercator'),
    mkdirp = require('mkdirp');

/* =============================================================================
    Config data
*/

const hostname = '127.0.0.1'
    , port = 8080
    , TILE_SIZE = 256;

const app = express();
const compiler = webpack(webpackConfig);

mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins, 'shape.input'));

/* =============================================================================
    Routing and views.
*/

app.use('/static', express.static(__dirname + '/public'));

// TODO: Investigate why not bundling on change.
// app.use(webpackDevMiddleware(compiler, {
//     hot: true,
//     filename: 'bundle.js',
//     publicPath: '/',
//     stats: {
//         colors: true,
//     },
//     historyApiFallback: true,
// }));

app.get('/', function (req, res) {
    try {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(fs.readFileSync('./public/index.html'));
    } catch (err) {
        res.end('Error: ', err);
    }
});

// TODO: Implement
app.get('/api/tiles', function (req, res) {
    try {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({data: getTileInfos()}));
    } catch (err) {
        res.writeHead(500);
        res.end('Error: ', err);
    }
});

app.get('/api/tiles/:tileId/:z/:x/:y.png', function (req, res) {
    let [tileId, z, x, y] = [req.params.tileId, req.params.z, req.params.x, req.params.y];

    const map = new mapnik.Map(TILE_SIZE, TILE_SIZE);
    map.bufferSize = 64;
    map.load(`./map-data/${tileId}.xml`, (err, map) => {
        if (err) throw err;

        let mapnikImage = new mapnik.Image(TILE_SIZE, TILE_SIZE);
        let bbox = mercator.xyz_to_envelope(+x,+y,+z, false);
        map.extent = bbox;
        map.render(mapnikImage, (err, image) => {
            if (err) throw err;

            // TODO: Save images so that they do not need to be recomputed;
            // saveImage(mapnikImage, [tileId, z, x, y]);

            res.writeHead(200, {'Content-Type': 'image/png'});
            res.end(image.encodeSync('png'));
        });
    });
});

// Server init
app.listen(port, function() {
    console.log(`Server listening at: http://${hostname}:${port}/`);
});

/* =============================================================================
    Database
*/

// TODO: Store tiles in database
function getTileInfos() {
    return {};
}

/* =============================================================================
    Util
*/

function getDirPath(args) {
    let [tileId, z, x, y] = args,
        dir = `./tiles/${tileId}/${z}/${x}`;
    return dir
}

function getImagePath(args) {
    let [tileId, z, x, y] = args,
        dir = getDirPath(args),
        pngPath = `${dir}/${y}.png`;
    return pngPath;
}

function doesTileExist(args) {
    var pngPath = getImagePath(args);
    return fs.existsSync(pngPath);
}

function getTile(args) {
    var imagePath = getImagePath(args);
    var img = fs.readFileSync(imagePath);
    return img;
}

/**
 * Save the png if it does not exist.
 */
function saveImage(image, args) {
    let dir = getDirPath(args),
        pngPath = getImagePath(args);

    // TODO: Just save image.
    if (!doesTileExist(args)){
        if (!fs.existsSync(dir)) {
            mkdirp.sync(dir);
        }
        image.save(pngPath, 'png32');
    }
}
