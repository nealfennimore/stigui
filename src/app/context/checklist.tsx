"use client";
import { Checklist } from "@/api/generated/Checklist";
import { IDB } from "@/app/db";
import React, { createContext, use, useContext } from "react";

export const ChecklistContext = createContext<Promise<Checklist | null> | null>(
    null
);
export function ChecklistProvider({
    children,
    value,
}: {
    children: React.ReactNode;
    value: Promise<Checklist | null> | null;
}) {
    return (
        <ChecklistContext.Provider value={value}>
            {children}
        </ChecklistContext.Provider>
    );
}

export function useChecklistContextPromise() {
    const context = useContext(ChecklistContext);
    if (!context) {
        throw new Error(
            "useChecklistContext must be used within a ChecklistProvider"
        );
    }
    return context;
}

export function useChecklistContext() {
    return use(useChecklistContextPromise());
}

export default function ChecklistComponent({
    checklistId,
    children,
}: {
    checklistId: string;
    children: React.ReactNode;
}) {
    const checklist = IDB.exportChecklist(checklistId);
    return <ChecklistProvider value={checklist}>{children}</ChecklistProvider>;
}
