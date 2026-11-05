import { useRef, useEffect } from "react";

export const useMouseClickOuttaTargetDiv = (
  setter: React.Dispatch<React.SetStateAction<boolean>>
) => {

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setter(false);
      }
    };

    window.document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return { containerRef }
}