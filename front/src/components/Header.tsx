import "./Header.css";

interface HeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

export default function Header({
  searchQuery,
  onSearch,
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
    </header>
  );
}

