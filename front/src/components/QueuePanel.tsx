import { useEffect, useState } from "react";
import type { Song as SongType } from "../types/Song";
import "./QueuePanel.css";

interface QueueItem {
  id: number;
  position: number;
  songs: SongType;
}

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QueuePanel({
  isOpen,
  onClose,
}: QueuePanelProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadQueue = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          "/api/queue",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch queue");
        }

        const data = await response.json();
        setQueue(data);
      } catch (error) {
        console.error("Failed to load queue:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQueue();
  }, [isOpen]);

const handleRemove = async (queueId: number) => {
  try {
    const response = await fetch(
      `/api/queue/${queueId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to remove song");
    }

    setQueue((currentQueue) =>
      currentQueue.filter((item) => item.id !== queueId)
    );
  } catch (error) {
    console.error("Failed to remove song from queue:", error);
  }
};

  if (!isOpen) {
    return null;
  }

  return (
    <div className="queue-overlay" onClick={onClose}>
      <div
        className="queue-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="queue-header">
          <h2>Queue</h2>

          <button
            className="queue-close-button"
            onClick={onClose}
            aria-label="Close queue"
          >
            ×
          </button>
        </div>

        <div className="queue-list">
          {loading ? (
            <p className="queue-empty">Loading...</p>
          ) : queue.length === 0 ? (
            <p className="queue-empty">Queue is empty</p>
          ) : (
            queue.map((item) => (
              <div className="queue-item" key={item.id}>

                {item.songs.albums?.cover_path ? (
                    <img
                        className="queue-song-cover"
                        src={item.songs.albums.cover_path}
                        alt={`${item.songs.albums.title} album cover`}
                    />
                    ) : (
                    <div className="queue-song-cover-placeholder" />
                )}

                <div className="queue-song-info">
                  <div className="queue-song-title">
                    {item.songs.title ?? "No song"}
                  </div>

                  <div className="queue-song-artist">
                    {item.songs.artists?.name ?? "No artist"}
                  </div>
                </div>

                <button
                  className="queue-remove-button"
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}