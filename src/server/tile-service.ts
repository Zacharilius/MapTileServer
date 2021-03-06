import * as fs from 'fs'
import * as mapnik from 'mapnik'
import * as mkdirp from 'mkdirp'

import { SphericalMercator } from './mercator'

const TILE_SIZE: number = 256
const mercator = new SphericalMercator()

export const getTile = async (tileId: string, z: string, x: string, y: string): Promise<Buffer> => {
    if (doesTileExist(tileId, z, x, y)) {
        return getTileImage(tileId, z, x, y)
    } else {
        const map: mapnik.Map = new mapnik.Map(TILE_SIZE, TILE_SIZE)
        map.bufferSize = 64
        return new Promise((resolve, reject) => {
            map.load(`./map-data/${tileId}.xml`, (err: Error, map: mapnik.Map) => {
                if (err) {
                    reject(err)
                }

                const mapnikImage: mapnik.Image = new mapnik.Image(TILE_SIZE, TILE_SIZE)
                const boundingBox: mapnik.BoundingBox = mercator.xyzToMapnikEnvelope(+x, +y, +z)
                map.extent = boundingBox
                map.render(mapnikImage, (err: Error, image: mapnik.Image) => {
                    if (err) {
                        reject(err)
                    }

                    saveTileImage(mapnikImage, tileId, z, x, y)
                    resolve(image.encodeSync('png'))
                })
            })
        })
    }
}

const getTileDirPath = (tileId: string, z: string, x: string): string => {
    return `./tiles/${tileId}/${z}/${x}`
}

const getTileImagePath = (tileId: string, z: string, x: string, y: string): string => {
    const dir = getTileDirPath(tileId, z, x)
    return `${dir}/${y}.png`
}

const doesTileExist = (tileId: string, z: string, x: string, y: string): boolean => {
    return fs.existsSync(getTileImagePath(tileId, z, x, y))
}

const getTileImage = (tileId: string, z: string, x: string, y: string): Buffer => {
    var imagePath = getTileImagePath(tileId, z, x, y)
    var img = fs.readFileSync(imagePath)
    return img
}

const saveTileImage = (image: mapnik.Image, tileId: string, z: string, x: string, y: string): void => {
    const dir = getTileDirPath(tileId, z, x)
    const pngPath = getTileImagePath(tileId, z, x, y)

    mkdirp.sync(dir)
    image.save(pngPath, 'png32')
}
