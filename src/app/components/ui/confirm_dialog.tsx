"use client";

import { Button } from "@/app/components/ui/button";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

export type ConfirmOptions = {
    title: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "danger" | "default";
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Promise-based replacement for window.confirm, rendered with a native
 * <dialog> (focus trap, Escape, and top-layer stacking come for free).
 */
export const useConfirm = (): ConfirmFn => {
    const confirm = useContext(ConfirmContext);
    if (!confirm) {
        throw new Error("useConfirm requires a ConfirmProvider ancestor.");
    }
    return confirm;
};

type PendingConfirm = {
    options: ConfirmOptions;
    resolve: (confirmed: boolean) => void;
};

export const ConfirmProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [pending, setPending] = useState<PendingConfirm | null>(null);

    const confirm = useCallback<ConfirmFn>((options) => {
        return new Promise<boolean>((resolve) => {
            setPending((previous) => {
                // A second confirm while one is open cancels the first.
                previous?.resolve(false);
                return { options, resolve };
            });
        });
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (pending && dialog && !dialog.open) {
            dialog.showModal();
        }
    }, [pending]);

    const settle = (confirmed: boolean) => {
        pending?.resolve(confirmed);
        setPending(null);
        dialogRef.current?.close();
    };

    const options = pending?.options;

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <dialog
                ref={dialogRef}
                onCancel={(event) => {
                    event.preventDefault();
                    settle(false);
                }}
                onClick={(event) => {
                    // Clicks on the backdrop land on the dialog element itself.
                    if (event.target === dialogRef.current) {
                        settle(false);
                    }
                }}
                className="rounded-lg border border-border bg-surface text-foreground p-6 shadow-overlay backdrop:bg-black/50 w-full max-w-md"
            >
                {options && (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold text-foreground">
                            {options.title}
                        </h2>
                        {options.description && (
                            <div className="text-sm text-muted">
                                {options.description}
                            </div>
                        )}
                        <div className="flex justify-end gap-3 mt-2">
                            <Button
                                variant="secondary"
                                onClick={() => settle(false)}
                            >
                                {options.cancelLabel ?? "Cancel"}
                            </Button>
                            <Button
                                variant={
                                    options.tone === "danger"
                                        ? "danger"
                                        : "primary"
                                }
                                autoFocus
                                onClick={() => settle(true)}
                            >
                                {options.confirmLabel ?? "Confirm"}
                            </Button>
                        </div>
                    </div>
                )}
            </dialog>
        </ConfirmContext.Provider>
    );
};
