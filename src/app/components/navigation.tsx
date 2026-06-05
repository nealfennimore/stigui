"use client";
import { APPNAME } from "@/app/constants";
import { ThemeToggle } from "@/app/components/ui/theme";
import { useEffect, useMemo, useRef, useState } from "react";

export const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLElement>(null);
    const onKeyDown = useMemo(
        () => (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        },
        []
    );
    const onClick = useMemo(
        () => (event: MouseEvent) => {
            if (menuRef.current?.contains(event.target as Node)) {
                return;
            }
            setIsOpen(false);
        },
        []
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", onKeyDown);
            document.addEventListener("click", onClick);
        } else {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("click", onClick);
        }
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("click", onClick);
        };
    }, [isOpen]);

    return (
        <nav className="bg-surface/90 backdrop-blur fixed w-full z-20 top-0 start-0 border-b border-border">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-3">
                <a
                    href="/"
                    className="flex items-center space-x-3 rtl:space-x-reverse"
                    tabIndex={100}
                >
                    <span className="self-center text-xl font-semibold tracking-tight whitespace-nowrap text-foreground flex items-center">
                        <img src="/shield.png" className="mr-2 w-[32px]" />
                        <span>{APPNAME}</span>
                    </span>
                </a>
                <div className="flex items-center md:order-2 gap-1">
                    <ThemeToggle />
                    <div className="relative inline-block text-left">
                        <div>
                            <button
                                type="button"
                                className="inline-flex w-full items-center justify-center gap-x-1.5 rounded-md bg-transparent p-2 text-muted hover:bg-surface-muted hover:text-foreground transition-colors"
                                id="menu-button"
                                aria-expanded={isOpen}
                                aria-haspopup="true"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 30 30"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    aria-hidden="true"
                                    data-slot="icon"
                                >
                                    <rect width="30" height="3" />
                                    <rect y="9" width="30" height="3" />
                                    <rect y="18" width="30" height="3" />
                                </svg>
                            </button>
                        </div>
                        {isOpen && (
                            <div
                                className="absolute top-12 right-0 z-[100] mt-2 w-56 origin-top-right rounded-lg bg-surface shadow-lg ring-1 ring-border focus:outline-none divide-y divide-border"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="menu-button"
                                tabIndex={-1}
                                onSubmit={() => setIsOpen(false)}
                                onKeyUp={() => setIsOpen(false)}
                                ref={menuRef}
                            >
                                <div className="py-1" role="none">
                                    <a
                                        href="/editor"
                                        className="flex flex-row items-center px-4 py-2 text-sm text-muted hover:bg-surface-muted hover:text-foreground transition-colors"
                                        tabIndex={100}
                                    >
                                        Editor
                                    </a>
                                </div>
                                <div className="py-1" role="none">
                                    <a
                                        href="https://github.com/nealfennimore/stig"
                                        className="flex flex-row items-center gap-2 px-4 py-2 text-sm text-muted hover:bg-surface-muted hover:text-foreground transition-colors"
                                        tabIndex={100}
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                                                clipRule="evenodd"
                                            ></path>
                                        </svg>
                                        GitHub
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
