import type { Metadata } from "next";
import localFont from "next/font/local";
import { themeScript } from "@/app/components/ui/theme";
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

export const metadata: Metadata = {
    title: "STIG",
    description: "STIG",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
                <script src="/service-worker.js" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-canvas text-foreground`}
            >
                {children}
            </body>
        </html>
    );
}
