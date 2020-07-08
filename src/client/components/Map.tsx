import * as React from 'react';
import * as Leaflet from 'leaflet';
import {
    LayersControl,
    Map as MapComponent,
    TileLayer,
} from 'react-leaflet'

const { Overlay } = LayersControl
const position: Leaflet.LatLngExpression = [40, -80]
const zoom = 2

const Map = () => {
    return <MapComponent center={position} zoom={zoom}>
        <LayersControl position="topright">
            <Overlay checked name="OpenStreetMap.Mapnik">
                <TileLayer
                    attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </Overlay>
            <Overlay name="Country Boundaries">
                <TileLayer
                    url="/api/tile/ne_110m_countries/{z}/{x}/{y}.png"
                />
            </Overlay>
            <Overlay name="USA State Boundaries">
                <TileLayer
                    url="/api/tile/ne_110m_usa_state_boundaries/{z}/{x}/{y}.png"
                />
            </Overlay>
            <Overlay name="Seattle Neighborhoods">
                <TileLayer
                    url="/api/tile/seattle_neighborhoods/{z}/{x}/{y}.png"
                />
            </Overlay>
        </LayersControl>
    </MapComponent>
}

export default Map;
