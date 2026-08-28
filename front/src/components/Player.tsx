import type { Song as SongType } from "../types/Song";
import "./Player.css";

interface PlayerProps {
  song: SongType | null;
  autoPlay?: boolean;
  onSongEnded: () => void;
  onSelectArtist: (artistId: number) => void;
  onSelectAlbum: (albumId: number) => void;
}

export default function Player({
  song,
  autoPlay = true,
  onSongEnded,
  onSelectArtist,
  onSelectAlbum,
}: PlayerProps) {
  if (!song) {
    return (
      <div className="player">
        <div className="player-info">
          <p>No song selected</p>
        </div>
      </div>
    );
  }
   
  return (
    <div className="player">

      <div className="player-album-cover">
        {song.albums?.cover_path ? (
            <img
              className="album-cover"
              src={`http://localhost:3000${song.albums.cover_path}`}
              alt={`${song.albums.title} album cover`}
            />
          ) : (
            <div
              className="album-cover-placeholder"
              aria-label="No album cover available"
            />
        )}
      </div>

      <div className="player-info">
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

      <audio
        controls
        autoPlay={autoPlay}
        src={`http://localhost:3000${song.file_path}`}
        onEnded={onSongEnded}
      />
    </div>
  );
}
