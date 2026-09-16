"use client";
import { ChecklistView } from "@/app/components/checklist";
import { ChecklistsView } from "@/app/components/checklists";
import ManifestComponent from "@/app/context/manifest";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Boundary() {
    const params = useSearchParams();
    const checklistId = params.get("id");

    return (
        <ManifestComponent>
            {checklistId ? (
                <ChecklistView checklistId={checklistId} />
            ) : (
                <ChecklistsView />
            )}
        </ManifestComponent>
    );
}

export default function Page() {
    return (
        <Suspense>
            <Boundary />
        </Suspense>
    );
}
