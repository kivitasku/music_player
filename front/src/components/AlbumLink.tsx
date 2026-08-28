import type { Album as AlbumType } from "../types/Album";

import "./AlbumLink.css";

interface AlbumLinkProps {
  album: AlbumType;
  onClick: (album: AlbumType) => void;
  onSelectArtist: (artistId: number) => void;
}

export default function AlbumLink({
  album,
  onClick,
  onSelectArtist,
}: AlbumLinkProps) {
  return (
    <div
      className="album-link"
      onClick={() => onClick(album)}
      role="button"
      tabIndex={0}
    >
      <div className="album-link-info">
        <h3>{album.title ?? "No album"}</h3>

        <a
          className="album-artist-link"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSelectArtist(album.artists.id);
          }}
        >
          {album.artists?.name ?? "No artist"}
        </a>

        <p>{album.year ?? "Unknown year"}</p>
      </div>

      <div
        className="album-cover-placeholder"
        aria-label="Album cover placeholder"
      />

    </div>
  );
}