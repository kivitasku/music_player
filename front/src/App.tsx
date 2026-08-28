import { useEffect, useState } from "react";

import "./App.css";

import Player from "./components/Player";


import Header from "./components/Header";


import Main from "./components/Main";

import LoginPage from "./components/LoginPage";

import type { Song as SongType } from "./types/Song";

import type { Album as AlbumType } from "./types/Album";

import type { Artist as ArtistType } from "./types/Artist";


function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [songs, setSongs] = useState<SongType[]>([]);

  const [currentSong, setCurrentSong] =
    useState<SongType | null>(null);

  const [albums, setAlbums] = useState<AlbumType[]>([]);

  const [artists, setArtists] = useState<ArtistType[]>([]);


  const [searchQuery, setSearchQuery] =
    useState("");


  useEffect(() => {
  fetch("http://localhost:3000/api/auth/me", {
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    })
    .catch((error) => {
      console.error("Authentication check failed:", error);
      setLoggedIn(false);
    })
    .finally(() => {
      setAuthLoading(false);
    });
  }, []);


useEffect(() => {
  if (!loggedIn) {
    return;
  }

  const fetchMusicData = async () => {
    try {
      const [songsResponse, albumsResponse, artistsResponse] =
        await Promise.all([
          fetch("http://localhost:3000/api/songs", {
            credentials: "include",
          }),
          fetch("http://localhost:3000/api/albums", {
            credentials: "include",
          }),
          fetch("http://localhost:3000/api/artists", {
            credentials: "include",
          }),
        ]);

      if (!songsResponse.ok) {
        throw new Error("Failed to fetch songs");
      }

      if (!albumsResponse.ok) {
        throw new Error("Failed to fetch albums");
      }

      if (!artistsResponse.ok) {
        throw new Error("Failed to fetch artists");
      }

      const [songsData, albumsData, artistsData] =
        await Promise.all([
          songsResponse.json(),
          albumsResponse.json(),
          artistsResponse.json(),
        ]);

      setSongs(songsData);
      setAlbums(albumsData);
      setArtists(artistsData);
    } catch (error) {
      console.error("Error fetching music data:", error);
    }
  };

  fetchMusicData();
}, [loggedIn]);






const handleLogout = async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/auth/logout",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    setLoggedIn(false);
  } catch (error) {
    console.error("Logout error:", error);
  }
  };

  const handleImportMusic = async () => {
    try {
            console.log("staring import");
      const response = await fetch(
        "http://localhost:3000/api/music/import",
        {
          method: "POST",
          credentials: "include",
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
        "http://localhost:3000/api/songs",
        {
          credentials: "include",
        }
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


  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!loggedIn) {
  return (
      <LoginPage
        onLogin={() => setLoggedIn(true)}
      />
    );
  }

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
      handleLogout={handleLogout}
    />

    <Player song={currentSong} />
  </div>
);
}

export default App;