"use client";
import { GroupWrapper } from "@/api/entities/Stig";
import { useManifestContext } from "@/app/context/manifest";
import Link from "next/link";

interface BreadcrumbLink {
    href: string;
    text: string;
    disabled?: boolean;
}

interface BreadcrumbsProps {
    group?: GroupWrapper;
    stigId?: string;
}

export const Breadcrumbs = ({ stigId, group }: BreadcrumbsProps) => {
    const manifest = useManifestContext();
    const links: BreadcrumbLink[] = [
        {
            href: "/stigs",
            text: "STIGs",
        },
    ];

    if (stigId) {
        const stig = manifest.byId(stigId);
        links.push({
            href: `/stigs/${stigId}`,
            text: `${stig.title}`,
        });
    }

    if (group) {
        links.push({
            href: `/stigs/${stigId}/groups/${group.id}`,
            text: `${group.id}`,
        });
    }

    // if (familyId) {
    //     const family = manifest?.families?.byId[familyId];
    //     links.push({
    //         href: `/stigs/family/${familyId}`,
    //         text: `${family.element_identifier}: ${family.title}`,
    //     });
    // } else if (requirementId) {
    //     const requirement = manifest?.requirements?.byId[requirementId];
    //     const family = manifest?.families?.byId[requirement.family];
    //     links.push({
    //         href: `/stigs/family/${requirement.family}`,
    //         text: `${family.element_identifier}: ${family.title}`,
    //     });
    //     links.push({
    //         href: `/stigs/requirement/${requirementId}`,
    //         text: `${requirement.element_identifier}: ${requirement.title}`,
    //         disabled: true,
    //     });
    // }

    return (
        <aside>
            {links.map((link, index) => (
                <span key={index}>
                    <Link
                        className="text-sm text-zinc-400"
                        href={link.href}
                        aria-disabled={link.disabled}
                        tabIndex={60}
                    >
                        {link.text}
                    </Link>
                    {index < links.length - 1 && (
                        <span className="text-sm mx-2 text-zinc-300">
                            {" "}
                            &gt;{" "}
                        </span>
                    )}
                </span>
            ))}
        </aside>
    );
};
