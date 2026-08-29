import "./SideMenu.css";

interface SideMenuProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onImportMusic: () => void;
  onShowArtists: () => void;
  onHome: () => void;
  onLogout: () => void;
}

export default function SideMenu({
  isOpen,
  onOpen,
  onClose,
  onImportMusic,
  onShowArtists,
  onHome,
  onLogout,
}: SideMenuProps) {
  return (
    <>
      <button
        className="menu-button"
        onClick={onOpen}
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className={`side-menu ${isOpen ? "open" : ""}`}>
        <div className="side-menu-header">
          <h2>Menu</h2>

          <button
            className="close-menu"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>



        <button
          className="menu-item"
          onClick={onHome}
        >
          Home
        </button>

        <button
          className="menu-item"
          onClick={onShowArtists}
        >
          Artists
        </button>
        
        <button
          className="menu-item"
          onClick={onLogout}
        >
          Log out
        </button>

        <button
          className="menu-item"
          onClick={onImportMusic}
        >
          Run admin cmd
        </button>

      </div>
    </>
  );
}