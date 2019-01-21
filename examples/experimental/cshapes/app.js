import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL from 'deck.gl';
import GeoJsonLayerWithFilter from './geojson-layer';

const SAMPLE_CSHAPES = 'CShapes-2018.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 0,
  bearing: 0,
  pitch: 0
};

class Root extends Component {
  render() {
    return (
      <DeckGL
        width="100%"
        height="100%"
        controller={true}
        initialViewState={INITIAL_VIEW_STATE}
        layers={[
          new GeoJsonLayerWithFilter({
            pickable: true,
            autoHighlight: true,
            data: SAMPLE_CSHAPES,
            stroked: false,
            filled: true,
            lineWidthMinPixels: 2,
            extruded: false,
            getLineColor: () => [255, 255, 255],
            getFillColor: f => [127, 127, 127],
            getElevation: f => f.elevation,
            getFilterValue: 0
          })
        ]}
      />
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
