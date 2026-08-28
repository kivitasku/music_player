import { useEffect, useState } from "react";

import "./App.css";

import Player from "./components/Player";


import Header from "./components/Header";


import Main from "./components/Main";

import type { Song as SongType } from "./types/Song";

import type { Album as AlbumType } from "./types/Album";

import type { Artist as ArtistType } from "./types/Artist";


function App() {
  const [songs, setSongs] = useState<SongType[]>([]);

  const [currentSong, setCurrentSong] =
    useState<SongType | null>(null);

  const [albums, setAlbums] = useState<AlbumType[]>([]);

  const [artists, setArtists] = useState<ArtistType[]>([]);


  const [searchQuery, setSearchQuery] =
    useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/songs")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch songs");
        }

        return response.json();
      })
      .then((data) => {
        setSongs(data);
      })
      .catch((error) => {
        console.error("Error fetching songs:", error);
      });
  }, []);



  useEffect(() => {
  fetch("http://localhost:3000/api/albums")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch albums");
      }

      return response.json();
    })
    .then((data) => {
      console.log("Albums:", data);
      setAlbums(data);
    })
    .catch((error) => {
      console.error("Error fetching albums:", error);
    });
}, []);

  useEffect(() => {
    fetch("http://localhost:3000/api/artists")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch artists");
        }

        return response.json();
      })
      .then((data) => {
        console.log("Artists:", data);
        setArtists(data);
      })
      .catch((error) => {
        console.error("Error fetching artists:", error);
      });
  }, []);



  const handleImportMusic = async () => {
    try {
            console.log("staring import");
      const response = await fetch(
        "http://localhost:3000/api/music/import",
        {
          method: "POST",
        }
      );


      if (!response.ok) {
        throw new Error("Music import failed");
      }

      const result = await response.json();

      console.log("Import result:", result);

      alert(
      `Import complete!\n\n` +
      `Found: ${result.found}\n` +
      `Imported: ${result.imported}\n` +
      `Skipped: ${result.skipped}\n` +
      `Failed: ${result.failed}`
    );

      // Fetch the songs again after importing
      const songsResponse = await fetch(
        "http://localhost:3000/api/songs"
      );

      if (!songsResponse.ok) {
        throw new Error("Failed to refresh songs");
      }

      const updatedSongs = await songsResponse.json();

      setSongs(updatedSongs);
    } catch (error) {
      console.error("Error importing music:", error);
    }
  };

return (
  <div className="app">
    <Header
      searchQuery={searchQuery}
      onSearch={setSearchQuery}
    />

    <Main
      albums={albums}
      artists={artists}
      songs={songs}
      onPlay={setCurrentSong}
      onImportMusic={handleImportMusic}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />

    <Player song={currentSong} />
  </div>
);
}

export default App;