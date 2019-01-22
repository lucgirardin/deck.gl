import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL from 'deck.gl';
import GeoJsonLayerWithFilter from './geojson-layer';

const SAMPLE_CSHAPES = 'CShapes-2018.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 1,
  bearing: 0,
  pitch: 0
};

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredObject: null,
      year: 2017
    };
    this._onHover = this._onHover.bind(this);
    this._setTime = this._setTime.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
    this._renderOptions = this._renderOptions.bind(this);
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _setTime(t) {
    this.setState({year: t});
    // const {time} = this.state;
    // t = date;
    // redraw();
    // console.log(time);
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;
    return (
      hoveredObject && (
        <div className="tooltip" style={{top: y, left: x}}>
          <div>
            <div>{hoveredObject.properties.statename}</div>
            <div>
              {hoveredObject.properties.from} - {hoveredObject.properties.to}
            </div>
          </div>
        </div>
      )
    );
  }

  _renderOptions() {
    const {year} = this.state;
    return (
        year && (
            <div id="options">
              <div>Year: {year}</div>
              <input type="range" min="1886" max="2017" value={year} onChange={(e) => this._setTime(e.target.value)}/>
            </div>
        )
    );
  }

  render() {
    return (
      <DeckGL
        width="100%"
        height="100%"
        controller={true}
        initialViewState={INITIAL_VIEW_STATE}
        layers={[
          new GeoJsonLayerWithFilter({
            opacity: 0.5,
            pickable: true,
            autoHighlight: true,
            data: SAMPLE_CSHAPES,
            stroked: true,
            filled: true,
            extruded: false,
            wireframe: true,
            lineWidthScale: 20,
            lineWidthMinPixels: 1,
            getFillColor: f => [127, 127, 127],
            getLineColor: f => [255, 255, 255],
            getElevation: f => (f.properties.from - 1886) * 1000,
            getFilterValue: 0,
            onHover: this._onHover
          })
        ]}
      >
        {this._renderTooltip}
        {this._renderOptions}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
