import React from "react";
import { Source, Layer } from "react-map-gl";
import circle from "@turf/circle";

const style = {
  id: "data",
  type: "fill",
  paint: {
    "fill-opacity": 0.5,
    "fill-color": "#00FFFF",
  },
};

export default class SearchArea extends React.Component {
  createCircle() {
    const centerPoint = [this.props.longitude, this.props.latitude];
    const options = {
      steps: 64,
      units: "meters",
    };
    return circle(centerPoint, this.props.radius, options);
  }

  render() {
    return (
      <Source type="geojson" data={this.createCircle()}>
        <Layer {...style} />
      </Source>
    );
  }
}
