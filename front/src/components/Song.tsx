import { useState } from "react";
import type { Song as SongType } from "../types/Song";

import "./Song.css";

interface SongProps {
  song: SongType;
  onPlay: (song: SongType) => void;
  onSelectArtist: (artistId: number) => void;
  onSelectAlbum?: (albumId: number) => void;
  isAlbumPage?: boolean;
  onAddToQueue: (song: SongType) => void;
}

export default function Song({
  song,
  onPlay,
  onSelectArtist,
  onSelectAlbum = () => {},
  isAlbumPage = false,
  onAddToQueue,
}: SongProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleAddToQueue = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onAddToQueue(song);
    setMenuOpen(false);
  };


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


        {!isAlbumPage && (
          <>

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
        
          </>
        )}


      </div>


      <div className="song-settings">
        <button
          className="song-settings-button"
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          aria-label="Song options"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        {menuOpen && (
          <div className="song-settings-menu">
            <button onClick={handleAddToQueue}>
              Add to queue
            </button>
          </div>
        )}
      </div>


    </div>
  );
}
