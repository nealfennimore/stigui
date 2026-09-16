import {
    WorkbenchContent,
    WorkbenchShell,
} from "@/app/components/client/editor/shell";
import { Stigs } from "@/app/components/stigs";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { URL } from "@/app/constants";
import ManifestComponent from "@/app/context/manifest";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Security Technical Implementation Guides (STIGs)",
        alternates: {
            canonical: `${URL}/stigs`,
        },
    };
}

export default async function Page() {
    return (
        <ManifestComponent>
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
