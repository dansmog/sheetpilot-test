"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ModalType = "addLocation" | "addCompany" | "addEmployee" | null;

interface ModalContextType {
  openModal: ModalType;
  setOpenModal: (modal: ModalType) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const closeModal = () => setOpenModal(null);

  return (
    <ModalContext.Provider value={{ openModal, setOpenModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
