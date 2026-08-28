import type { Artist as ArtistType } from "../types/Artist";

import "./ArtistLink.css";

interface ArtistLinkProps {
  artist: ArtistType;
  onClick: (artistId: number) => void;
}

export default function ArtistLink({
  artist,
  onClick,
}: ArtistLinkProps) {
  return (
    <div
      className="artist-link"
      onClick={() => onClick(artist.id)}
      role="button"
      tabIndex={0}
    >
      <h3>{artist.name}</h3>
    </div>
  );
}