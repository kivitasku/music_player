import type { Song } from "./Song";

export interface Album {
  id: number;
  title: string;
  artist_id: number;
  year: number | null;
  cover_path: string | null;

  artists: {
    id: number;
    name: string;
  };

  songs: Song[];
}