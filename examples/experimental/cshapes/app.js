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
      year: 2017,
    };
    this.state.layers = this.createLayers(2017);
    this._onHover = this._onHover.bind(this);
    this._setTime = this._setTime.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
    this._renderOptions = this._renderOptions.bind(this);
    this.redraw = this.redraw.bind(this);
    this.createLayers = this.createLayers.bind(this);
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _setTime(t) {
    this.setState({
      year: t,
      layers: this.createLayers(t)
    });
    // const {time} = this.state;
    // t = date;
    this.redraw();
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
          <input
            type="range"
            min="1886"
            max="2017"
            value={year}
            class="timeslider"
            onChange={e => this._setTime(e.target.value)}
          />
        </div>
      )
    );
  }

  createLayers(t) {
    const {year} = this.state;

    // const t = year;

    function filterActive(item, props) {
      if (item.properties.from <= t && item.properties.to >= t) {
        return false;
      }
      return true;
    }

    console.log('Redrawing at ' + t);
    const layer = new GeoJsonLayerWithFilter({
      id: 'active',
      filter: filterActive,
      data: SAMPLE_CSHAPES,
      opacity: 0.5,
      stroked: true,
      filled: true,
      extruded: false,
      wireframe: true,
      lineWidthScale: 20,
      lineWidthMinPixels: 1,
      // fp64: true,
      // lightSettings: LIGHT_SETTINGS,
      getElevation: f => (f.properties.from - 1886) * 3000,
      // getFillColor: f=> colorScale(f.properties.growth),
      // getFillColor: f => [t / 10, t / 10, t / 10],
      getFillColor: f => [100, 100, 100],
      getLineColor: f => [255, 255, 255],
      getFilterValue: f => f.props.to,
      updateTriggers: {
        getFillColor: t,
        getElevation: t,
        data: t
      },
      getLineWidth: 10,
      pickable: true,
      autoHighlight: true,
      onHover: this._onHover,
      dataChanged: true
    });

    function filterChanged(item, props) {
      if (item.properties.from >= t && item.properties.from <=t) {
        return false;
      }
      return true;
    }

    const layer2 = new GeoJsonLayerWithFilter({
      id: 'changed',
      filter: filterChanged,
      data: SAMPLE_CSHAPES,
      opacity: 0.5,
      stroked: true,
      filled: false,
      extruded: false,
      wireframe: true,
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      // fp64: true,
      // lightSettings: LIGHT_SETTINGS,
      getElevation: f => (f.properties.from - 1886) * 3000,
      // getFillColor: f=> colorScale(f.properties.growth),
      // getFillColor: f => [t / 10, t / 10, t / 10],
      getFillColor: f => [255, 0, 0],
      getLineColor: f => [255, 0, 0],
      getFilterValue: f => f.props.to,
      updateTriggers: {
        getFillColor: t,
        getElevation: t,
        data: t
      },
      getLineWidth: 10,
      pickable: false,
      autoHighlight: false,
      // onHover: this._onHover,
      // dataChanged: true
    });

    return [layer, layer2];
  }

  redraw() {
    // this.setState({layers: this.createLayers()});
  }

  render() {
    const {year} = this.state;
    const {layers} = this.state;
    console.log('Rendering at ' + year + ' for ' + layers);

    if(this.deckgl === undefined) {
      this.deckGL = (
          <DeckGL
              width="100%"
              height="100%"
              controller={true}
              initialViewState={INITIAL_VIEW_STATE}
              layers={layers}
          >
            {this._renderTooltip}
            {this._renderOptions}
          </DeckGL>
      );
    }

    return this.deckGL;
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
