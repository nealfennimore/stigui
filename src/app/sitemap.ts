import { Manifest } from "@/api/entities/Manifest";
import Stig, { Classification } from "@/api/entities/Stig";
import { URL } from "@/app/constants";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const manifest = await Manifest.init();
    const stigs = await Promise.all(
        manifest.elements.map(
            async (element) => await Stig.read(`${element.id}.json`)
        )
    );
    const stigWithGroups = (
        await Promise.all([
            ...stigs.flatMap(async (stig) => {
                return stig?.groups.flatMap((group) => {
                    return {
                        stig: stig,
                        group: group,
                    };
                });
            }),
        ])
    ).flat();

    const classifications = Object.values(Classification);
    const stigsWithClassifications = stigs.flatMap((stig) =>
        classifications.flatMap((classification) => ({
            stig,
            classification,
        }))
    );

    return [
        {
            url: URL,
            lastModified: new Date().toISOString(),
            priority: 1,
        },
        {
            url: `${URL}/stigs`,
            lastModified: new Date().toISOString(),
            priority: 1,
        },
        ...stigs.map((stig) => ({
            url: `${URL}/stigs/${stig.id}`,
            lastModified: new Date(stig.date),
            priority: 0.9,
        })),
        ...stigsWithClassifications.map(({ stig, classification }) => ({
            url: `${URL}/stigs/${stig.id}/${classification}`,
            lastModified: new Date(stig.date),
            changeFrequency: "monthly",
            priority: 0.7,
        })),
        ...stigWithGroups.map(({ group, stig }) => ({
            url: `${URL}/stigs/${stig.id}/groups/${group.id}`,
            lastModified: new Date(stig.date),
            changeFrequency: "monthly",
            priority: 0.9,
        })),
    ];
}
