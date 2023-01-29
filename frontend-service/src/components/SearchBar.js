import React from "react";
import Slide from "@mui/material/Slide";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Divider from "@mui/material/Divider";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";

const DEFAULT_RADIUS = 100;

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: "",
      radius: DEFAULT_RADIUS,
    };
  }

  setAddress(address) {
    this.setState({ address: address });
  }

  setRadius(radius) {
    this.setState({ radius: radius });
  }

  render() {
    return (
      <Slide
        direction="down"
        in={this.props.open}
        mountOnEnter
        unmountOnExit
        sx={{ position: "absolute", top: "30px" }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minWidth="100vw"
        >
          <Paper component="form" sx={{ p: "3px" }}>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              justifyContent="flex-start"
            >
              <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
              >
                <InputBase
                  sx={{ ml: 1 }}
                  placeholder="Search address"
                  onChange={(event) => this.setAddress(event.target.value)}
                />
                <Slider
                  min={0}
                  max={2000}
                  step={10}
                  defaultValue={DEFAULT_RADIUS}
                  onChange={(event) => this.setRadius(event.target.value)}
                  valueLabelDisplay="auto"
                  size="small"
                  sx={{ width: "80%" }}
                />
              </Stack>
              <Divider sx={{ height: 50 }} orientation="vertical" />
              <IconButton
                type="button"
                sx={{ p: "10px" }}
                onClick={() =>
                  this.props.onSearch(this.state.address, this.state.radius)
                }
              >
                <SearchIcon />
              </IconButton>
            </Stack>
          </Paper>
        </Box>
      </Slide>
    );
  }
}
