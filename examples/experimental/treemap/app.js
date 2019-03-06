import React, {Component} from 'react';
import {render} from 'react-dom';
import {COORDINATE_SYSTEM} from 'deck.gl';
import DeckGL, {OrbitView} from 'deck.gl';
// import PolygonLayerWithFilter from './polygon-layer';
import {SolidPolygonLayer} from '@deck.gl/layers';

import SAMPLE_TREEMAP from './sample-treemap.json';

const INITIAL_VIEW_STATE = {
  // latitude: 40,
  // longitude: -100,
  // zoom: 3,
  // bearing: 0,
  // pitch: 60,
  lookAt: [0, 0, 0],
  distance: OrbitView.getDistance({boundingBox: [400, 400, 400], fov: 50}),
  rotationX: -30,
  rotationOrbit: 30,
  orbitAxis: 'Y',
  fov: 50,
  minDistance: 0,
  maxDistance: 1000
};

class Root extends Component {
  render() {
    return (
      <DeckGL
        width="100%"
        height="100%"
        controller={true}
        views={[new OrbitView()]}
        initialViewState={INITIAL_VIEW_STATE}
        layers={[
          new SolidPolygonLayer({
            coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
            pickable: true,
            autoHighlight: true,
            data: SAMPLE_TREEMAP,
            stroked: false,
            filled: true,
            lineWidthMinPixels: 2,
            extruded: true,
            getLineColor: () => [255, 255, 255],
            getFillColor: f => f.color,
            getElevation: f => f.elevation,
            getFilterValue: 1,
            filterRange: [0, 1],
            lightSettings: {
              coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
              lightsPosition: [20, 100, 100, 50, 0, 0],
              lightsStrength: [1, 0, 2, 0],
              numberOfLights: 2,
              ambientRatio: 0.2
            }
          })
        ]}
      />
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
