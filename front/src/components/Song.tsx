import type { Song as SongType } from "../types/Song";

import "./Song.css";

interface SongProps {
  song: SongType;
  onPlay: (song: SongType) => void;
  isAlbumPage?: boolean;
  onSongMenuOpen: (song: SongType, isAlbumPage: boolean) => void;
}

export default function Song({
  song,
  onPlay,
  isAlbumPage = false,
  onSongMenuOpen,
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


      </div>


      <div className="song-settings">
        <button
          className="song-settings-button"
          onClick={() => onSongMenuOpen(song, isAlbumPage)}
        >
          ☰
        </button>
      </div>
      


    </div>
  );
}
