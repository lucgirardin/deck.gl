import {GeoJsonLayer} from '@deck.gl/layers';
import {getGeojsonFeatures, separateGeojsonFeatures} from './geojson';

// const defaultProps = {
//   getFilterValue: 1,
//   filterRange: [0, 2]
// };

export default class GeoJsonLayerWithFilter extends GeoJsonLayer {
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

GeoJsonLayerWithFilter.defaultProps = GeoJsonLayer.defaultProps;
