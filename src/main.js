import React from 'react';
import { render } from 'react-dom';
import {
  LayersControl,
  Map,
  TileLayer,
} from 'react-leaflet';

const { BaseLayer, Overlay } = LayersControl
const position = [40, -80];
const zoom = 1;
const map = (
  <Map center={position} zoom={zoom}>
        <LayersControl position="topright">
          <BaseLayer checked name="OpenStreetMap.Mapnik">
            <TileLayer
              attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Country Boundaries">
            <TileLayer
              url="/api/tiles/ne_110m_countries/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="USA State Boundaries">
            <TileLayer
              url="/api/tiles/ne_110m_usa_state_boundaries/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Seattle Neighborhoods">
            <TileLayer
              url="/api/tiles/seattle_neighborhoods/{z}/{x}/{y}.png"
            />
          </BaseLayer>
        </LayersControl>
  </Map>
);

render(map, document.getElementById('map'));
