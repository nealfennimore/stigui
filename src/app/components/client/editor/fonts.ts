import localFont from "next/font/local";

/**
 * IBM Plex, self-hosted (SIL OFL 1.1). Only the workbench imports this
 * module, so the library pages keep Geist and never preload these files.
 */
export const plexSans = localFont({
    src: [
        { path: "../../../fonts/IBMPlexSans-Regular.woff2", weight: "400" },
        { path: "../../../fonts/IBMPlexSans-Medium.woff2", weight: "500" },
        { path: "../../../fonts/IBMPlexSans-SemiBold.woff2", weight: "600" },
        { path: "../../../fonts/IBMPlexSans-Bold.woff2", weight: "700" },
    ],
    variable: "--font-plex-sans",
    display: "swap",
});

export const plexMono = localFont({
    src: [
        { path: "../../../fonts/IBMPlexMono-Regular.woff2", weight: "400" },
        { path: "../../../fonts/IBMPlexMono-Medium.woff2", weight: "500" },
        { path: "../../../fonts/IBMPlexMono-SemiBold.woff2", weight: "600" },
    ],
    variable: "--font-plex-mono",
    display: "swap",
});
