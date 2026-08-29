import { useEffect, useState } from "react";

import "./App.css";



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

  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const [playbackAlbumId, setPlaybackAlbumId] = useState<number | null>(null);
  const [playbackAlbumSongId, setPlaybackAlbumSongId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [recentAlbums, setRecentAlbums] =
    useState<AlbumType[]>([]);



const loadCurrentUser = async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/auth/me",
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      setLoggedIn(false);
      return;
    }

    const data = await response.json();

    console.log("Current user:", data);
    console.log("Last played song:", data.songs);
    console.log("Playback album:", data.playback_album_id);
    console.log(
      "Playback album song:",
      data.playback_album_song_id
    );

    // User is logged in
    setLoggedIn(true);

    // Restore playback state
    setPlaybackAlbumId(data.playback_album_id ?? null);
    setPlaybackAlbumSongId(
      data.playback_album_song_id ?? null
    );

    // Restore the last played song
    setCurrentSong(data.songs ?? null);
    // Don't automatically start playing after login
    setShouldAutoPlay(false);

  } catch (error) {
    console.error(
      "Authentication check failed:",
      error
    );
    setLoggedIn(false);
  } finally {
    setAuthLoading(false);
  }
};

useEffect(() => {
  loadCurrentUser();
}, []);

const updatePlayback = async (
  song: SongType,
  fromQueue: boolean
) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/playback/${song.id}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromQueue,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update playback");
    }

    const data = await response.json();

    setRecentAlbums(data.recentAlbums);
  } catch (error) {
    console.error(
      "Failed to update playback:",
      error
    );
  }
};


const handleAddToQueue = async (song: SongType) => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/queue/add",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songId: song.id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to add song to queue:", data.error);
      return;
    }

    console.log("Added to queue:", data);
  } catch (error) {
    console.error("Error adding song to queue:", error);
  }
};


const handleSongEnded = async () => {
  setShouldAutoPlay(true);
  if (!currentSong) {
    return;
  }

  try {
    // First try to get the next song from the user's queue
    const queueResponse = await fetch(
      "http://localhost:3000/api/queue/next",
      {
        method: "POST",
        credentials: "include",
      }
    );


    if (queueResponse.ok) {
      const nextSong = await queueResponse.json();

      /*
       * Queue playback.
       *
       * Do NOT change playbackAlbumId or
       * playbackAlbumSongId.
       */
      setCurrentSong(nextSong);
      await updatePlayback(nextSong, true);

      return;
    }

    // Queue is empty.
    // Continue from the album we were originally playing.
    if (!playbackAlbumId) {
      setCurrentSong(null);
      return;
    }

    const albumResponse = await fetch(
      `http://localhost:3000/api/albums/${playbackAlbumId}`,
      {
        credentials: "include",
      }
    );

    if (!albumResponse.ok) {
      throw new Error("Failed to fetch album");
    }

    const album = await albumResponse.json();

    const currentIndex = album.songs.findIndex(
      (song: SongType) => song.id === playbackAlbumSongId
    );

    if (
      currentIndex !== -1 &&
      currentIndex + 1 < album.songs.length
    ) {
      const nextAlbumSong = album.songs[currentIndex + 1];

      setCurrentSong(nextAlbumSong);
      setPlaybackAlbumSongId(nextAlbumSong.id);

      await updatePlayback(nextAlbumSong, false);
    } else {
      setCurrentSong(null);
    }
  } catch (error) {
    console.error(
      "Error selecting next song:",
      error
    );

    setCurrentSong(null);
  }
};




useEffect(() => {
  if (!loggedIn) {
    return;
  }

    const fetchMusicData = async () => {
      try {
        const [
          songsResponse,
          albumsResponse,
          artistsResponse,
          recentAlbumsResponse,
        ] = await Promise.all([
          fetch("http://localhost:3000/api/songs", {
            credentials: "include",
          }),

          fetch("http://localhost:3000/api/albums", {
            credentials: "include",
          }),

          fetch("http://localhost:3000/api/artists", {
            credentials: "include",
          }),

          fetch(
            "http://localhost:3000/api/auth/recent-albums",
            {
              credentials: "include",
            }
          ),
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

        if (!recentAlbumsResponse.ok) {
          throw new Error(
            "Failed to fetch recent albums"
          );
        }

        const [
          songsData,
          albumsData,
          artistsData,
          recentAlbumsData,
        ] = await Promise.all([
          songsResponse.json(),
          albumsResponse.json(),
          artistsResponse.json(),
          recentAlbumsResponse.json(),
        ]);

        setSongs(songsData);
        setAlbums(albumsData);
        setArtists(artistsData);
        setRecentAlbums(recentAlbumsData);
      } catch (error) {
        console.error(
          "Error fetching music data:",
          error
        );
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
        onLogin={loadCurrentUser}
      />
    );
  }

  return (
  <div className="app">


    <Main
      albums={albums}
      recentAlbums={recentAlbums}
      artists={artists}
      songs={songs}
      onPlay={(song) => {
        setCurrentSong(song);
        setShouldAutoPlay(true);

        if (song.album_id !== null) {
          setPlaybackAlbumId(song.album_id);
          setPlaybackAlbumSongId(song.id);
        } else {
          setPlaybackAlbumId(null);
          setPlaybackAlbumSongId(null);
        }

        updatePlayback(song, false);
      }}
      onImportMusic={handleImportMusic}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      handleLogout={handleLogout}
      currentSong={currentSong}
      onSongEnded={handleSongEnded}
      autoPlay={shouldAutoPlay}
      onAddToQueue={handleAddToQueue}
    />

    
  </div>
);
}

export default App;