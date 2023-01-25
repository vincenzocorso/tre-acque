import React from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Menu from '@mui/material/Menu';
import AddFountainForm from './components/AddFountainForm';
import Pin from './components/Pin';

const MAPBOX_TOKEN = "pk.eyJ1IjoidmluY2Vuem9jb3Jzbzk5IiwiYSI6ImNsZGJmMHY1azA0aGkzb21ia3B6bDhrajAifQ.Wp1Sal6OF5XFWXG7mWdTwg";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      contextMenu: null,
      fountains: {},
      currentFountain: null,
    }
  }

  // Make a GET request to retrieve all fountains
  componentDidMount() {
    const getFountainsUrl = "http://localhost:8080/fountains";
    console.log(`Sending GET request to ${getFountainsUrl}`);

    fetch(getFountainsUrl)
      .then(res => res.json())
      .then(
        (fountains) => this.setState({
          fountains: fountains.reduce((accumulator, fountain) => {
            accumulator[fountain.id] = fountain;
            return accumulator;
          }, {})
        }),
        (error) => console.log(`An error occured with the request: ${error}`)
      ).then(() => console.log(this.state.fountains));
  }

  // Open a context menu to create a new fountain
  openContextMenu(event) {
    event.preventDefault();
    const contextMenu = this.state.contextMenu === null ? {
      mouseX: event.point.x,
      mouseY: event.point.y,
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat
    } : null;
    this.setState({ contextMenu: contextMenu });
  };

  // Close the context menu
  closeContextMenu() {
    this.setState({ contextMenu: null });
  };

  // Make a POST request to create a new fountain
  makeAddFountainRequest(name) {
    const addFountainUrl = "http://localhost:8080/fountains";
    const requestBody = {
      name: name,
      latitude: this.state.contextMenu.latitude,
      longitude: this.state.contextMenu.longitude
    }
    console.log(`Sending POST request to ${addFountainUrl}`);

    fetch(addFountainUrl, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(res => res.json())
      .then(
        (fountain) => this.addFountain(fountain),
        (error) => console.log(`An error occured with the request: ${error}`)
      )
      .then(() => this.closeContextMenu());
  }

  // Add a fountain to the map
  addFountain(fountain) {
    const fountains = this.state.fountains;
    fountains[fountain.id] = fountain;
    this.setState({ fountains: fountains });
    console.log(`Added fountain ${fountain.id}`);
  }

  // Get fountain markers
  renderMarkers() {
    return Object.values(this.state.fountains).map((fountain) =>
      <Marker
        key={fountain.id}
        longitude={fountain.longitude}
        latitude={fountain.latitude}
        anchor="bottom"
        onClick={e => {
          e.originalEvent.stopPropagation();
          this.setState({ currentFountain: fountain });
        }}
      >
        <Pin />
      </Marker>
    );
  }

  render() {
    return <div>
      <Map
        onContextMenu={(event) => this.openContextMenu(event)}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {this.renderMarkers()}

        {this.state.currentFountain && (
          <Popup
            anchor="top"
            longitude={Number(this.state.currentFountain.longitude)}
            latitude={Number(this.state.currentFountain.latitude)}
            onClose={() => this.setState({ currentFountain: null })}
          >
            <h1>{this.state.currentFountain.name}</h1>
            <p>Latitude: {this.state.currentFountain.latitude} | Longitude: {this.state.currentFountain.longitude}</p>
          </Popup>
        )}
      </Map>
      <Menu
        open={this.state.contextMenu !== null}
        onClose={() => this.closeContextMenu()}
        anchorReference="anchorPosition"
        anchorPosition={
          this.state.contextMenu !== null
            ? { top: this.state.contextMenu.mouseY, left: this.state.contextMenu.mouseX }
            : undefined
        }
      >
        <AddFountainForm onConfirm={(name) => this.makeAddFountainRequest(name)} onCancel={() => this.closeContextMenu()} />
      </Menu>
    </div>
  }
}