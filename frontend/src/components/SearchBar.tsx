import React, { useEffect, useState } from "react";
import styles from "./css/SearchBar.module.css";
import { FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

type Props = {
  onSearch      : (value: string) => void;
  placeholder?  : string;
  debounceTime? : number;
  flex         ?: number;
};

const SearchBar = ({
  onSearch,
  placeholder = "Search...",
  debounceTime = 400,
  flex = 1,
}: Props): React.JSX.Element => {
  
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(search.trim());
    }, debounceTime);

    return () => clearTimeout(timeout);
  }, [search, debounceTime, onSearch]);

  const clearSearch = (): void => {
    setSearch("");
  };

  return (
    <div 
    className={styles.container}
    style={{ flex }}
    >
      <div className={styles.search_icon}>
        <FaSearch size={16} />
      </div>

      <input
        className={styles.input}
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {search.length > 0 && (
        <button
          type="button"
          className={styles.clear_icon}
          onClick={clearSearch}
          aria-label="Clear search"
        >
          <IoClose size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;