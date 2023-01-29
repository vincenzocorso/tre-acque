import React from "react";
import { Popup } from "react-map-gl";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import axios from "axios";

export default class FountainPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      averageRating: null,
    };
  }

  componentDidMount() {
    this.updateFountainRating();
  }

  updateFountainRating() {
    const fountainId = this.props.fountainId;
    const getRatingUrl = `http://${window.__RUNTIME_CONFIG__.RATING_SERVICE_API}/fountains/${fountainId}/rating`;
    console.log(`Sending GET request to ${getRatingUrl}`);

    axios
      .get(getRatingUrl)
      .then((res) => {
        const rating = res.data;
        this.setState({ averageRating: rating });
        console.log(`Updated rating for fountain ${fountainId} to ${rating}`);
      })
      .catch((error) =>
        console.log(`An error occured with the request: ${error}`)
      );
  }

  postNewRating(rating) {
    const fountainId = this.props.fountainId;
    const postRatingUrl = `http://${window.__RUNTIME_CONFIG__.RATING_SERVICE_API}/fountains/${fountainId}/rating`;
    console.log(`Sending POST request to ${postRatingUrl}`);

    axios
      .post(postRatingUrl, rating, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
      .then((_) => this.updateFountainRating())
      .catch((error) =>
        console.log(`An error occured with the request: ${error}`)
      );
  }

  render() {
    return (
      <Popup
        anchor="top"
        longitude={Number(this.props.longitude)}
        latitude={Number(this.props.latitude)}
        focusAfterOpen={false}
        onClose={() => this.props.onClose()}
      >
        <Stack direction="column" spacing={1} justifyContent="center">
          <Typography variant="h5" textAlign={"center"} gutterBottom>
            {this.props.fountainName}
          </Typography>
          <Rating
            value={this.state.averageRating}
            name={this.props.fountainId}
            onChange={(event, newValue) => {
              this.postNewRating(newValue);
              this.props.onVote();
            }}
            readOnly={!this.props.canVote}
          />
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="flex-end"
          >
            <IconButton
              onClick={() => this.props.onDelete()}
              aria-label="delete"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Popup>
    );
  }
}
