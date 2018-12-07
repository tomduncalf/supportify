import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  Grid,
  Select,
  Button,
  FormControl,
  InputLabel,
  MenuItem
} from "@material-ui/core";
import * as React from "react";
import SpotifyWebApi from "spotify-web-api-js";

const initialState = {
  authenticated: false,
  limit: 20,
  timeRange: "medium_term",
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
        this.spotifyApi.getMyTopArtists({
          time_range: this.state.timeRange,
          limit: this.state.limit
        }),
        this.spotifyApi.getMyTopTracks({
          time_range: this.state.timeRange,
          limit: this.state.limit
        })
      ]);

      this.setState({ topArtists, topTracks });
    } catch (e) {
      console.error(e); //tslint:disable-line
      this.setState({ authenticated: false });
    }
  };

  searchBandcamp = (query: string) => {
    window.open("https://bandcamp.com/search?q=" + encodeURIComponent(query));
  };

  renderHeader = () => (
    <Grid item xs={12}>
      <FormControl>
        <InputLabel htmlFor="time-range">Time range</InputLabel>
        <Select
          value={this.state.timeRange}
          onChange={this.handleTimeRangeChange}
          inputProps={{
            name: "time-range"
          }}
          autoWidth
        >
          <MenuItem value="short_term">Short term</MenuItem>
          <MenuItem value="medium_term">Medium term</MenuItem>
          <MenuItem value="long_term">Long term</MenuItem>
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel htmlFor="limit">Items</InputLabel>
        <Select
          value={this.state.limit}
          onChange={this.handleLimitChange}
          inputProps={{
            name: "limit"
          }}
          autoWidth
        >
          <MenuItem value="10">10</MenuItem>
          <MenuItem value="20">20</MenuItem>
          <MenuItem value="35">35</MenuItem>
          <MenuItem value="50">50</MenuItem>
        </Select>
      </FormControl>
    </Grid>
  );

  handleTimeRangeChange = (timeRange: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ timeRange: timeRange.target.value }, () => this.getData());
  };

  handleLimitChange = (limit: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ limit: parseInt(limit.target.value, 10) }, () =>
      this.getData()
    );
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
            {this.renderHeader()}
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

        <p>
          Built by <a href="https://twitter.com/tomduncalf">Tom Duncalf</a>.
          Source code available on{" "}
          <a href="https://github.com/tomduncalf/supportify">Github</a>.
        </p>
      </React.Fragment>
    );
  }
}

export default App;
