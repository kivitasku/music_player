import "./SongMenu.css";
import type { Song as SongType } from "../types/Song";

interface SongMenuProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  song: SongType | null;
  onAddToQueue: (song: SongType) => void;
  isAlbumPage: boolean;
  onSelectArtist: (artistId: number) => void;
  onSelectAlbum?: (albumId: number) => void;
}

export default function SongMenu({
  isOpen,
  onOpen,
  onClose,
  song,
  onAddToQueue,
  isAlbumPage,
  onSelectArtist,
  onSelectAlbum,
}: SongMenuProps) {

  const handleAddToQueue = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      if (song) {
        onAddToQueue(song);
      }
    } catch (error) {
      console.error("Error adding song to queue:", error);
    }
    onClose();
  };

  return (
    <>

      {isOpen && (
        <div
          className="side-menu-overlay"
          onClick={onClose}
        />
      )}

      <div className={`side-menu ${isOpen ? "open" : ""}`}>
        <div className="side-menu-header">
          <h2>Menu</h2>

          <button
            className="close-menu"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

          <div className="button-container">
            <button
              className="menu-item"
              onClick={handleAddToQueue}
            >
              Add to queue
            </button>
            <button className="menu-item"
              onClick={() => {
                if (!song) {
                  onClose();
                  return;
                }

                onSelectArtist(song.artists.id);
                onClose();
              }}
            >
              To artist
            </button>

            {!isAlbumPage && (
              <button className="menu-item"
                onClick={(event) => {
                  event.stopPropagation();
                  try {
                    if (!onSelectAlbum) {
                      onClose();
                      return;
                    }
                    if (!song) {
                      onClose();
                      return;
                    }
                  onSelectAlbum(song.albums?.id ?? 0);
                  onClose();
                  }
                  catch (error) {
                    console.error("Error selecting album:", error);
                  }
                }
                }>
                Go to album
              </button>
            )}

          </div>
        </div>
    </>
  );
}