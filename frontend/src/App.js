import React from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import ContextMenu from "./components/ContextMenu";
import Pin from "./components/Pin";
import FountainPopup from "./components/FountainPopup";
import SearchArea from "./components/SearchArea";
import axios from "axios";
import OverlayControls from "./components/OverlayControls";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      viewState: null,
      contextMenu: null,
      fountains: {},
      currentFountain: null,
      voted: new Set(),
      searchLatitude: null,
      searchLongitude: null,
      searchRadius: null,
      applyFilter: false,
      highlightedFountains: [],
    };
  }

  setViewState(viewState) {
    this.setState({ viewState: viewState });
  }

  // Make a GET request to retrieve all fountains
  async componentDidMount() {
    const getFountainsUrl = `http://${window.__RUNTIME_CONFIG__.FOUNTAIN_SERVICE_API}/fountains`;
    console.log(`Sending GET request to ${getFountainsUrl}`);

    await axios
      .get(getFountainsUrl)
      .then((res) => {
        const fountains = res.data;
        this.setState({
          fountains: fountains.reduce((accumulator, fountain) => {
            accumulator[fountain.id] = fountain;
            return accumulator;
          }, {}),
        });
      })
      .catch((error) =>
        console.log(`An error occured with the request: ${error}`)
      );

    console.log(this.state.fountains);
  }

  // Open a context menu to create a new fountain
  openContextMenu(event) {
    event.preventDefault();
    const contextMenu =
      this.state.contextMenu === null
        ? {
            mouseX: event.point.x,
            mouseY: event.point.y,
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat,
          }
        : null;
    this.setState({ contextMenu: contextMenu });
  }

  // Close the context menu
  closeContextMenu() {
    this.setState({ contextMenu: null });
  }

  // Make a POST request to create a new fountain
  async makeAddFountainRequest(name) {
    const addFountainUrl = `http://${window.__RUNTIME_CONFIG__.FOUNTAIN_SERVICE_API}/fountains`;
    const requestBody = {
      name: name,
      latitude: this.state.contextMenu.latitude,
      longitude: this.state.contextMenu.longitude,
    };
    console.log(`Sending POST request to ${addFountainUrl}`);

    await axios
      .post(addFountainUrl, requestBody)
      .then((res) => {
        const fountain = res.data;
        const fountains = this.state.fountains;
        fountains[fountain.id] = fountain;
        this.setState({ fountains: fountains });
        console.log(`Added fountain ${fountain.id}`);
      })
      .catch((error) =>
        console.log(`An error occured with the request: ${error}`)
      );

    this.closeContextMenu();
  }

  // Make a DELETE request to delete a fountain
  makeDeleteFountainRequest(fountainId) {
    const deleteFountainUrl = `http://${window.__RUNTIME_CONFIG__.FOUNTAIN_SERVICE_API}/fountains/${fountainId}`;
    console.log(`Sending DELETE request to ${deleteFountainUrl}`);

    axios
      .delete(deleteFountainUrl)
      .then((_) => {
        const fountains = this.state.fountains;
        delete fountains[fountainId];
        this.setState({ fountains: fountains, currentFountain: null });
        console.log(`Deleted fountain ${fountainId}`);
      })
      .catch((error) =>
        console.log(`An error occured with the request: ${error}`)
      );
  }

  getMarkerColor(fountainId) {
    const blue = "#0066ff";
    const gray = "#808080";
    if (this.state.applyFilter) {
      return this.state.highlightedFountains.includes(fountainId) ? blue : gray;
    }
    return blue;
  }

  // Get fountain markers
  renderMarkers() {
    return Object.values(this.state.fountains).map((fountain) => (
      <Marker
        key={fountain.id}
        longitude={fountain.longitude}
        latitude={fountain.latitude}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          this.setState({ currentFountain: fountain });
        }}
      >
        <Pin color={this.getMarkerColor(fountain.id)} />
      </Marker>
    ));
  }

  handleVote(fountainId) {
    const voted = this.state.voted;
    voted.add(fountainId);
    this.setState({ voted: voted });
  }

  async applySearchFilter(address, radius) {
    const geocoderUrl = encodeURI(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${window.__RUNTIME_CONFIG__.MAPBOX_TOKEN}`
    );
    console.log(`Sending GET request to ${geocoderUrl}`);

    const result = await axios.get(geocoderUrl);
    const [longitude, latitude] = result.data.features[0].center;
    const viewState = {
      longitude: longitude,
      latitude: latitude,
      zoom: 16,
    };

    const getFountainInAreaUrl = `http://${window.__RUNTIME_CONFIG__.FOUNTAIN_SERVICE_API}/fountains?longitude=${longitude}&latitude=${latitude}&radius=${radius}`;
    console.log(`Sending GET request to ${getFountainInAreaUrl}`);

    const fountains = await axios.get(getFountainInAreaUrl);
    const fountainIds = fountains.data.map((fountain) => fountain.id);
    console.log(`Fountains in area: ${fountainIds}`);

    this.setState({
      searchLongitude: longitude,
      searchLatitude: latitude,
      searchRadius: radius,
      viewState: viewState,
      highlightedFountains: fountainIds,
      applyFilter: true,
    });
  }

  render() {
    return (
      <div>
        <Map
          onContextMenu={(event) => this.openContextMenu(event)}
          initialViewState={{
            longitude: 9.1859243,
            latitude: 45.4654219,
            zoom: 14,
          }}
          {...this.state.viewState}
          onMove={(event) => this.setViewState(event.viewState)}
          style={{ width: "100vw", height: "100vh" }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxAccessToken={window.__RUNTIME_CONFIG__.MAPBOX_TOKEN}
        >
          {this.renderMarkers()}

          {this.state.currentFountain && (
            <FountainPopup
              longitude={this.state.currentFountain.longitude}
              latitude={this.state.currentFountain.latitude}
              fountainId={this.state.currentFountain.id}
              fountainName={this.state.currentFountain.name}
              onClose={() => this.setState({ currentFountain: null })}
              onDelete={() =>
                this.makeDeleteFountainRequest(this.state.currentFountain.id)
              }
              onVote={() => this.handleVote(this.state.currentFountain.id)}
              canVote={!this.state.voted.has(this.state.currentFountain.id)}
            />
          )}

          {this.state.applyFilter && (
            <SearchArea
              longitude={this.state.searchLongitude}
              latitude={this.state.searchLatitude}
              radius={this.state.searchRadius}
            />
          )}

          {this.state.contextMenu !== null && (
            <ContextMenu
              mouseX={this.state.contextMenu.mouseX}
              mouseY={this.state.contextMenu.mouseY}
              onConfirm={(name) => this.makeAddFountainRequest(name)}
              onCancel={() => this.closeContextMenu()}
              onClose={() => this.closeContextMenu()}
            />
          )}
        </Map>

        <OverlayControls
          onSearch={(address, radius) =>
            this.applySearchFilter(address, radius)
          }
          onSearchBarClose={() => this.setState({ applyFilter: false })}
        />
      </div>
    );
  }
}
