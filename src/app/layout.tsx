import { Providers } from "@/app/components/client/providers";
import { APPNAME, URL as SITE_URL } from "@/app/constants";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
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
                {/* The build id in the URL makes each deploy a new worker
                    with its own cache; see public/sw.js. */}
                <Script id="service-worker">{`"serviceWorker" in navigator && navigator.serviceWorker.register("/sw.js?v=${encodeURIComponent(
                    process.env.NEXT_PUBLIC_BUILD_ID ?? "dev"
                )}", { scope: "/" });`}</Script>
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
