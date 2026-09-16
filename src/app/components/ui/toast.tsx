"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { v4 as uuid } from "uuid";

export type ToastTone = "success" | "danger" | "info" | "warning";

export type ToastOptions = {
    title: string;
    description?: string;
    tone?: ToastTone;
    /** Auto-dismiss delay in ms. 0 keeps the toast until closed. */
    duration?: number;
};

type ToastRecord = ToastOptions & { id: string };

type ToastApi = {
    toast: (options: ToastOptions) => string;
    dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export const useToast = (): ToastApi => {
    const api = useContext(ToastContext);
    if (!api) {
        throw new Error("useToast requires a ToastProvider ancestor.");
    }
    return api;
};

const toneAccents: Record<ToastTone, string> = {
    success: "border-l-success",
    danger: "border-l-danger",
    info: "border-l-info",
    warning: "border-l-warning",
};

const DEFAULT_DURATION = 5000;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<ToastRecord[]>([]);
    const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

    const dismiss = useCallback((id: string) => {
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
        setToasts((previous) => previous.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(
        (options: ToastOptions) => {
            const id = uuid();
            setToasts((previous) => [...previous, { ...options, id }]);
            const duration = options.duration ?? DEFAULT_DURATION;
            if (duration > 0) {
                timers.current.set(
                    id,
                    setTimeout(() => dismiss(id), duration)
                );
            }
            return id;
        },
        [dismiss]
    );

    useEffect(() => {
        const activeTimers = timers.current;
        return () => {
            activeTimers.forEach((timer) => clearTimeout(timer));
            activeTimers.clear();
        };
    }, []);

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <div
                role="region"
                aria-label="Notifications"
                // min-h-0 + pointer-events-none guard against the global
                // `body > div` min-height rule turning this into an overlay.
                className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm min-h-0 pointer-events-none"
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role={t.tone === "danger" ? "alert" : "status"}
                        className={`pointer-events-auto flex items-start gap-3 rounded-lg border border-border border-l-2 bg-surface p-4 shadow-overlay animate-[toast-in_150ms_ease-out] ${
                            toneAccents[t.tone ?? "info"]
                        }`}
                    >
                        <div className="flex flex-col gap-1 grow">
                            <p className="text-sm font-semibold text-foreground">
                                {t.title}
                            </p>
                            {t.description && (
                                <p className="text-sm text-muted">
                                    {t.description}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => dismiss(t.id)}
                            className="text-subtle hover:text-foreground transition-colors"
                        >
                            <svg
                                aria-hidden="true"
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 6l12 12M18 6L6 18"
                                />
                            </svg>
                            <span className="sr-only">Dismiss notification</span>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
