import {GeoJsonLayer} from '@deck.gl/layers';
import dataFilter from './data-filter';
import {getGeojsonFeatures, separateGeojsonFeatures} from './geojson';

// const defaultProps = {
//   getFilterValue: 1,
//   filterRange: [0, 2]
// };

export default class GeoJsonLayerWithFilter extends GeoJsonLayer {
  getShaders() {
    const shaderSettings = super.getShaders();

    shaderSettings.modules.push(dataFilter);

    shaderSettings.inject = {
      'vs:#decl': `
attribute float instanceFilterValue;
`,
      'vs:#main-end': `
filter_setValue(instanceFilterValue);
`,
      'fs:#main-end': `
gl_FragColor = filter_filterColor(gl_FragColor);
`
    };
    return shaderSettings;
  }

  initializeState() {
    super.initializeState();

    // this.getAttributeManager().addInstanced({
    //   instanceFilterValue: {size: 1, accessor: 'getFilterValue'}
    // });
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged) {
      const data = props.data;
      const features = getGeojsonFeatures(data);
      this.state.features = separateGeojsonFeatures(features, filterByTime);
    }
  }
}

function filterByTime(item) {
  if (item.properties.from <= 2012 && item.properties.to >= 2012) {
    return false;
  }
  return true;
}

// GeoJsonLayerWithFilter.defaultProps = GeoJsonLayer.defaultProps;
