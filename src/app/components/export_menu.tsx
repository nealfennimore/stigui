"use client";

import { buttonClasses } from "@/app/components/ui/button";
import React, { useEffect, useRef, useState } from "react";

export type ExportOption = {
    label: string;
    onSelect: () => void;
};

/** Dependency-free dropdown for export actions. */
export const ExportMenu = ({ options }: { options: ExportOption[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        const onDocumentClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };
        document.addEventListener("click", onDocumentClick);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("click", onDocumentClick);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block" ref={containerRef}>
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
                className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
                <svg
                    aria-hidden="true"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
                Export
                <svg
                    aria-hidden="true"
                    className={`w-3 h-3 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                    />
                </svg>
            </button>
            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 z-30 mt-1 w-40 rounded-lg border border-border bg-surface shadow-overlay py-1"
                >
                    {options.map((option) => (
                        <button
                            key={option.label}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setIsOpen(false);
                                option.onSelect();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-muted hover:bg-surface-muted hover:text-foreground transition-colors"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
