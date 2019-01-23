import {GeoJsonLayer} from '@deck.gl/layers';
import {getGeojsonFeatures, separateGeojsonFeatures} from './geojson';

// const defaultProps = {
//   getFilterValue: 1,
//   filterRange: [0, 2]
// };

export default class GeoJsonLayerWithFilter extends GeoJsonLayer {
  updateState({oldProps, props, changeFlags}) {
    // if (changeFlags.dataChanged) {
      const data = props.data;
      const features = getGeojsonFeatures(data);
      this.state.features = separateGeojsonFeatures(features, props.filter);
    // }
  }
}

GeoJsonLayerWithFilter.defaultProps = GeoJsonLayer.defaultProps;
