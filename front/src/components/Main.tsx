import { useEffect, useState } from "react";

import type { Album as AlbumType } from "../types/Album";
import type { Artist as ArtistType } from "../types/Artist";
import type { Song as SongType } from "../types/Song";

import SearchResults from "./SearchResults";
import AlbumLink from "./AlbumLink";
import AlbumPage from "./AlbumPage";
import ArtistPage from "./ArtistPage";
import ArtistListPage from "./ArtistListPage";
import SideMenu from "./SideMenu";

import "./Main.css";
import Player from "./Player";
import Header from "./Header";
import SongMenu from "./SongMenu";

interface MainProps {
  albums: AlbumType[];
  artists: ArtistType[];
  songs: SongType[];
  recentAlbums: AlbumType[];
  onPlay: (song: SongType) => void;
  onImportMusic: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleLogout: () => void;
  currentSong: SongType | null;
  onSongEnded: () => void;
  autoPlay: boolean;
  onAddToQueue: (song: SongType) => void;
  userName: string;
}

export default function Main({
  albums,
  artists,
  songs,
  recentAlbums,
  onPlay,
  onImportMusic,
  searchQuery,
  setSearchQuery,
  handleLogout,
  currentSong,
  onSongEnded,
  autoPlay,
  onAddToQueue,
  userName
}: MainProps) {
  const [selectedAlbum, setSelectedAlbum] =
    useState<AlbumType | null>(null);

    const [selectedArtistId, setSelectedArtistId] =
    useState<number | null>(null);

    const [showArtistList, setShowArtistList] =
      useState(false);

    const [sideMenuOpen, setSideMenuOpen] = useState(false);

    const [songMenuIsAlbumPage, setSongMenuIsAlbumPage] = useState(false);
    const [songMenuOpen, setSongMenuOpen] = useState(false);
    const [songMenuSong, setSongMenuSong] =
      useState<SongType | null>(null);

    

    const filteredArtists = artists.filter((artist) =>
      artist.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    const filteredAlbums = albums.filter((album) =>
      album.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    const filteredSongs = songs.filter((song) =>
      song.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

  const handleSelectAlbum = (albumId: number) => {
    const album = albums.find(
      (album) => album.id === albumId
    );

    if (!album) {
      return;
    }

    resetView();
    setSelectedAlbum(album);

  };

  const handleSelectArtist = (artistId: number) => {
    resetView();
    setSelectedArtistId(artistId);


    
  };

  const handleSongMenuOpen = (song: SongType, isAlbumPage: boolean) => {
    setSongMenuSong(song);
    setSongMenuIsAlbumPage(isAlbumPage);
    setSongMenuOpen(true);
  }

  function resetView()  {
    setSearchQuery("");
    setSelectedAlbum(null);
    setShowArtistList(false);
    setSelectedArtistId(null);
    setSideMenuOpen(false);
  }

    

  return (
    <main>
      {searchQuery.trim() ? (
        <SearchResults
            artists={filteredArtists}
            albums={filteredAlbums}
            songs={filteredSongs}
            onSelectArtist={handleSelectArtist}
            onSelectAlbum={handleSelectAlbum}
            onPlay={onPlay}
            onAddToQueue={onAddToQueue}
            onSongMenuOpen={handleSongMenuOpen}
        />
      ) : selectedArtistId ? (
        <ArtistPage
          artistId={selectedArtistId}
          onBack={() => setSelectedArtistId(null)}
          onSelectAlbum={(album) => {
            setSelectedArtistId(null);
            setSelectedAlbum(album);
          }}
        />
      ) : selectedAlbum ? (
        <AlbumPage
          album={selectedAlbum}
          onBack={() => setSelectedAlbum(null)}
          onPlay={onPlay}
          onSelectArtist={setSelectedArtistId}
          onAddToQueue={onAddToQueue}
          onSongMenuOpen={handleSongMenuOpen}
        />
      ) : showArtistList ? (
        <ArtistListPage
          artists={artists}
          onSelectArtist={setSelectedArtistId}
        />
      ) : (
      <div className="albums">
        <h2>Recently Played</h2>

        {recentAlbums.map((album) => (
          <AlbumLink
            key={album.id}
            album={album}
            onClick={album => handleSelectAlbum(album.id)}
            onSelectArtist={handleSelectArtist}
          />
        ))}
      </div>
      )}

      <Header
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onImportMusic={onImportMusic}
        onOpen={() => setSideMenuOpen(true)}
        onClose={() => setSideMenuOpen(false)}
        onShowArtists={() => {
          resetView();
          setShowArtistList(true);
        }}
        onHome={() => {
          resetView();
        }}
        onLogout={handleLogout}
        menuOpen={sideMenuOpen}
        userName={userName}

      />

      <SongMenu
        isOpen={songMenuOpen}
        onOpen={() => setSongMenuOpen(true)}
        onClose={() => setSongMenuOpen(false)}
        song={songMenuSong}
        isAlbumPage={songMenuIsAlbumPage}
        onAddToQueue={onAddToQueue}
        onSelectArtist={handleSelectArtist}
        onSelectAlbum={handleSelectAlbum}
      />




    <Player 
      song={currentSong} 
      onSongEnded={onSongEnded} 
      autoPlay={autoPlay} 
      onSelectArtist={handleSelectArtist}
      onSelectAlbum={handleSelectAlbum}
      
    />

    </main>
  );
}