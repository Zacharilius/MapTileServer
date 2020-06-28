import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as mapnik from 'mapnik';
import * as mkdirp from 'mkdirp';

import * as mercator from './sphericalmercator';

/* =============================================================================
	Config data
*/

const hostname = '127.0.0.1'
	, port = 8080
	, TILE_SIZE = 256;

const app = express();

mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins, 'shape.input'));

/* =============================================================================
	Routing and views.
*/

app.use('/static', express.static('public'));
	
app.get('/', (req, res) => {
	try {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(fs.readFileSync('./public/index.html'));
	} catch (err) {
		res.end('Error: ', err);
	}
});

// TODO: Implement
app.get('/api/tiles', (req, res) => {
	try {
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify({data: getTileInfos()}));
	} catch (err) {
		res.writeHead(500);
		res.end('Error: ', err);
	}
});

app.get('/api/tile/:tileId/:z/:x/:y.png', (req, res) => {
	let [tileId, z, x, y] = [req.params.tileId, req.params.z, req.params.x, req.params.y];
	let tileArgs = [tileId, z, x, y];

	if (doesTileExist(tileArgs)) {
		// Use computed image
		var image = getTileImage(tileArgs);
		res.writeHead(200, {'Content-Type': 'image/png'});
		res.end(image);
	} else {
		const map = new mapnik.Map(TILE_SIZE, TILE_SIZE);
		// map.bufferSize = 64;
		map.load(`./map-data/${tileId}.xml`, (err, map) => {
			if (err) throw err;

			let mapnikImage = new mapnik.Image(TILE_SIZE, TILE_SIZE);
			let bbox = mercator.xyz_to_envelope(+x,+y,+z, false);
			// map.extent = bbox;
			map.render(mapnikImage, (err, image) => {
				if (err) throw err;

				saveTileImage(mapnikImage, tileArgs);

				res.writeHead(200, {'Content-Type': 'image/png'});
				// res.end(image.encodeSync('png'));
				res.end(image);
			});
		});
	}
});

// Server init
app.listen(port, () => {
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

function getTileDirPath(args) {
	let [tileId, z, x, y] = args,
		dir = `./tiles/${tileId}/${z}/${x}`;
	return dir
}

function getTileImagePath(args) {
	let [tileId, z, x, y] = args,
		dir = getTileDirPath(args),
		pngPath = `${dir}/${y}.png`;
	return pngPath;
}

function doesTileExist(args) {
	var pngPath = getTileImagePath(args);
	return fs.existsSync(pngPath);
}

function getTileImage(args) {
	var imagePath = getTileImagePath(args);
	var img = fs.readFileSync(imagePath);
	return img;
}

function saveTileImage(image, args) {
	let dir = getTileDirPath(args),
		pngPath = getTileImagePath(args);

	if (!fs.existsSync(dir)) {
		mkdirp.sync(dir);
	}
	image.save(pngPath, 'png32');
}
