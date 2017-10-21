// modules
const http = require('http')
    , fs = require('fs')
    , url = require('url')
    , path = require('path')
    , mapnik = require('mapnik')
    , mercator = require('./sphericalmercator');

// config data
const hostname = '127.0.0.1'
    , port = 8080
    , TILE_SIZE = 256;

mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins, 'shape.input'));

http.createServer((req, res) => {

    let [rigth,type] = url.parse(req.url.toLowerCase(), true).path.split('.')
    let [name,z,x,y] = rigth.substr(1).split('/');

    if (type === "png") {

        const map = new mapnik.Map(TILE_SIZE, TILE_SIZE);

        let bbox = mercator.xyz_to_envelope(+x,+y,+z, false);

        map.bufferSize = 64;
        map.load(`./map-data/style-${name}.xml`, (err, map) => {
            const im = new mapnik.Image(TILE_SIZE, TILE_SIZE);

            map.extent = bbox;
            map.render(im, (err, image) => {
                if (err) throw err;

                //toSaveImage([name,z,x,y])

                res.writeHead(200, {'Content-Type': 'image/png'});
                res.end(image.encodeSync('png'));

            });
        });

    }
    else if (type === "html") {

        try {
            res.writeHead(200, {'Content-Type': 'text/html'});
            if (req.url == '/') {
                res.end(fs.readFileSync('./index.html'));
            } else {
                res.end(fs.readFileSync('./' + req.url));
            }
        } catch (err) {
                res.end('Not found: ' + req.url);
        }
    }

}).listen(port, () => { console.log(`server ready and go to: http://${hostname}:${port}/index.html`); });

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
