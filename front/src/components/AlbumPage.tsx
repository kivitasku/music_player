import { useEffect, useState } from "react";

import type { Album as AlbumType } from "../types/Album";
import type { Song as SongType } from "../types/Song";

import Song from "./Song";

import "./AlbumPage.css";

interface AlbumPageProps {
  album: AlbumType;
  onBack: () => void;
  onPlay: (song: SongType) => void;
  onSelectArtist: (artistId: number) => void;
  onSongMenuOpen: (song: SongType, isAlbumPage: boolean) => void;
  currentSong: SongType | null;
}

export default function AlbumPage({
  album,
  onBack,
  onPlay,
  onSelectArtist,
  onSongMenuOpen,
  currentSong,
}: AlbumPageProps) {
  const [fullAlbum, setFullAlbum] = useState<AlbumType | null>(null);

  useEffect(() => {
    fetch(`/api/albums/${album.id}`,
      {credentials: "include"}
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch album");
        }

        return response.json();
      })
      .then((data) => {
        setFullAlbum(data);
      })
      .catch((error) => {
        console.error("Error fetching album:", error);
      });
  }, [album.id]);

  if (!fullAlbum) {
    return (
      <div className="album-page">
        <button
          className="album-back"
          onClick={onBack}
        >
          ← Back
        </button>

        <p>Loading album...</p>
      </div>
    );
  }

  return (
    <div className="album-page">
      <button
        className="album-back"
        onClick={onBack}
      >
        ← Back
      </button>

        <div className="album-page-header">
          <div className="album-cover-container">

            {album.cover_path ? (
              <img
                className="album-cover"
                src={album.cover_path}
                alt={`${album.title} album cover`}
              />
            ) : (
              <div
                className="album-cover-placeholder"
                aria-label="No album cover available"
              />
            )}
          </div>

          <div className="album-page-info">
            <h1>{fullAlbum.title}</h1>

            <a
              className="album-artist-link"
              onClick={() => onSelectArtist(fullAlbum.artists.id)}
              role="button"
              tabIndex={0}
            >
              {fullAlbum.artists.name}
            </a>

            <p>{fullAlbum.year ?? "Unknown year"}</p>
          </div>
        </div>

      <div className="album-songs">
        {fullAlbum.songs.map((song) => (
          <Song 
            key={song.id}
            song={song}
            onPlay={onPlay}
            onSelectArtist={onSelectArtist}
            isAlbumPage={true}
            onSongMenuOpen={onSongMenuOpen}
            currentSong={currentSong}
          />
        ))}
      </div>
    </div>
  );
}