"use client";
import { ChecklistView } from "@/app/components/checklist";
import { Footer } from "@/app/components/client/footer";
import { Main } from "@/app/components/client/main";
import { Navigation } from "@/app/components/navigation";
import ChecklistComponent from "@/app/context/checklist";
import ManifestComponent from "@/app/context/manifest";
import { useSearchParams } from "next/navigation";

export default function Page() {
    const params = useSearchParams();
    const checklistId = params.get("id");
    if (!checklistId || typeof window === "undefined") {
        return null;
    }

    return (
        <ManifestComponent>
            <Navigation />
            <ChecklistComponent checklistId={checklistId}>
                <Main>
                    <ChecklistView checklistId={checklistId} />
                </Main>
            </ChecklistComponent>
            <Footer />
        </ManifestComponent>
    );
}
