import type { Song } from "./Song";

export interface Album {
  id: number;
  title: string;
  artist_id: number;
  year: number | null;

  artists: {
    id: number;
    name: string;
  };

  songs: Song[];
}