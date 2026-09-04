import { useEffect, useState } from "react";

import "./App.css";



import MainPage from "./components/MainPage";

import LoginPage from "./components/LoginPage";

import type { Song as SongType } from "./types/Song";

import type { Album as AlbumType } from "./types/Album";

import type { Artist as ArtistType } from "./types/Artist";

import { useNotification } from "./hooks/useNotification";
import Notification from "./components/Notification";
import { searchMusic } from "./api/search";


function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [currentSong, setCurrentSong] =
    useState<SongType | null>(null);

  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  //old search results get info from these
  const [artists, setArtists] = useState<ArtistType[]>([]);
  
  //new search funtionality
  const [searchResults, setSearchResults] = useState({
    artists: [] as ArtistType[],
    albums: [] as AlbumType[],
    songs: [] as SongType[],
  });

const [artistOffset, setArtistOffset] = useState(0);
const [albumOffset, setAlbumOffset] = useState(0);
const [songOffset, setSongOffset] = useState(0);

const [hasMoreArtists, setHasMoreArtists] = useState(true);
const [hasMoreAlbums, setHasMoreAlbums] = useState(true);
const [hasMoreSongs, setHasMoreSongs] = useState(true);

const [loadingArtists, setLoadingArtists] = useState(false);
const [loadingAlbums, setLoadingAlbums] = useState(false);
const [loadingSongs, setLoadingSongs] = useState(false);



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


//search query effect, triggers when searchQuery changes
useEffect(() => {
  const query = searchQuery.trim();
  setLoadingArtists(true);
  setLoadingAlbums(true);
  setLoadingSongs(true);

  if (!query) {
    setSearchResults({
      artists: [],
      albums: [],
      songs: [],
    });

    setArtistOffset(0);
    setAlbumOffset(0);
    setSongOffset(0);

    setHasMoreArtists(true);
    setHasMoreAlbums(true);
    setHasMoreSongs(true);

    return;
  }

  const timeout = setTimeout(async () => {
    try {
      setLoadingArtists(true);
      setLoadingAlbums(true);
      setLoadingSongs(true);

      const data = await searchMusic(query, 0, 5);

      setSearchResults(data);

      setArtistOffset(5);
      setAlbumOffset(5);
      setSongOffset(5);

      setHasMoreArtists(data.hasMoreArtists);
      setHasMoreAlbums(data.hasMoreAlbums);
      setHasMoreSongs(data.hasMoreSongs);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoadingArtists(false);
      setLoadingAlbums(false);
      setLoadingSongs(false);
    }
  }, 300);

  return () => clearTimeout(timeout);
}, [searchQuery]);

//handles showMore button click on artists
const handleShowMoreArtists = async () => {
  if (loadingArtists) return;

  try {

    const data = await searchMusic(
      searchQuery.trim(),
      artistOffset,
      5,
      "artists"
    );

    setSearchResults((previous) => ({
      ...previous,
      artists: [...previous.artists, ...data.artists],
    }));

    setArtistOffset((previous) => previous + 5);
    setHasMoreArtists(data.hasMoreArtists);
  } catch (error) {
    console.error("Failed to load more artists:", error);
  } finally {
    setLoadingArtists(false);
  }
};

//handles showMore button click on albums
const handleShowMoreAlbums = async () => {
  if (loadingAlbums) return;

  try {

    const data = await searchMusic(
      searchQuery.trim(),
      albumOffset,
      5,
      "albums"
    );

    setSearchResults((previous) => ({
      ...previous,
      albums: [...previous.albums, ...data.albums],
    }));

    setAlbumOffset((previous) => previous + 5);
    setHasMoreAlbums(data.hasMoreAlbums);
  } catch (error) {
    console.error("Failed to load more albums:", error);
  } finally {
    setLoadingAlbums(false);
  }
};

//handles showMore button click on songs
const handleShowMoreSongs = async () => {
  if (loadingSongs) return;

  try {

    const data = await searchMusic(
      searchQuery.trim(),
      songOffset,
      5,
      "songs"
    );

    setSearchResults((previous) => ({
      ...previous,
      songs: [...previous.songs, ...data.songs],
    }));

    setSongOffset((previous) => previous + 5);
    setHasMoreSongs(data.hasMoreSongs);
  } catch (error) {
    console.error("Failed to load more songs:", error);
  } finally {
    setLoadingSongs(false);
  }
};



//loads current user data from server if logged in
const loadCurrentUser = async () => {
  try {
    const [userResponse, recentAlbumsResponse] =
      await Promise.all([
        fetch("/api/auth/me", {
          credentials: "include",
        }),

        fetch("/api/auth/recent-albums", {
          credentials: "include",
        }),
      ]);

    // Authentication failed
    if (!userResponse.ok) {
      setLoggedIn(false);
      return;
    }

    // Check recent albums response
    if (!recentAlbumsResponse.ok) {
      console.error("Failed to fetch recent albums");
      setRecentAlbums([]);
    }

    // Convert responses to JSON
    const userData = await userResponse.json();

    let recentAlbumsData = [];

    if (recentAlbumsResponse.ok) {
      recentAlbumsData = await recentAlbumsResponse.json();
      console.log("Recent albums fetched:", recentAlbumsData);
    }

    // User is logged in
    setLoggedIn(true);
    setUserName(userData.username);

    // Restore playback state
    setPlaybackAlbumId(
      userData.playback_album_id ?? null
    );

    setPlaybackAlbumSongId(
      userData.playback_album_song_id ?? null
    );

    // Restore the last played song
    setCurrentSong(userData.songs ?? null);

    // Restore recent albums
    setRecentAlbums(recentAlbumsData);

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

//fetch all artists
useEffect(() => {
  if (!loggedIn) {
    return;
  }

  const fetchArtists = async () => {
    try {
      const response = await fetch(
        "/api/artists",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch artists");
      }

      const data = await response.json();
      setArtists(data);
    } catch (error) {
      console.error(
        "Error fetching artists:",
        error
      );
    }
  };

  fetchArtists();
}, [loggedIn]);


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
      albums={searchResults.albums}
      recentAlbums={recentAlbums}
      artists={searchResults.artists}
      songs={searchResults.songs}
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
      onShowMoreArtists={handleShowMoreArtists}
      onShowMoreAlbums={handleShowMoreAlbums}
      onShowMoreSongs={handleShowMoreSongs}
      hasMoreArtists={hasMoreArtists}
      hasMoreAlbums={hasMoreAlbums}
      hasMoreSongs={hasMoreSongs}
      loadingArtists={loadingArtists}
      loadingAlbums={loadingAlbums}
      loadingSongs={loadingSongs}
      allArtists={artists}
    />

    
  </div>
);
}

export default App;