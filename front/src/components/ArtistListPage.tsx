import type { Artist as ArtistType } from "../types/Artist";

import ArtistLink from "./ArtistLink";

import "./ArtistListPage.css";

interface ArtistListPageProps {
  artists: ArtistType[];
  onSelectArtist: (artistId: number) => void;
}

export default function ArtistListPage({
  artists,
  onSelectArtist,
}: ArtistListPageProps) {
  return (
    <div className="artist-list-page">
      {artists.map((artist) => (
        <ArtistLink
          key={artist.id}
          artist={artist}
          onClick={onSelectArtist}
        />
      ))}
    </div>
  );
}

