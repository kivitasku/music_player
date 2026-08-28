import type { Song as SongType } from "../types/Song";
import "./Player.css";

interface PlayerProps {
  song: SongType | null;
  onSongEnded: () => void;
}

export default function Player({
  song,
  onSongEnded,
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
      <div className="player-info">
        <h3>{song.title ?? "No song"}</h3>
        <p>{song.artists.name ?? "No artist"}</p>
        <p>{song.albums?.title ?? "No album"}</p>
      </div>

      <audio
        controls
        autoPlay
        src={`http://localhost:3000${song.file_path}`}
        onEnded={onSongEnded}
      />
    </div>
  );
}
