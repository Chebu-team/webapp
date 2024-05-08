"use client";
import React, { useEffect, useState } from "react";
import { useContext } from "react";

export interface DataContextType {
  chain: number;
  setChain: (value: number) => void;

  visibleMenuModal: boolean;
  setVisibleMenuModal: (value: boolean) => void;
}

const DataContext = React.createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: any) => {
  const T_KEY = "theme";

  const getInitialData = () => {
    //const initial = window.localStorage.getItem(T_KEY) ?? 0;
    const initial = 0;
    console.log("initial chain", initial);
    return Number(initial);
  };

  const [chain, setChain] = useState(getInitialData);
  const [visibleMenuModal, setVisibleMenuModal] = useState(false);

  const handleChain = (value: any) => {
    localStorage.setItem(T_KEY, value);
    console.log("setting chain", value);
    setChain(value);
  };

  const handleMenuModal = (value: any) => {
    setVisibleMenuModal(value);
  };

  return (
    <DataContext.Provider
      value={{
        chain,
        setChain: handleChain,
        visibleMenuModal,
        setVisibleMenuModal: handleMenuModal,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
