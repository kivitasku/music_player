import { useEffect, useState } from "react";

import type { Album as AlbumType } from "../types/Album";
import type { Artist as ArtistType } from "../types/Artist";
import type { Song as SongType } from "../types/Song";

import SearchResults from "./SearchResults";
import AlbumPage from "./AlbumPage";
import ArtistPage from "./ArtistPage";
import ArtistListPage from "./ArtistListPage";
import SideMenu from "./SideMenu";

import "./Main.css";

interface MainProps {
  albums: AlbumType[];
  artists: ArtistType[];
  songs: SongType[];
  onPlay: (song: SongType) => void;
  onImportMusic: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleLogout: () => void;
}

export default function Main({
  albums,
  artists,
  songs,
  onPlay,
  onImportMusic,
  searchQuery,
  setSearchQuery,
  handleLogout,
}: MainProps) {
  const [selectedAlbum, setSelectedAlbum] =
    useState<AlbumType | null>(null);

    const [selectedArtistId, setSelectedArtistId] =
    useState<number | null>(null);

    const [showArtistList, setShowArtistList] =
      useState(false);

    const [menuOpen, setMenuOpen] = useState(false);

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

  function resetView()  {
    setSearchQuery("");
    setSelectedAlbum(null);
    setShowArtistList(false);
    setSelectedArtistId(null);
    setMenuOpen(false);
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
        />
      ) : showArtistList ? (
        <ArtistListPage
          artists={artists}
          onSelectArtist={setSelectedArtistId}
        />
      ) : (
        <div className="albums">
          <p>wip</p>
        </div>
      )}



        <SideMenu
    isOpen={menuOpen}
    onOpen={() => setMenuOpen(true)}
    onClose={() => setMenuOpen(false)}
    onImportMusic={onImportMusic}
    onShowArtists={() => {
      resetView();
      setShowArtistList(true);

    }}
    onHome={() => {
      resetView();
    }}
    onLogout={handleLogout}
    
  />





    </main>
  );
}