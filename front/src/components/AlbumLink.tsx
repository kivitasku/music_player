import type { Album as AlbumType } from "../types/Album";

import "./AlbumLink.css";

interface AlbumLinkProps {
  album: AlbumType;
  onClick: (album: AlbumType) => void;
  onSelectArtist?: (artistId: number) => void;
  isArtistPage?: boolean;
}

export default function AlbumLink({
  album,
  onClick,
  onSelectArtist = () => {},
  isArtistPage = false,
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

        {!isArtistPage && (

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


        )}


        <p>{album.year ?? "Unknown year"}</p>
      </div>

        <div className="album-link-cover">
          {album.cover_path ? (
            <img
              className="album-cover"
              src={`http://localhost:3000${album.cover_path}`}
              alt={`${album.title} album cover`}
            />
          ) : (
            <div
              className="album-cover-placeholder"
              aria-label="No album cover available"
            />
          )}
        </div>


    </div>
  );
}