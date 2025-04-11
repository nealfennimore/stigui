"use client";
import Stig, { StigWrapper } from "@/api/entities/Stig";
import React, { createContext, use, useContext } from "react";

export const StigContext =
    createContext<Promise<StigWrapper> | null>(null);
export function StigProvider({
    children,
    value,
}: {
    children: React.ReactNode;
    value: Promise<StigWrapper> | null;
}) {
    return (
        <StigContext.Provider value={value}>
            {children}
        </StigContext.Provider>
    );
}

export function useStigContextPromise() {
    const context = useContext(StigContext);
    if (!context) {
        throw new Error(
            "useStigContext must be used within a StigProvider"
        );
    }
    return context;
}

export function useStigContext() {
    return use(useStigContextPromise());
}

export default function StigComponent({
    stigId,
    children,
}: {
    stigId: string;
    children: React.ReactNode;
}) {
    const stig = Stig.read(`${stigId}.json`) as Promise<StigWrapper>;
    return <StigProvider value={stig}>{children}</StigProvider>;
}
