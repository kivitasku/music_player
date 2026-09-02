import "./Header.css";
import SideMenu from "./SideMenu";

interface HeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onImportMusic?: () => void;
  onShowArtists: () => void;
  onHome: () => void;
  onLogout: () => void;
  onOpen: () => void;
  onClose: () => void;
  menuOpen: boolean;
  userName: string;
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
  menuOpen,
  userName
}: HeaderProps) {
  return (
    <header className="header">
      <div className="name-area">
        <h1>Music Player</h1>
          <p> Hello, {userName}! </p>

      </div>


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

