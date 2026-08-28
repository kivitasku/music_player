import type { Song as SongType } from "../types/Song";

import "./Song.css";

interface SongProps {
  song: SongType;
  onPlay: (song: SongType) => void;
  onSelectArtist: (artistId: number) => void;
  onSelectAlbum: (albumId: number) => void;
}

export default function Song({
  song,
  onPlay,
  onSelectArtist,
  onSelectAlbum,
}: SongProps) {
  return (
    <div className="song">
      <button
        className="play-button"
        onClick={() => onPlay(song)}
        aria-label={`Play ${song.title}`}
      >
        ▶
      </button>

      <div className="song-info">
        <h3>{song.title ?? "No song"}</h3>

        <p
          className="song-artist-link"
          onClick={() => onSelectArtist(song.artists.id)}
          role="button"
          tabIndex={0}
        >
          {song.artists.name ?? "No artist"}
        </p>

        <p
          className="song-album-link"
          onClick={() => {
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
    </div>
  );
}
