import * as React from 'react'
import { render } from 'react-dom'

import './index.html'

import 'leaflet/dist/leaflet.css'
import './Main.css'

import Map from './components/Map'

render(<Map />, document.getElementById('map'))
