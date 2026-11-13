
import React, { useEffect, useRef, useState } from "react";
import styles from "./css/SearchBar.module.css";
import { FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

type Props = {
  value         : string;
  onSearch      : (value: string) => void;
  placeholder  ?: string;
  debounceTime ?: number;
  flex         ?: number;
};

const SearchBar = ({
  value,
  onSearch,
  placeholder = "Search...",
  debounceTime = 400,
  flex = 1,
}: Props): React.JSX.Element => {

  const [search, setSearch] = useState(value);

  const isFirstRender = useRef(true);
  const skipDebounce = useRef(false);

  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  useEffect(() => {
    if (value !== search) {
      skipDebounce.current = true;
      setSearch(value);
    }
  }, [value]);

  // Executa a pesquisa com debounce.
  useEffect(() => {

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (skipDebounce.current) {
      skipDebounce.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      onSearchRef.current(search.trim());
    }, debounceTime);

    return () => clearTimeout(timeout);

  }, [search, debounceTime]);

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
