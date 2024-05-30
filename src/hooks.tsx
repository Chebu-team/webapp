import React, { useState, useEffect, RefObject } from "react";
type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

export function useOutsideAlerter(
  ref: RefObject<HTMLElement>,
  setChooseNetSelected: SetStateAction<boolean>
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setChooseNetSelected(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setChooseNetSelected]);
}
