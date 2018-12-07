import { Table, TableRow, TableBody, TableCell, Grid } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import * as React from "react";
import SpotifyWebApi from "spotify-web-api-js";

const initialState = {
  authenticated: false,
  topArtists: undefined as SpotifyApi.UsersTopArtistsResponse | undefined,
  topTracks: undefined as SpotifyApi.UsersTopTracksResponse | undefined
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
    try {
      const [topArtists, topTracks] = await Promise.all([
        this.spotifyApi.getMyTopArtists(),
        this.spotifyApi.getMyTopTracks()
      ]);

      this.setState({ topArtists, topTracks }); // tslint:disable-line
    } catch (e) {
      this.setState({ authenticated: false });
    }
  };

  searchBandcamp = (query: string) => {
    window.open("https://bandcamp.com/search?q=" + encodeURIComponent(query));
  };

  renderTopArtists = () => {
    const { topArtists } = this.state;
    if (!topArtists) return null;

    return (
      <Grid item xs={12} sm={6}>
        <h2>Top Artists</h2>
        <Table>
          <TableBody>
            {topArtists.items.map(artist => (
              <TableRow>
                <TableCell>{artist.name}</TableCell>
                <TableCell numeric>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => this.searchBandcamp(`"${artist.name}"`)}
                  >
                    Search on Bandcamp
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    );
  };

  renderTopTracks = () => {
    const { topTracks } = this.state;
    if (!topTracks) return null;

    return (
      <Grid item sm={12} md={6}>
        <h2>Top Tracks</h2>
        <Table>
          <TableBody>
            {topTracks.items.map(track => {
              const artist = track.artists.map(a => a.name).join(", ");
              const name = `${artist} — ${track.name}`;
              const search = `"${track.name}" "${artist}"`;

              return (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell numeric>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => this.searchBandcamp(search)}
                    >
                      Search on Bandcamp
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Grid>
    );
  };

  render() {
    const { authenticated } = this.state;

    return (
      <React.Fragment>
        <h1>Supportify</h1>
        <h2>
          Support the artists you listen to on Spotify by buying their music on
          Bandcamp
        </h2>

        {authenticated ? (
          <Grid container spacing={24}>
            {this.renderTopArtists()}
            {this.renderTopTracks()}
          </Grid>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={this.authenticate}
          >
            Authenticate with Spotify
          </Button>
        )}
      </React.Fragment>
    );
  }
}

export default App;
