/* =============================================================================
    Modules
*/

const http = require('http')
    , fs = require('fs')
    , url = require('url')
    , path = require('path')
    , webpackDevMiddleware = require('webpack-dev-middleware')
    , webpack = require('webpack')
    , webpackConfig = require('./webpack.config.js')
    , express = require('express')
    , mapnik = require('mapnik')
    , mercator = require('./sphericalmercator');

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

app.use(webpackDevMiddleware(compiler, {
    hot: true,
    filename: 'bundle.js',
    publicPath: '/',
    stats: {
        colors: true,
    },
    historyApiFallback: true,
}));

app.get('/', function (req, res) {
    try {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(fs.readFileSync('./public/index.html'));
    } catch (err) {
        res.end('Error: ', err);
    }
});

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

    let bbox = mercator.xyz_to_envelope(+x,+y,+z, false);

    map.bufferSize = 64;
    map.load(`./map-data/${tileId}.xml`, (err, map) => {
        if (err) throw err;
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

// Server init
app.listen(port, function() {
    console.log(`Server listening at: http://${hostname}:${port}/`);
});

/* =============================================================================
    Database
*/

function getTileInfos() {
    return database.tiles;
}

const database = {
    'tiles': [
        {
            'title': 'Country Boundaries',
            'name': 'ne_110m_countries'
        },
        {
            'title': 'USA State Boundaries',
            'name': 'ne_110m_usa_state_boundaries'
        },
        {
            'title': 'Seattle Neighborhoods',
            'name': 'seattle_neighborhoods'
        },
    ]
}

/* =============================================================================
    Util
*/

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

    if (!fs.existsSync(png_path)){
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
