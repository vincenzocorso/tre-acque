import React from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Menu from '@mui/material/Menu';
import AddFountainForm from './components/AddFountainForm';
import Pin from './components/Pin';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Rating from '@mui/material/Rating';

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
        (fountain) => {
          const fountains = this.state.fountains;
          fountains[fountain.id] = fountain;
          this.setState({ fountains: fountains });
          console.log(`Added fountain ${fountain.id}`);
        },
        (error) => console.log(`An error occured with the request: ${error}`)
      )
      .then(() => this.closeContextMenu());
  }

  // Make a DELETE request to delete a fountain
  makeDeleteFountainRequest(fountainId) {
    const deleteFountainUrl = `http://localhost:8080/fountains/${fountainId}`;
    console.log(`Sending DELETE request to ${deleteFountainUrl}`);

    fetch(deleteFountainUrl, {
      method: "DELETE",
    })
      .then(res => {
        if (!res.ok) {
          throw Error(res.statusText);
        }
        return res;
      })
      .then(
        (_) => {
          const fountains = this.state.fountains;
          delete fountains[fountainId];
          this.setState({ fountains: fountains, currentFountain: null });
          console.log(`Deleted fountain ${fountainId}`);
        },
        (error) => console.log(`An error occured with the request: ${error}`)
      );
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
            <Stack direction="column" spacing={2} justifyContent="center">
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <Typography variant="h5" gutterBottom>
                  {this.state.currentFountain.name}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <Rating
                  name="no-value"
                  value={0}
                  onChange={(event, newValue) => {
                    console.log(newValue)
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <Typography variant="body1" gutterBottom>
                  Latitude: {this.state.currentFountain.latitude}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <Typography variant="body1" gutterBottom>
                  Longitude: {this.state.currentFountain.longitude}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
                <IconButton onClick={() => this.makeDeleteFountainRequest(this.state.currentFountain.id)} aria-label="delete" color="error">
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Stack>
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