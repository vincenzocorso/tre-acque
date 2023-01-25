import React from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';

export default class AddFountainForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
    }
  }

  render() {
    return <Stack direction="column" spacing={2} style={{paddingLeft: "5px", paddingRight: "5px"}}>
      <TextField onChange={(event) => this.setState({name: event.target.value})} id="outlined-basic" label="Name" variant="outlined" />
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        <Button onClick={() => this.props.onCancel()} variant="outlined">
          Cancel
        </Button>
        <Button onClick={() => this.props.onConfirm(this.state.name)} variant="contained" endIcon={<AddIcon />}>
          Add
        </Button>
      </Stack>
    </Stack>;
  }
}