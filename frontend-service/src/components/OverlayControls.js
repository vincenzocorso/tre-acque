import React from "react";
import EmailIcon from "@mui/icons-material/Email";
import Fab from "@mui/material/Fab";
import Stack from "@mui/material/Stack";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import SubscriptionDialog from "./SubscriptionDialog";
import SearchBar from "./SearchBar";

export default class OverlayControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchBarOpen: false,
      subscriptionDialogOpen: false,
    };
  }

  toggleSearchBar() {
    this.setState({ searchBarOpen: !this.state.searchBarOpen }, () => {
      if (!this.state.searchBarOpen) this.props.onSearchBarClose();
    });
  }

  openSubscriptionDialog() {
    this.setState({ subscriptionDialogOpen: true });
  }

  closeSubscriptionDialog() {
    this.setState({ subscriptionDialogOpen: false });
  }

  render() {
    return (
      <div>
        <Stack
          direction="column"
          spacing={2}
          justifyContent="center"
          sx={{ position: "absolute", bottom: "30px", right: "20px" }}
        >
          <Fab onClick={() => this.toggleSearchBar()} color="primary">
            {this.state.searchBarOpen ? (
              <FilterAltOffIcon />
            ) : (
              <FilterAltIcon />
            )}
          </Fab>
          <Fab onClick={() => this.openSubscriptionDialog()} color="primary">
            <EmailIcon />
          </Fab>
        </Stack>

        <SearchBar
          open={this.state.searchBarOpen}
          onSearch={this.props.onSearch}
        />

        <SubscriptionDialog
          open={this.state.subscriptionDialogOpen}
          onSubscribe={() => this.closeSubscriptionDialog()}
          onCancel={() => this.closeSubscriptionDialog()}
        />
      </div>
    );
  }
}
