import Button from "@material-ui/core/Button";
import * as React from "react";

const initialState = {
  accessToken: undefined as string | undefined
};

class App extends React.Component<{}, typeof initialState> {
  authenticate = () => {
    window.location.href =
      "https://accounts.spotify.com/authorize?client_id=af4c2b7672ec4460b8384790410d8658&redirect_uri=http:%2F%2Flocalhost:3000&scope=user-top-read&response_type=token";
  };

  public render() {
    return (
      <Button variant="contained" color="primary" onClick={this.authenticate}>
        Authenticate with Spotify
      </Button>
    );
  }
}

export default App;
