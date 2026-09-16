import {
    WorkbenchContent,
    WorkbenchShell,
} from "@/app/components/client/editor/shell";
import { JsonLd } from "@/app/components/json_ld";
import { Stigs } from "@/app/components/stigs";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { APPNAME, URL } from "@/app/constants";
import ManifestComponent from "@/app/context/manifest";
import type { Metadata } from "next";
import { Suspense } from "react";
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
            <WorkbenchShell active="stigs">
                <WorkbenchContent>
                    <Suspense fallback={<SkeletonTable rows={8} />}>
                        <Stigs />
                    </Suspense>
                </WorkbenchContent>
            </WorkbenchShell>
        </ManifestComponent>
    );
}
