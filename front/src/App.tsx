import { useEffect, useState } from "react";

import "./App.css";



import MainPage from "./components/MainPage";

import LoginPage from "./components/LoginPage";

import type { Song as SongType } from "./types/Song";

import type { Album as AlbumType } from "./types/Album";

import type { Artist as ArtistType } from "./types/Artist";

import { useNotification } from "./hooks/useNotification";
import Notification from "./components/Notification";


function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [currentSong, setCurrentSong] =
    useState<SongType | null>(null);

  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  //search results get info from these
  const [albums, setAlbums] = useState<AlbumType[]>([]);
  const [artists, setArtists] = useState<ArtistType[]>([]);
  const [songs, setSongs] = useState<SongType[]>([]);
  



  //user related states
  const [recentAlbums, setRecentAlbums] =
    useState<AlbumType[]>([]);
  const [userName, setUserName] = useState("");
  const [playbackAlbumId, setPlaybackAlbumId] = useState<number | null>(null);
  const [playbackAlbumSongId, setPlaybackAlbumSongId] = useState<number | null>(null);


  const { 
    notification,
    showNotification,
  } = useNotification();


//loads current user data from server if logged in
const loadCurrentUser = async () => {
  try {
    const response = await fetch(
      "/api/auth/me",
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      setLoggedIn(false);
      return;
    }

    const data = await response.json();


    // User is logged in
    setLoggedIn(true);
    setUserName(data.username);


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

//run the loadCurrentUser when the app starts
useEffect(() => {
  loadCurrentUser();
}, []);


//timeout
useEffect(() => {
  if (!loggedIn) {
    return;
  }
  const checkSession = async () => {
    try {
      const response = await fetch(
        "/api/auth/me",
        {
          credentials: "include",
        }
      );

      if (response.status === 401) {
        setLoggedIn(false);
        setCurrentSong(null);
        setShouldAutoPlay(false);
        setUserName("");
        setPlaybackAlbumId(null);
        setPlaybackAlbumSongId(null);
        setRecentAlbums([]);
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
  };

  const interval = setInterval(checkSession, 30_000); // 30 seconds

  return () => clearInterval(interval);
}, [loggedIn]);




//handles the playback state update on the server side, and updates the recent albums
//and currently playing album
const updatePlayback = async (
  song: SongType,
  fromQueue: boolean
) => {
  try {
    const response = await fetch(
      `/api/playback/${song.id}`,
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

//handle add to queue button call
const handleAddToQueue = async (song: SongType) => {
  try {
    const response = await fetch(
      "/api/queue/add",
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

    if (response.status === 409) {
      showNotification("Queue is full");
      return;
    }

    if (!response.ok) {
      console.error("Failed to add song to queue:", data.error);
      return;
    }

    console.log("Added to queue:", data);
    showNotification(`Added "${song.title}" to queue`);
  } catch (error) {
    console.error("Error adding song to queue:", error);
  }
};


//handle song ended event
const handleSongEnded = async () => {
  setShouldAutoPlay(true);
  if (!currentSong) {
    return;
  }

  try {
    // First try to get the next song from the user's queue
    const queueResponse = await fetch(
      "/api/queue/next",
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
      `/api/albums/${playbackAlbumId}`,
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



// to be deleted, used to get all music data
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
          fetch("/api/songs", {
            credentials: "include",
          }),

          fetch("/api/albums", {
            credentials: "include",
          }),

          fetch("/api/artists", {
            credentials: "include",
          }),

          fetch(
            "/api/auth/recent-albums",
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



//handle logout button call
const handleLogout = async () => {
  try {
    const response = await fetch(
      "/api/auth/logout",
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



  //web page
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

    {notification && (
      <Notification message={notification} />
    )}

    <MainPage
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
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      handleLogout={handleLogout}
      currentSong={currentSong}
      onSongEnded={handleSongEnded}
      autoPlay={shouldAutoPlay}
      onAddToQueue={handleAddToQueue}
      userName={userName}
    />

    
  </div>
);
}

export default App;