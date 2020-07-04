import * as express from 'express'
import * as supertest from 'supertest'

import { expect } from 'chai'
import * as proxyquire from 'proxyquire'
import * as sinon from 'sinon'

let routes
let app

let getTileStub
let readFileSyncStub
let registerDatasourceStub

describe('server', () => {

    const INPUT_PLUGINS = 'INPUT_PLUGINS'

    beforeEach(() => {
        getTileStub = sinon.stub()
        readFileSyncStub = sinon.stub()
        registerDatasourceStub = sinon.stub()

        routes = proxyquire('../../src/server/routes', {
            fs: {
                readFileSync: readFileSyncStub,
            },
            './tile-service': {
                getTile: getTileStub
            },
            mapnik: {
                register_datasource: registerDatasourceStub,
                settings: {
                    paths: {
                        input_plugins: INPUT_PLUGINS
                    }
                }
            }
        })
        app = express()
        app.use(routes.router)

    })
    describe('init', () => {
        it('setup mapnik datasources', () => {
            expect(registerDatasourceStub.getCall(0).args[0]).to.equal(`${INPUT_PLUGINS}/shape.input`)
        })
    })

    describe('/', () => {
        it('request index.html', async () => {
            const response = await supertest(app).get('/')
            expect(response.statusCode).equals(200)
            expect(response.type).equals('text/html')
        })
    })

    describe('/api/tile/:tileId/:z/:x/:y.png', () => {
        it('sends a tile', async () => {
            const TILE_ID = 'TILE_ID'
            const Z = 'Z'
            const X = 'X'
            const Y = 'Y'

            const response = await supertest(app).get(`/api/tile/${TILE_ID}/${Z}/${X}/${Y}.png`)
            expect(response.statusCode).equals(200)

            const EXPECTED_ARGS = [TILE_ID, Z, X, Y]
            expect(getTileStub.getCall(0).args).to.deep.equal(EXPECTED_ARGS)
            expect(response.type).equals('image/png')
        })
    })
})
