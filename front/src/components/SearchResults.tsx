import type { Artist as ArtistType } from "../types/Artist";
import type { Album as AlbumType } from "../types/Album";
import type { Song as SongType } from "../types/Song";

import ArtistLink from "./ArtistLink";

import AlbumLink from "./AlbumLink";

import Song from "./Song";

import "./SearchResults.css";

interface SearchResultsProps {
  artists: ArtistType[];
  albums: AlbumType[];
  songs: SongType[];
  onSelectArtist: (artistId: number) => void;
  onSelectAlbum: (albumId: number) => void;
  onPlay: (song: SongType) => void;
  onSongMenuOpen: (song: SongType, isAlbumPage: boolean) => void;
  currentSong: SongType | null;
  onShowMoreArtists: () => void;
  onShowMoreAlbums: () => void;
  onShowMoreSongs: () => void;

  hasMoreArtists: boolean;
  hasMoreAlbums: boolean;
  hasMoreSongs: boolean;

  loadingArtists: boolean;
  loadingAlbums: boolean;
  loadingSongs: boolean;
}

export default function SearchResults({
  artists,
  albums,
  songs,
  onSelectArtist,
  onSelectAlbum,
  onPlay,
  onSongMenuOpen,
  currentSong,
  onShowMoreArtists,
  onShowMoreAlbums,
  onShowMoreSongs,
  hasMoreArtists,
  hasMoreAlbums,
  hasMoreSongs,
  loadingArtists,
  loadingAlbums,
  loadingSongs
}: SearchResultsProps) {
  return (
    <div className="search-results">
      <h2>Search results</h2>
      <h3>Artists</h3>

        {artists.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <>
            <div className="search-results-artists">
              {artists.map((artist) => (
                <ArtistLink
                  key={artist.id}
                  artist={artist}
                  onClick={onSelectArtist}
                />
              ))}
            </div>

            {hasMoreArtists && (
              <button className="show-more-button"
                onClick={onShowMoreArtists}
                disabled={loadingArtists}
              >
                {loadingArtists ? "Loading..." : "Show more"}
              </button>
            )}
          </>
        )}

      <h3>Albums</h3>
        {albums.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <>
            <div className="search-results-albums">
              {albums.map((album) => (
                <AlbumLink
                  key={album.id}
                  album={album}
                  onClick={() => onSelectAlbum(album.id)}
                  onSelectArtist={onSelectArtist}
                />
              ))}
            </div>

            {hasMoreAlbums && (
              <button className="show-more-button"
                onClick={onShowMoreAlbums}
                disabled={loadingAlbums}
              >
                {loadingAlbums ? "Loading..." : "Show more"}
              </button>
            )}
          </>
        )}

      <h3>Songs</h3>
        {songs.length === 0 ? (
          <p>No songs found.</p>
        ) : (
          <>
            <div className="search-results-songs">
              {songs.map((song) => (
                <Song
                  key={song.id}
                  song={song}
                  onPlay={onPlay}
                  onSelectArtist={onSelectArtist}
                  onSelectAlbum={onSelectAlbum}
                  onSongMenuOpen={onSongMenuOpen}
                  isSearchResult={true}
                  currentSong={currentSong}
                />
              ))}
            </div>

            {hasMoreSongs && (
              <button className="show-more-button"
                onClick={onShowMoreSongs}
                disabled={loadingSongs}
              >
                {loadingSongs ? "Loading..." : "Show more"}
              </button>
            )}
          </>
        )}

    </div>
  );
}

