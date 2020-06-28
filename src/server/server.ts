import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as mapnik from 'mapnik';

import { getTile } from './tile-service';

/* =============================================================================
	Config data
*/

const hostname = '127.0.0.1';
const port = 8080;

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

app.get('/api/tile/:tileId/:z/:x/:y.png', async (req, res) => {
	const tileId = req.params.tileId;
	const z = req.params.z
	const x = req.params.x
	const y = req.params.y;

	const image = await getTile(tileId, z, x, y);
	res.writeHead(200, {'Content-Type': 'image/png'});
	res.end(image);
});

// Server init
app.listen(port, () => {
	console.log(`Server listening at: http://${hostname}:${port}/`);
});
