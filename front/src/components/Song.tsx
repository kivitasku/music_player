import type { Song as SongType } from "../types/Song";

import "./Song.css";

interface SongProps {
  song: SongType;
  onPlay: (song: SongType) => void;
  isAlbumPage?: boolean;
  isSearchResult?: boolean;
  onSongMenuOpen: (song: SongType, isAlbumPage: boolean) => void;
  onSelectArtist: (artistId: number) => void;
  onSelectAlbum?: (albumId: number) => void;
}

export default function Song({
  song,
  onPlay,
  isAlbumPage = false,
  isSearchResult = false,
  onSongMenuOpen,
  onSelectArtist,
  onSelectAlbum = () => {},
}: SongProps) {
  


  return (
    <div className="song"
        onClick={() => onPlay(song)}
        >


        {isSearchResult && (
          <div className="song-album-cover">
              {song.albums?.cover_path ? (
                <img
                  src={`http://localhost:3000${song.albums.cover_path}`}
                  alt={`${song.albums.title} album cover`}
                />
              ) : (
                <div className="song-album-cover-placeholder" />
              )}
            </div>

        )}

      <div className="song-info">
        <h3>{song.title ?? "No song"}</h3>



          {!isAlbumPage && (
          <div className="song-artist-album">

            <p
              className="song-artist-link"
              onClick={(event) => {
                event.stopPropagation();
                onSelectArtist(song.artists.id);
              }}
              role="button"
              tabIndex={0}
            >
              {song.artists.name ?? "No artist"}
            </p>

            <p
              className="song-album-link"
              onClick={(event) => {
                event.stopPropagation();
                if (song.albums) {
                  onSelectAlbum(song.albums.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {song.albums?.title ?? "No album"}
            </p>
        
          </div>
        )}


      </div>


      <div className="song-settings">
        <button
          className="song-settings-button"
          onClick={(event) => {
            event.stopPropagation();
            onSongMenuOpen(song, isAlbumPage);
          }}
        >
          ☰
        </button>
      </div>
      


    </div>
  );
}
