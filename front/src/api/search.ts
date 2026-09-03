import type { Artist } from "../types/Artist";
import type { Album } from "../types/Album";
import type { Song } from "../types/Song";

interface SearchResponse {
  artists: Artist[];
  albums: Album[];
  songs: Song[];

  hasMoreArtists: boolean;
  hasMoreAlbums: boolean;
  hasMoreSongs: boolean;
}

export async function searchMusic(
  query: string,
  offset = 0,
  limit = 5,
  type?: "artists" | "albums" | "songs"
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    offset: String(offset),
    limit: String(limit),
  });

  if (type) {
    params.set("type", type);
  }

  const response = await fetch(`/api/search?${params}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Search failed");
  }

  return response.json();
}