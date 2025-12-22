"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ModalType = "addLocation" | "addCompany" | "addEmployee" | null;

interface OverageWarningData {
  resourceType: "location" | "employee";
  currentCount: number | undefined;
  planLimit: number;
  overageCost: number;
  planName: string;
  onConfirm: () => void;
}

interface ModalContextType {
  openModal: ModalType;
  setOpenModal: (modal: ModalType) => void;
  closeModal: () => void;
  overageWarning: OverageWarningData | null;
  showOverageWarning: (data: OverageWarningData) => void;
  closeOverageWarning: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [overageWarning, setOverageWarning] =
    useState<OverageWarningData | null>(null);

  const closeModal = () => setOpenModal(null);
  const showOverageWarning = (data: OverageWarningData) =>
    setOverageWarning(data);
  const closeOverageWarning = () => setOverageWarning(null);

  return (
    <ModalContext.Provider
      value={{
        openModal,
        setOpenModal,
        closeModal,
        overageWarning,
        showOverageWarning,
        closeOverageWarning,
      }}
    >
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
