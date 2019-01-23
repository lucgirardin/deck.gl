import {GeoJsonLayer} from '@deck.gl/layers';
import {getGeojsonFeatures, separateGeojsonFeatures} from './geojson';

// const defaultProps = {
//   getFilterValue: 1,
//   filterRange: [0, 2]
// };

export default class GeoJsonLayerWithFilter extends GeoJsonLayer {
  updateState({oldProps, props, changeFlags}) {
    const layersChanged =
         props.filter !== oldProps.filter;

    console.log("layersChanged " + layersChanged + ": " + (this.props.filter !== props.filter))

    if (layersChanged || changeFlags.dataChanged + this.state) {
      const data = props.data;
      const features = getGeojsonFeatures(data);
      if (layersChanged) {
        this.state.features = separateGeojsonFeatures(features, props.filter);
      } else {
        this.state.features = separateGeojsonFeatures(features, props.filter);
      }
    }
  }
}

GeoJsonLayerWithFilter.defaultProps = GeoJsonLayer.defaultProps;
