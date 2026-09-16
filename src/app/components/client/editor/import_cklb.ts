"use client";
import { Checklist, Convert } from "@/api/generated/Checklist";
import { useToast } from "@/app/components/ui/toast";
import { IDB } from "@/app/db";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const importChecklistFile = async (file: File): Promise<Checklist> => {
    const checklist = Convert.toChecklist(await file.text());
    await IDB.importChecklist(checklist);
    return checklist;
};

/** Import a .cklb file, toast the outcome and open the checklist. */
export const useImportChecklist = () => {
    const { toast } = useToast();
    const router = useRouter();

    return useCallback(
        async (file: File) => {
            try {
                const checklist = await importChecklistFile(file);
                toast({
                    tone: "success",
                    title: "Checklist imported",
                    description: `Opening "${checklist.title}"…`,
                });
                router.push(`/editor?id=${checklist.id}`);
            } catch (error) {
                console.error(error);
                toast({
                    tone: "danger",
                    title: "Import failed",
                    description:
                        "Could not import that file. Make sure it is a valid .cklb checklist.",
                });
            }
        },
        [toast, router]
    );
};
