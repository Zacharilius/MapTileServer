import { expect } from 'chai'
import * as proxyquire from 'proxyquire'
import * as sinon from 'sinon'

describe('mercator', function() {
    let SphericalMercator
    let PROJ_4

    // mapnik stubs
    let ProjectionStub
    let ProjectionForwardStub

    beforeEach(() => {
        ProjectionForwardStub = sinon.stub()
        ProjectionStub = sinon.stub().returns({
            forward: ProjectionForwardStub
        })

        const SphericalMercatorService = proxyquire('../../src/server/mercator', {
            mapnik: {
                Projection: ProjectionStub
            }
        })
        SphericalMercator = SphericalMercatorService.SphericalMercator
        PROJ_4 = SphericalMercatorService.PROJ_4
    })

    it('should create mapnik projection on class create', async () => {
        new SphericalMercator()
        expect(ProjectionStub.getCall(0).args[0]).equal(PROJ_4)
    })
    it('should create correct mapnik bounding box', async () => {
        const sphericalMercator = new SphericalMercator()
        sphericalMercator.xyzToMapnikEnvelope(1, 1, 1)

        const EXPECTED_PROJECTION_FORWARD = [ 0, -85.05112877980659, 180, 0 ]
        expect(ProjectionForwardStub.getCall(0).args[0]).deep.equal(EXPECTED_PROJECTION_FORWARD)
    })
    it('convertLatitudeLongitudeToPixels', async () => {
        const sphericalMercator = new SphericalMercator()
        const pixels = sphericalMercator.convertLatitudeLongitudeToPixels([90, 145], 1)
        const EXPECTED_PIXELS = [384, 203]
        expect(pixels).to.deep.equal(EXPECTED_PIXELS)
    })
})
