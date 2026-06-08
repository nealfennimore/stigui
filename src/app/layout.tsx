import { APPNAME, URL as SITE_URL } from "@/app/constants";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

const description =
    "Browse, search, and export Security Technical Implementation Guides " +
    "(STIGs) — the DISA configuration standards used to harden systems " +
    "against security risks.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "STIGUI — Security Technical Implementation Guides",
        template: `%s | ${APPNAME}`,
    },
    description,
    applicationName: APPNAME,
    icons: {
        icon: [
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
    },
    openGraph: {
        type: "website",
        siteName: APPNAME,
        url: SITE_URL,
        title: "STIGUI — Security Technical Implementation Guides",
        description,
        images: [
            {
                url: "/stigui-border.png",
                width: 1051,
                height: 391,
                alt: APPNAME,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "STIGUI — Security Technical Implementation Guides",
        description,
        images: ["/stigui-border.png"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script src="/theme.js" />
                <script src="/service-worker.js" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-zinc-900 dark:text-zinc-100`}
            >
                {children}
            </body>
        </html>
    );
}
