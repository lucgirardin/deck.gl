import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import GeoJsonLayerWithFilter from './geojson-layer';

const SAMPLE_GEOEPR = 'GeoEPR-2018.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 1,
  bearing: 0,
  pitch: 0
};

const animation = {
  stop: false,
  frameCount: 0,
  // var $results = $("#results");
  fps: null,
  fpsInterval: null,
  startTime: null,
  now: null,
  then: null,
  elapsed: null
};

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredObject: null,
      year: 2017
    };
    this.state.layers = this.createLayers(2017);
    this._onHover = this._onHover.bind(this);
    this._setTime = this._setTime.bind(this);
    this._animate = this._animate.bind(this);
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

  startAnimating(fps) {
    animation.fpsInterval = 1000 / fps;
    animation.then = Date.now();
    animation.startTime = animation.then;
    this.animate();
  }

  animate() {
    // request another frame

    window.requestAnimationFrame(this.animate.bind(this));

    // calc elapsed time since last loop

    animation.now = Date.now();
    animation.elapsed = animation.now - animation.then;

    // if enough time has elapsed, draw the next frame

    if (animation.elapsed > animation.fpsInterval) {
      // Get ready for next frame by setting then=now, but also adjust for your
      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
      animation.then = animation.now - (animation.elapsed % animation.fpsInterval);

      this._animate();
    }
  }
  _animate() {
    // this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));

    var t = this.state.year + 1;
    if (t > 2017) {
      t = 1946;
    }
    this._setTime(t);
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;
    return (
      hoveredObject && (
        <div className="tooltip" style={{top: y, left: x}}>
          <div>
            <div>{hoveredObject.properties.group}</div>
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
          <div>
            <input
              type="range"
              min="1946"
              max="2017"
              value={year}
              className="timeslider"
              onChange={e => this._setTime(e.target.value)}
            />
            <button type="button" onClick={e => this.startAnimating(3)}>
              Animate
            </button>
          </div>
        </div>
      )
    );
  }

  createLayers(t) {
    const {year} = this.state;

    // const t = year;

    function filterActive(item, props) {
      if (item.geometry != undefined && item.properties.from <= t && item.properties.to >= t) {
        return false;
      }
      return true;
    }

    console.log('Redrawing at ' + t);
    const layer = new GeoJsonLayerWithFilter({
      id: 'active',
      filter: filterActive,
      data: SAMPLE_GEOEPR,
      opacity: 0.5,
      stroked: true,
      filled: true,
      extruded: false,
      wireframe: true,
      lineWidthScale: 20,
      lineWidthMinPixels: 1,
      // fp64: true,
      // lightSettings: LIGHT_SETTINGS,
      getElevation: f => (f.properties.from - 1946) * 3000,
      // getFillColor: f=> colorScale(f.properties.growth),
      // getFillColor: f  => [t / 10, t / 10, t / 10],
      getFillColor: f => [100, 100, 100],
      getLineColor: f => [255, 255, 255],
      getFilterValue: f => f.properties.to,
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

    const trail = 5;

    function filterChanged(item, props) {
      if (item.geometry != undefined && item.properties.from <= t && item.properties.from >= t - trail) {
        return false;
      }
      return true;
    }

    const layer2 = new GeoJsonLayerWithFilter({
      id: 'changed',
      filter: filterChanged,
      data: SAMPLE_GEOEPR,
      opacity: 1,
      stroked: true,
      filled: true,
      extruded: false,
      wireframe: true,
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      // fp64: true,
      // lightSettings: LIGHT_SETTINGS,
      getElevation: f => (f.properties.from - 1946) * 3000,
      // getFillColor: f=> colorScale(f.properties.growth),
      // getFillColor: f => [t / 10, t / 10, t / 10],
      getFillColor: f => [
        255,
        this.getColor(t, f, trail),
        this.getColor(t, f, trail),
        this.getAlpha(t, f, trail)
      ],
      getLineColor: f => [
        255,
        this.getColor(t, f, trail),
        this.getColor(t, f, trail),
        this.getAlpha(t, f, trail)
      ],
      getFilterValue: f => f.properties.to,
      updateTriggers: {
        getFillColor: t,
        getElevation: t,
        data: t
      },
      getLineWidth: 10,
      pickable: false,
      autoHighlight: false
      // onHover: this._onHover,
      // dataChanged: true
    });

    return [layer, layer2];
  }

  getColor(t, f, trail) {
    const elapsed = t - f.properties.from;
    const ratio = 1 - elapsed / trail;
    const number = 255 * Math.pow(ratio, 3);
    // console.log(t + ", " + f.properties.gwsyear + " -> " + elapsed + ", " + number);
    return 255 - number;
  }

  getAlpha(t, f, trail) {
    const elapsed = t - f.properties.from;
    const ratio = 1 - elapsed / trail;
    const number = 255 * Math.pow(ratio, 3);
    // console.log(t + ", " + f.properties.gwsyear + " -> " + elapsed + ", " + number);
    return number;
  }

  redraw() {
    // this.setState({layers: this.createLayers()});
  }

  render() {
    const {year} = this.state;
    const {layers} = this.state;
    console.log('Rendering at ' + year + ' for ' + layers);

    if (this.deckgl === undefined) {
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
