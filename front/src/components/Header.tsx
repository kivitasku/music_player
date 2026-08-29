import "./Header.css";
import SideMenu from "./SideMenu";

interface HeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onImportMusic: () => void;
  onShowArtists: () => void;
  onHome: () => void;
  onLogout: () => void;
  onOpen: () => void;
  onClose: () => void;
  menuOpen: boolean;
}

export default function Header({
  searchQuery,
  onSearch,
  onImportMusic,
  onShowArtists,
  onHome,
  onLogout,
  onOpen,
  onClose,
  menuOpen
}: HeaderProps) {
  return (
    <header className="header">
      <h1>Music Player</h1>

      <input
        className="search-bar"
        type="search"
        placeholder="Search..."
        aria-label="Search music"
        value={searchQuery}
        onChange={(event) => onSearch(event.target.value)}
      />

      <div className="side-menu-container">
        <SideMenu
          isOpen={menuOpen}
          onOpen={onOpen}
          onClose={onClose}
          onImportMusic={onImportMusic}
          onShowArtists={onShowArtists}
          onHome={onHome}
          onLogout={onLogout}
          
        />
      </div>

      



    </header>
  );
}

