import { useEffect, useState } from "react";

import type { Artist as ArtistType } from "../types/Artist";
import type { Album as AlbumType } from "../types/Album";

import AlbumLink from "./AlbumLink";

import "./ArtistPage.css";

interface ArtistPageProps {
  artistId: number;
  onBack: () => void;
  onSelectAlbum: (album: AlbumType) => void;
}

export default function ArtistPage({
  artistId,
  onBack,
  onSelectAlbum,
}: ArtistPageProps) {
  const [artist, setArtist] = useState<ArtistType | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/artists/${artistId}`,
      {credentials: "include"})
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch artist");
        }

        return response.json();
      })
      .then((data) => {
        setArtist(data);
      })
      .catch((error) => {
        console.error("Error fetching artist:", error);
      });
  }, [artistId]);

  if (!artist) {
    return (
      <div className="artist-page">
        <button
          className="artist-back"
          onClick={onBack}
        >
          ← Back
        </button>

        <p>Loading artist...</p>
      </div>
    );
  }

  return (
    <div className="artist-page">
      <button
        className="artist-back"
        onClick={onBack}
      >
        ← Back
      </button>

      <div className="artist-page-header">
        <h1>{artist.name}</h1>
      </div>

      <div className="artist-albums">
        {artist.albums.map((album) => (
          <AlbumLink
            key={album.id}
            album={album}
            onClick={onSelectAlbum}
          />
        ))}
      </div>
    </div>
  );
}