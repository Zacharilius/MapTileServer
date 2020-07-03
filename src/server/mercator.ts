import * as mapnik from 'mapnik'

export declare type BoundingBox = [number, number, number, number]

declare interface MapnikProjection {
    constructor(proj4: string)
    forward(boundingBox: BoundingBox): BoundingBox
}

declare type LatitudeLongitude = [number, number]

declare type Pixels = [number, number]

export const PROJ_4: string = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over'

/**
 * SphericalMercator constructor: precaches calculations
 * for fast tile lookups
 */
export class SphericalMercator {
    private Bc: Array<number>
    private Cc: Array<number>
    private zc: Array<number>
    private Ac: Array<number>
    private DEG_TO_RAD: number
    private RAD_TO_DEG: number
    private size: number
    private levels: number
    private mercator: MapnikProjection

    constructor () {
        var size = 256
        this.Bc = []
        this.Cc = []
        this.zc = []
        this.Ac = []
        this.DEG_TO_RAD = Math.PI / 180
        this.RAD_TO_DEG = 180 / Math.PI
        this.size = 256
        this.levels = 18

        // Constructs a new projection from its PROJ.4 string representation.
        this.mercator = new mapnik.Projection(PROJ_4)
        for (var d = 0; d < this.levels; d++) {
            this.Bc.push(size / 360)
            this.Cc.push(size / (2 * Math.PI))
            this.zc.push(size / 2)
            this.Ac.push(size)
            size *= 2
        }
    }

    private minmax (a: number, b: number, c: number): number {
        return Math.min(Math.max(a, b), c)
    }

    public convertLatitudeLongitudeToPixels (latitudeLongitude: LatitudeLongitude, zoom: number): [number, number] {
        var d = this.zc[zoom]
        var f = this.minmax(Math.sin(this.DEG_TO_RAD * latitudeLongitude[1]), -0.9999, 0.9999)
        var x = Math.round(d + latitudeLongitude[0] * this.Bc[zoom])
        var y = Math.round(d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[zoom]))
        return [x, y]
    }

    private convertPixelsToLatitudeLongitude (px: Pixels, zoom: number): [number, number] {
        var zoomDenom = this.zc[zoom]
        var g = (px[1] - zoomDenom) / (-this.Cc[zoom])
        var latitude = (px[0] - zoomDenom) / this.Bc[zoom]
        var longitude = this.RAD_TO_DEG * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI)
        return [latitude, longitude]
    }

    public xyzToMapnikEnvelope (x: number, y: number, zoom: number): BoundingBox {
        const latitudeLongitude: LatitudeLongitude = [x * this.size, (y + 1) * this.size]
        const pixels: Pixels = [(x + 1) * this.size, y * this.size]
        var boundingBoxPart1 = this.convertPixelsToLatitudeLongitude(latitudeLongitude, zoom)
        var boundingBoxPart2 = this.convertPixelsToLatitudeLongitude(pixels, zoom)
        const boundingBox: BoundingBox = [boundingBoxPart1[0], boundingBoxPart1[1], boundingBoxPart2[0], boundingBoxPart2[1]]
        return this.mercator.forward(boundingBox)
    }
}
