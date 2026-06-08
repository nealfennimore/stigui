import { Footer } from "@/app/components/footer";
import { JsonLd } from "@/app/components/json_ld";
import { Main } from "@/app/components/main";
import { Navigation } from "@/app/components/navigation";
import { Stigs } from "@/app/components/stigs";
import { APPNAME, URL } from "@/app/constants";
import ManifestComponent from "@/app/context/manifest";
import type { Metadata } from "next";
import "./db";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Security Technical Implementation Guides (STIGs)",
        alternates: {
            canonical: URL,
        },
    };
}

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APPNAME,
    url: URL,
    description:
        "Browse, search, and export Security Technical Implementation " +
        "Guides (STIGs).",
};

export default async function Page() {
    return (
        <ManifestComponent>
            <JsonLd data={jsonLd} />
            <Navigation />
            <Main>
                <Stigs />
            </Main>
            <Footer />
        </ManifestComponent>
    );
}
