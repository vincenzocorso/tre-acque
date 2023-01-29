import React from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Stack from "@mui/material/Stack";
import Menu from "@mui/material/Menu";

export default class AddFountainForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
    };
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onConfirm(this.state.name);
  }

  handleAbort(event) {
    event.preventDefault();
    this.props.onCancel();
  }

  render() {
    return (
      <Menu
        open={true}
        onClose={() => this.props.onClose()}
        anchorReference="anchorPosition"
        anchorPosition={{ top: this.props.mouseY, left: this.props.mouseX }}
      >
        <form onSubmit={(event) => this.handleSubmit(event)}>
          <Stack
            direction="column"
            spacing={2}
            style={{ paddingLeft: "5px", paddingRight: "5px" }}
          >
            <TextField
              onChange={(event) => this.setState({ name: event.target.value })}
              onKeyDown={(event) => event.stopPropagation()}
              label="Fountain Name"
              variant="outlined"
            />
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="center"
            >
              <Button onClick={() => this.props.onCancel()} variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="contained" endIcon={<AddIcon />}>
                Add
              </Button>
            </Stack>
          </Stack>
        </form>
      </Menu>
    );
  }
}
