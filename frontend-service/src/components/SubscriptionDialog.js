import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import axios from "axios";

export default class SubscriptionDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subscribeFountainAddedEvent: false,
      subscribeFountainDeletedEvent: false,
    };
  }

  applySettings() {
    const fountainAddedEvent = "FOUNTAIN_ADDED_EVENT";
    if (this.state.subscribeFountainAddedEvent) {
      this.subscribe(fountainAddedEvent);
    } else {
      this.unsubscribe(fountainAddedEvent);
    }

    const fountainDeletedEvent = "FOUNTAIN_DELETED_EVENT";
    if (this.state.subscribeFountainDeletedEvent) {
      this.subscribe(fountainDeletedEvent);
    } else {
      this.unsubscribe(fountainDeletedEvent);
    }
  }

  subscribe(event) {
    const subscribeUrl = `http://${window.__RUNTIME_CONFIG__.NOTIFICATION_SERVICE_API}/subscribe`;
    const requestBody = {
      email: this.state.email,
      event: event,
    };
    console.log(`Sending POST request to ${subscribeUrl}`);

    axios
      .post(subscribeUrl, requestBody)
      .then((_) => {
        console.log(`Subscribed to ${event}`);
      })
      .catch((error) => {
        console.log(`An error occured with the request: ${error}`);
      });
  }

  unsubscribe(event) {
    const unsubscribeUrl = `http://${window.__RUNTIME_CONFIG__.NOTIFICATION_SERVICE_API}/unsubscribe`;
    const requestBody = {
      email: this.state.email,
      event: event,
    };
    console.log(`Sending POST request to ${unsubscribeUrl}`);

    axios
      .post(unsubscribeUrl, requestBody)
      .then((_) => {
        console.log(`Unsubscribed to ${event}`);
      })
      .catch((error) => {
        console.log(`An error occured with the request: ${error}`);
      });
  }

  updateSubscriptionFountainAddedEvent(status) {
    this.setState({ subscribeFountainAddedEvent: status });
  }

  updateSubscriptionFountainDeletedEvent(status) {
    this.setState({ subscribeFountainDeletedEvent: status });
  }

  updateEmail(email) {
    this.setState({ email: email });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.applySettings();
    this.props.onSubscribe();
  }

  render() {
    return (
      <Dialog open={this.props.open}>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to new events, please enter your email address here.
          </DialogContentText>
          <form onSubmit={(event) => this.handleSubmit(event)}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Email Address"
              type="email"
              fullWidth
              variant="standard"
              onChange={(event) => {
                this.updateEmail(event.target.value);
              }}
            />
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <DialogContentText>
                Notify me when a new fountain is added
              </DialogContentText>
              <Switch
                checked={this.state.subscribeFountainAddedEvent}
                onChange={(event) =>
                  this.updateSubscriptionFountainAddedEvent(
                    event.target.checked
                  )
                }
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <DialogContentText>
                Notify me when a new fountain is deleted
              </DialogContentText>
              <Switch
                checked={this.state.subscribeFountainDeletedEvent}
                onChange={(event) =>
                  this.updateSubscriptionFountainDeletedEvent(
                    event.target.checked
                  )
                }
              />
            </Stack>
            <DialogActions>
              <Button onClick={() => this.props.onCancel()}>Cancel</Button>
              <Button type="submit">Apply</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}
