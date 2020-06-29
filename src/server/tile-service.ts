import * as fs from 'fs';
import * as mapnik from 'mapnik';
import * as mkdirp from 'mkdirp';

import { BoundingBox, SphericalMercator } from './spherical-mercator';

const TILE_SIZE: number = 256;
const mercator = new SphericalMercator();

declare interface MapnikImage {
	new(x: number, y: number): () => void;
	encode(type: string, callback?: (err: Error, buffer: Buffer) => void): void;
	encodeSync(type: string);
	getData(): Buffer;
	save(fp: string): () => void;
	open(fp: string): () => void;
}

declare interface MapnikMap {
	constructor(x: number, y: number)
	load(xml: string, callback?: (err: Error, map: MapnikMap) => void): void;
	render(images: MapnikImage, callback?: (err: Error, map: MapnikImage) => void): void;
	bufferSize?: number
	extent?: BoundingBox;

}

export const getTile = async (tileId: string, z: string, x: string, y: string): Promise<Buffer> => {
	if (doesTileExist(tileId, z, x, y)) {
		return getTileImage(tileId, z, x, y);
	} else {
		const map: MapnikMap = new mapnik.Map(TILE_SIZE, TILE_SIZE);
		map.bufferSize = 64;
		return new Promise((resolve, reject) => {
			map.load(`./map-data/${tileId}.xml`, (err, map) => {
				if (err) {
					reject(err)
				};
	
				let mapnikImage: MapnikImage = new mapnik.Image(TILE_SIZE, TILE_SIZE);
				let boundingBox = mercator.xyzToMapnikEnvelope(+x,+y,+z, false);
				map.extent = boundingBox;
				map.render(mapnikImage, (err, image) => {
					if (err) {
						reject(err)
					};
	
					saveTileImage(mapnikImage, tileId, z, x, y);
					resolve(image.encodeSync('png'));
				});
			});
		});
	}
}

const getTileDirPath = (tileId: string, z: string, x: string): string => {
	return `./tiles/${tileId}/${z}/${x}`;
}

const getTileImagePath = (tileId: string, z: string, x: string, y: string): string => {
	const dir = getTileDirPath(tileId, z, x);
	return `${dir}/${y}.png`;
}

const doesTileExist = (tileId: string, z: string, x: string, y: string): boolean => {
	return fs.existsSync(getTileImagePath(tileId, z, x, y));
}

const getTileImage = (tileId: string, z: string, x: string, y: string): Buffer => {
	var imagePath = getTileImagePath(tileId, z, x, y);
	var img = fs.readFileSync(imagePath);
	return img;
}

const saveTileImage = (image, tileId: string, z: string, x: string, y: string): void => {
	let dir = getTileDirPath(tileId, z, x),
	pngPath = getTileImagePath(tileId, z, x, y);

	if (!fs.existsSync(dir)) {
		mkdirp.sync(dir);
	}
	image.save(pngPath, 'png32');
}
