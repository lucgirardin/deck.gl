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
      geojsonLayer: null
    };
    this._onHover = this._onHover.bind(this);
    this._setTime = this._setTime.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
    this._renderOptions = this._renderOptions.bind(this);
    this.redraw = this.redraw.bind(this);
    // this.render = this.render.bind(this);
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _setTime(t) {
    this.setState({year: t});
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
            onChange={e => this._setTime(e.target.value)}
          />
        </div>
      )
    );
  }

  redraw() {
    const {year} = this.state;

    const t = year;

    function filterByTime(item, props) {
      if (item.properties.from <= year && item.properties.to >= year) {
        return false;
      }
      return true;
    }

    console.log('Redrawing at ' + t);
    const layer = new GeoJsonLayerWithFilter({
      filter: filterByTime,
      data: SAMPLE_CSHAPES,
      opacity: 1,
      stroked: true,
      filled: true,
      extruded: true,
      wireframe: true,
      lineWidthScale: 20,
      lineWidthMinPixels: 1,
      // fp64: true,
      // lightSettings: LIGHT_SETTINGS,
      getElevation: f => (f.properties.from - 1886) * 10000,
      // getFillColor: f=> colorScale(f.properties.growth),
      getFillColor: f => [t / 10, t / 10, t / 10],
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
    // layer.setState({year: t});

    // const layers =  [geojsonLayer];

    this.setState({geojsonLayer: layer});
    // deckgl.setProps({layers})
  }

  render() {
    const {geojsonLayer, year} = this.state;
    console.log('Rendering at ' + year + ' for ' + geojsonLayer);
    return (
      <DeckGL
        width="100%"
        height="100%"
        controller={true}
        initialViewState={INITIAL_VIEW_STATE}
        layers={[geojsonLayer]}
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
