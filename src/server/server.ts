import * as express from 'express'
import { router } from './routes'

const HOSTNAME = '127.0.0.1'
const PORT = 8080

export const app = express()

app.use(router)

app.listen(PORT, () => {
    console.info(`Server listening at: http://${HOSTNAME}:${PORT}/`) // eslint-disable-line no-console
})
