
declare module 'mapnik' {
    export const settings: any

    export function register_datasource(path: string): void;

    export class Map {
        constructor(x: number, y: number)
        load(xml: string, callback?: (err: Error, map: Map) => void): void
        render(images: Image, callback?: (err: Error, map: Image) => void): void
        bufferSize?: number
        extent?: BoundingBox
    }
    export type BoundingBox = [number, number, number, number]

    export class Projection {
        constructor(proj4: string)
        forward(boundingBox: BoundingBox): BoundingBox
    }

    export class Image {
        constructor(x: number, y: number)
        encode(type: string, callback?: (err: Error, buffer: Buffer) => void): void
        encodeSync(type: string): Buffer
        getData(): Buffer
        save(fp: string, type: string): () => void
        open(fp: string): () => void
    }
}
