import * as Framework from "@/api/entities/Manifest";
import { Footer } from "@/app/components/footer";
import { GroupView } from "@/app/components/group";
import { Main } from "@/app/components/main";
import { Navigation } from "@/app/components/navigation";
import ManifestComponent from "@/app/context/manifest";

export async function generateStaticParams() {
    const manifest = await Framework.Manifest.init();

    const a = await Promise.all([...manifest.elements.flatMap(async (element) => {
        const stig = await manifest.getStig(element.id);
        return stig?.groups.flatMap((group) => {
            // console.log(element.id, group.id);
            return {
                stig_id: element.id,
                group_id: group.id,
            }
        });
    })]);
    return a.flat();
}

export default async function Page({ params }) {
    const { stig_id, group_id } = await params;

    return (
        <ManifestComponent>
            <Navigation />
            <Main>
                <GroupView stigId={stig_id} groupId={group_id} />
            </Main>
            <Footer />
        </ManifestComponent>
    );
}
