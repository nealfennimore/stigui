import * as Framework from "@/api/entities/Manifest";
import { Footer } from "@/app/components/footer";
import { GroupView } from "@/app/components/group";
import { Main } from "@/app/components/main";
import { Navigation } from "@/app/components/navigation";
import ManifestComponent from "@/app/context/manifest";
import StigComponent from "@/app/context/stig";

export async function generateStaticParams() {
    const manifest = await Framework.Manifest.init();

    return (
        await Promise.all([
            ...manifest.elements.flatMap(async (element) => {
                const stig = await manifest.getStig(element.id);
                return stig?.groups.flatMap((group) => {
                    return {
                        stig_id: element.id,
                        group_id: group.id,
                    };
                });
            }),
        ])
    ).flat();
}

export default async function Page({
    params,
}: {
    params: Promise<{ stig_id: string; group_id: string }>;
}) {
    const { stig_id, group_id } = await params;

    return (
        <ManifestComponent>
            <StigComponent stigId={stig_id}>
                <Navigation />
                <Main>
                    <GroupView stigId={stig_id} groupId={group_id} />
                </Main>
                <Footer />
            </StigComponent>
        </ManifestComponent>
    );
}
