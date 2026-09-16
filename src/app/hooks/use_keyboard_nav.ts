"use client";

import { useEffect } from "react";

/** True when the event should not trigger list navigation shortcuts. */
export const isEditingTarget = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
        return true;
    }
    const target = event.target as HTMLElement | null;
    if (!target) {
        return false;
    }
    return (
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
    );
};

/**
 * Shared j/k + arrow-key list navigation. `onMove` receives -1 or +1.
 * Handlers fire only while `enabled` and outside form fields.
 */
export const useKeyboardListNav = ({
    enabled = true,
    onMove,
    onEnter,
    onEscape,
}: {
    enabled?: boolean;
    onMove?: (delta: -1 | 1) => void;
    onEnter?: () => void;
    onEscape?: () => void;
}) => {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onEscape?.();
                return;
            }
            if (isEditingTarget(event)) {
                return;
            }
            switch (event.key) {
                case "j":
                case "ArrowDown":
                    if (onMove) {
                        event.preventDefault();
                        onMove(1);
                    }
                    break;
                case "k":
                case "ArrowUp":
                    if (onMove) {
                        event.preventDefault();
                        onMove(-1);
                    }
                    break;
                case "Enter":
                    onEnter?.();
                    break;
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [enabled, onMove, onEnter, onEscape]);
};
