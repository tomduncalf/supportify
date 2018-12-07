import Button from "@material-ui/core/Button";
import * as React from "react";
import SpotifyWebApi from "spotify-web-api-js";

const initialState = {
  authenticated: false
};

class App extends React.Component<{}, typeof initialState> {
  state = { ...initialState };
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;

  componentDidMount() {
    if (window.location.hash) {
      window.location.hash
        .slice(1)
        .split("&")
        .forEach(kv => {
          const [key, value] = kv.split("=");
          if (key === "access_token") {
            this.setupSpotifyClient(value);
            this.getData();
          }
        });
    }
  }

  authenticate = () => {
    window.location.href =
      "https://accounts.spotify.com/authorize?client_id=af4c2b7672ec4460b8384790410d8658&redirect_uri=http:%2F%2Flocalhost:3000&scope=user-top-read&response_type=token";
  };

  setupSpotifyClient = (accessToken: string) => {
    this.spotifyApi = new SpotifyWebApi();
    this.spotifyApi.setAccessToken(accessToken);

    this.setState({ authenticated: true });
  };

  getData = async () => {
    const [topArtists, topTracks] = await Promise.all([
      this.spotifyApi.getMyTopArtists(),
      this.spotifyApi.getMyTopTracks()
    ]);

    console.log(topArtists, topTracks); // tslint:disable-line
  };

  public render() {
    const { authenticated } = this.state;

    return (
      <div>
        {authenticated ? (
          "authenticated "
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={this.authenticate}
          >
            Authenticate with Spotify
          </Button>
        )}
      </div>
    );
  }
}

export default App;
