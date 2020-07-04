import * as fs from 'fs'
import * as path from 'path'
import * as express from 'express'
import { Router } from 'express'
import * as mapnik from 'mapnik'

import { getTile } from './tile-service'

mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins, 'shape.input'))

export const router = Router()

router.use('/static', express.static('public'))

router.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(fs.readFileSync('./public/index.html'))
})

router.get('/api/tile/:tileId/:z/:x/:y.png', async (req, res) => {
    const tileId = req.params.tileId
    const z = req.params.z
    const x = req.params.x
    const y = req.params.y

    const image = await getTile(tileId, z, x, y)
    res.writeHead(200, { 'Content-Type': 'image/png' })
    res.end(image)
})
