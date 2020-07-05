import { expect } from 'chai'
import * as proxyquire from 'proxyquire'
import * as sinon from 'sinon'

describe('tile-service: getTile', function() {
    let TileService: any

    // fs stubs
    let readFileSyncStub: sinon.SinonStub
    let existsSyncStub: sinon.SinonStub

    // mapnik stubs
    let MapStub: sinon.SinonStub
    let ImageStub: sinon.SinonStub
    let RenderImageStub: any
    let MapStubWithRender: any

    // mkdirp stub
    let syncStub: sinon.SinonStub

    beforeEach(() => {
        readFileSyncStub = sinon.stub()
        existsSyncStub = sinon.stub()
        MapStub = sinon.stub()
        ImageStub = sinon.stub().returns({
            save: sinon.stub()
        })
        RenderImageStub = {
            encodeSync: sinon.stub()
        }
        MapStubWithRender = {
            render: (mapnikImage: any, callback: any) => {
                callback(null, RenderImageStub)
            }
        }

        syncStub = sinon.stub()
        TileService = proxyquire('../../src/server/tile-service', {
            fs: {
                readFileSync: readFileSyncStub,
                existsSync: existsSyncStub
            },
            mapnik: {
                Map: MapStub,
                Image: ImageStub
            },
            mkdirp: {
                sync: syncStub
            }
        })
    })
    it('should create a new mapnik image when the tile does not exist', async () => {
        existsSyncStub.returns(false)
        MapStub.returns({
            load: (maptileFileString: string, callback: any) => {
                callback(null, MapStubWithRender)
            },
        })

        await TileService.getTile('ne_110m_countries', '1', '0', '0')

        // Create a a new tile.
        expect(MapStub.calledOnce).to.be.true

        // Encode the image as a png.
        expect(RenderImageStub.encodeSync.calledOnce).to.be.true
    })
    it('should throw an error when map.load throws an error', async () => {
        const EXPECTED_ERROR_MESSAGE = 'Mapnik load error'

        existsSyncStub.returns(false)
        MapStub.returns({
            load: (maptileFileString: string, callback: any) => {
                callback(new Error(EXPECTED_ERROR_MESSAGE))
            },
        })

        try {
            await TileService.getTile('ne_110m_countries', '1', '0', '0')
        } catch (error) {
            // Create a a new tile.
            expect(MapStub.calledOnce).to.be.true
            expect(error.message).equal(EXPECTED_ERROR_MESSAGE)
        }
    })

    it('should throw an error when map.render throws an error', async () => {
        const EXPECTED_ERROR_MESSAGE = 'Mapnik render error'

        existsSyncStub.returns(false)
        MapStub.returns({
            load: (maptileFileString: any, callback: any) => {
                callback(null, MapStubWithRender)
            },
        })
        MapStubWithRender = {
            render: (mapnikImage: any, callback: any) => {
                callback(new Error(EXPECTED_ERROR_MESSAGE))
            }
        }

        try {
            await TileService.getTile('ne_110m_countries', '1', '0', '0')
        } catch (error) {
            // Create a a new tile.
            expect(MapStub.calledOnce).to.be.true
            expect(error.message).equal(EXPECTED_ERROR_MESSAGE)
        }
    })

    it('should return a cached image when a tile already exists', async () => {
        const EXPECTED_TILE_IMAGE = 'IMAGE'

        readFileSyncStub.returns(EXPECTED_TILE_IMAGE)
        existsSyncStub.returns(true)

        const tileImage = await TileService.getTile('ne_110m_countries', '1', '0', '0')

        // Does not create a new Mapnik Tile
        expect(MapStub.calledOnce).to.be.false

        // Returns the cached tile image.
        expect(readFileSyncStub.calledOnce).to.be.true
        expect(tileImage).equal(EXPECTED_TILE_IMAGE)
    })
})
