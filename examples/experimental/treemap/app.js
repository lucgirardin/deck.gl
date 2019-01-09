import React, {Component} from 'react';
import {render} from 'react-dom';
import {COORDINATE_SYSTEM} from 'deck.gl';
import DeckGL, {PolygonLayer, OrbitView} from 'deck.gl';

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
  minDistance: 1,
  maxDistance: 20
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
          new PolygonLayer({
            coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
            data: SAMPLE_TREEMAP,
            stroked: false,
            filled: true,
            lineWidthMinPixels: 2,
            extruded: true,
            getLineColor: () => [255, 255, 255],
            getFillColor: f => f.color,
            getElevation: f => f.elevation
          })
        ]}
      />
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
