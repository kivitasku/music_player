export interface Song {
  id: number;
  title: string;
  file_path: string;
  artist_id: number;
  album_id: number | null;
  track_no: number | null;

  artists: {
    id: number;
    name: string;
  };

  albums: {
    id: number;
    title: string;
    cover_path: string | null;
  } | null;
}