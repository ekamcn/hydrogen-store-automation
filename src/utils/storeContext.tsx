"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type StorePayload = {
  VITE_STORE_TITLE: string;
  VITE_STORE_NAME: string;
  VITE_CUSTOMER_SUPPORT_EMAIL: string;
  VITE_CUSTOMER_SERVICE_PHONE: string;
  VITE_DOMAIN_NAME: string;
  VITE_SHOPIFY_EMAIL?: string;
  VITE_SHOPIFY_ADMIN_ACCESS_TOKEN?: string;
  VITE_SHOPIFY_URL?: string;
  VITE_CATEGORY: string;
  VITE_LANGUAGE: string;
  VITE_COLOR1: string;
  VITE_COLOR2: string;
  VITE_LOGO?: string | { base64: string; fileName?: string };
  VITE_BANNER?: { base64: string; fileName: string };
  VITE_MOBILE_BANNER?: { base64: string; fileName: string };
  VITE_TYPOGRAPHY: string;
  VITE_COMPANY_NAME: string;
  VITE_COMPANY_ADDRESS: string;
  VITE_CHECKOUT_DOMAIN: string;
  VITE_CHECKOUT_ID: string;
  VITE_SQUARE_LOGO?: { base64: string; fileName: string };
  VITE_OFFER_ID_TYPE: string;
  customOfferIds?: Record<string, string | undefined>;
  VITE_DISCOVER_OUR_COLLECTIONS?: string[];
  [key: string]:
    | string
    | string[]
    | Record<string, string | undefined>
    | { base64: string; fileName: string }
    | undefined;
};

type StoreContextType = {
  payload: StorePayload;
  setPayload: (data: StorePayload) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Create a valid empty payload object
export const createEmptyPayload = (): StorePayload => ({
  VITE_STORE_TITLE: "",
  VITE_STORE_NAME: "",
  VITE_CUSTOMER_SUPPORT_EMAIL: "",
  VITE_CUSTOMER_SERVICE_PHONE: "",
  VITE_DOMAIN_NAME: "",
  VITE_SHOPIFY_EMAIL: "",
  VITE_SHOPIFY_ADMIN_ACCESS_TOKEN: "",
  VITE_SHOPIFY_URL: "",
  VITE_CATEGORY: "",
  VITE_LANGUAGE: "",
  VITE_COLOR1: "",
  VITE_COLOR2: "",
  VITE_LOGO: undefined,
  VITE_BANNER: undefined,
  VITE_MOBILE_BANNER: undefined,
  VITE_TYPOGRAPHY: "",
  VITE_COMPANY_NAME: "",
  VITE_COMPANY_ADDRESS: "",
  VITE_CHECKOUT_DOMAIN: "",
  VITE_CHECKOUT_ID: "",
  VITE_SQUARE_LOGO: undefined,
  VITE_OFFER_ID_TYPE: "",
  customOfferIds: {},
  VITE_DISCOVER_OUR_COLLECTIONS: [] as string[],
});

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [payload, setPayload] = useState<StorePayload>(createEmptyPayload());
  return (
    <StoreContext.Provider value={{ payload, setPayload }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreContext must be used inside StoreProvider");
  }
  return context;
};
