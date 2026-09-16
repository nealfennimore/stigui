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
    editor?: boolean;
}

export const Breadcrumbs = ({ stigId, group, editor }: BreadcrumbsProps) => {
    const manifest = useManifestContext();
    const links: BreadcrumbLink[] = editor
        ? [
              {
                  href: "/editor",
                  text: "Checklists",
              },
          ]
        : [
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

    return (
        <nav
            aria-label="Breadcrumb"
            className="flex w-full flex-row flex-wrap items-center justify-start text-[11.5px] font-medium"
        >
            {links.map((link, index) => (
                <span key={index} className="flex items-center">
                    <Link
                        className="text-subtle transition-colors hover:text-foreground hover:underline"
                        href={link.href}
                        aria-disabled={link.disabled}
                    >
                        {link.text}
                    </Link>
                    {index < links.length - 1 && (
                        <span aria-hidden="true" className="mx-2 text-wb-faint">
                            /
                        </span>
                    )}
                </span>
            ))}
        </nav>
    );
};
