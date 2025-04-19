"use client";
import { useChecklistContext } from "@/app/context/checklist";
import { Suspense } from "react";
import { Breadcrumbs } from "./breadcrumbs";
export const ChecklistView = ({ checklistId }: { checklistId: string }) => {
    const checklist = useChecklistContext();

    console.log("checklist", checklist);

    if (!checklist) {
        return null;
    }

    return (
        <Suspense>
            <Breadcrumbs />

            <section className="w-full flex flex-col">
                <h1 className="text-3xl my-6">{checklist?.title}</h1>
                <p>{checklist?.id}</p>
            </section>
        </Suspense>
    );
};
