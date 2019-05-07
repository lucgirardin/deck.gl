import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {MapController, FlyToInterpolator, TRANSITION_EVENTS} from 'deck.gl';
import {StaticMap} from 'react-map-gl';
import GeoJsonLayerWithFilter from './geojson-layer';

const SAMPLE_GEOEPR = 'rfe.geojson';

const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoibHVjZ2lyYXJkaW4iLCJhIjoiY2pyOTRiNWNiMDY0azQzcnBlczAxN2Y3YiJ9.DWErygTDXS_ludBsSNyPTw';

const interruptionStyles = [
  {
    title: 'BREAK',
    style: TRANSITION_EVENTS.BREAK
  },
  {
    title: 'SNAP_TO_END',
    style: TRANSITION_EVENTS.SNAP_TO_END
  },
  {
    title: 'IGNORE',
    style: TRANSITION_EVENTS.IGNORE
  }
];

const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 2,
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
      year: 2017,
      viewState: {
        latitude: 0,
        longitude: 0,
        zoom: 2.1,
        bearing: 0,
        pitch: 60
      }
    };

    this._interruptionStyle = TRANSITION_EVENTS.BREAK;

    this.state.layers = this.createLayers(2017);
    this._onHover = this._onHover.bind(this);
    this._setTime = this._setTime.bind(this);
    this._animate = this._animate.bind(this);
    this._easeTo = this._easeTo.bind(this);
    this._renderCaption = this._renderCaption.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
    this._renderOptions = this._renderOptions.bind(this);
    this.redraw = this.redraw.bind(this);
    this.createLayers = this.createLayers.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  _easeTo(long, lat, z) {
    this.setState({
      viewState: {
        ...this.state.viewState,
        longitude: long,
        latitude: lat,
        zoom: z,
        // pitch: 0,
        // bearing: 0,
        transitionDuration: 8000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionInterruption: this._interruptionStyle
      }
    });
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
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
    const {pointerX, pointerY, hoveredObject} = this.state || {};
    return (
      hoveredObject && (
        <div className="tooltip" style={{top: pointerY, left: pointerX}}>
          <div>
            <div>
              {hoveredObject.properties.countryname} ({hoveredObject.properties.gwid})
            </div>
            <div>
              {hoveredObject.properties.groupname} ({hoveredObject.properties.gwgroupid})
            </div>
            <div>{hoveredObject.properties.year}</div>
            <div>
              {hoveredObject.properties.statusname} ({hoveredObject.properties.statusid})
            </div>
            <div>
              Relevant: {hoveredObject.properties.isrelevant}, Statewide:{' '}
              {hoveredObject.properties.geo_statewide}
            </div>
          </div>
        </div>
      )
    );
  }

  _renderCaption() {
    const {year} = this.state;
    return (
      <div className="caption">
        <div>
          <div>{year}</div>
        </div>
      </div>
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
            <button type="button" onClick={e => this.startAnimating(1)}>
              Animate
            </button>
            <button type="button" onClick={e => this._easeTo(-90.5069, 14.6349, 5)}>
              Guatemala
            </button>
            <button type="button" onClick={e => this._easeTo(80.7718, 7.8731, 5)}>
              Sri Lanka
            </button>
            <button type="button" onClick={e => this._easeTo(8.6753, 9.082, 5)}>
              Nigeria
            </button>
            <button type="button" onClick={e => this._easeTo(8.2275, 46.8182, 5)}>
              Switzerland
            </button>
            <button type="button" onClick={e => this._easeTo(113.9213, -0.7893, 4)}>
              Indonesia
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
      if (item.geometry != undefined && item.properties.year == t) {
        return false;
      }
      return true;
    }

    const COLOR_SCALE = [
      [0, 104, 55], // Monopoly
      [25, 150, 68], // Dominant
      [124, 198, 97], // Senior partner
      [179, 222, 114], // Junior partner
      [253, 254, 189], // Self-exclusion
      [248, 125, 78], // Powerless
      [215, 30, 30], // Discriminated
      [165, 0, 38] // State collapse
    ];

    function colorScale(status) {
      if (status == undefined || status == null) {
        return [100, 100, 100];
      }
      const x = status - 1;
      if (x < 0) {
        return [100, 100, 100];
      }
      if (x > COLOR_SCALE.length - 1) {
        return [100, 100, 100];
      }
      return COLOR_SCALE[x];
    }

    console.log('Redrawing at ' + t);
    const layer = new GeoJsonLayerWithFilter({
      id: 'active',
      filter: filterActive,
      data: SAMPLE_GEOEPR,
      opacity: 0.5,
      stroked: true,
      filled: true,
      extruded: true,
      wireframe: false,
      lineWidthScale: 1,
      lineWidthMinPixels: 1,
      // fp64: true,
      // lightSettings: LIGHT_SETTINGS,
      getElevation: f => (f.properties.statusid + 1) * 5000,
      // getFillColor: f=> colorScale(f.properties.growth),
      // getFillColor: f  => [t / 10, t / 10, t / 10],
      getFillColor: f => colorScale(f.properties.statusid),
      getLineColor: f => [255, 255, 255],
      getFilterValue: f => f.properties.to,
      updateTriggers: {
        getFillColor: t,
        getElevation: t,
        data: t
      },
      getLineWidth: 1,
      pickable: false,
      picking: false,
      autoHighlight: false,
      onHover: info => this.setState({
        hoveredObject: info.object,
        pointerX: info.x,
        pointerY: info.y
      }),
      dataChanged: true,
      parameters: {
        depthTest: false
      }
    });

    const trail = 5;

    function filterChanged(item, props) {
      if (
        item.geometry != undefined &&
        item.properties.from <= t &&
        item.properties.from >= t - trail
      ) {
        return false;
      }
      return true;
    }

    // const layer2 = new GeoJsonLayerWithFilter({
    //   id: 'changed',
    //   filter: filterChanged,
    //   data: SAMPLE_GEOEPR,
    //   opacity: 1,
    //   stroked: true,
    //   filled: true,
    //   extruded: false,
    //   wireframe: true,
    //   lineWidthScale: 20,
    //   lineWidthMinPixels: 2,
    //   // fp64: true,
    //   // lightSettings: LIGHT_SETTINGS,
    //   getElevation: f => (f.properties.from - 1946) * 3000,
    //   // getFillColor: f=> colorScale(f.properties.growth),
    //   // getFillColor: f => [t / 10, t / 10, t / 10],
    //   getFillColor: f => [
    //     255,
    //     this.getColor(t, f, trail),
    //     this.getColor(t, f, trail),
    //     this.getAlpha(t, f, trail)
    //   ],
    //   getLineColor: f => [
    //     255,
    //     this.getColor(t, f, trail),
    //     this.getColor(t, f, trail),
    //     this.getAlpha(t, f, trail)
    //   ],
    //   getFilterValue: f => f.properties.to,
    //   updateTriggers: {
    //     getFillColor: t,
    //     getElevation: t,
    //     data: t
    //   },
    //   getLineWidth: 10,
    //   pickable: false,
    //   autoHighlight: false
    //   // onHover: this._onHover,
    //   // dataChanged: true
    // });

    return [layer];
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
    const {viewState} = this.state;
    const {year} = this.state;
    const {layers} = this.state;
    console.log('Rendering at ' + year + ' for ' + layers);

    if (this.deckgl === undefined) {
      this.deckGL = (
        <DeckGL
          width="100%"
          height="100%"
          controller={MapController}
          viewState={viewState}
          initialViewState={INITIAL_VIEW_STATE}
          layers={layers}
          onViewStateChange={this._onViewStateChange}
        >
          {/*          <StaticMap
            mapStyle="mapbox://styles/mapbox/dark-v9"
            mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          />*/}
          {this._renderTooltip}
          {this._renderOptions}
          {this._renderCaption}
        </DeckGL>
      );
    }

    return this.deckGL;
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
