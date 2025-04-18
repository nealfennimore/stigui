import { Footer } from "@/app/components/footer";
import { Main } from "@/app/components/main";
import { Navigation } from "@/app/components/navigation";
import { Stigs } from "@/app/components/stigs";
import ManifestComponent from "@/app/context/manifest";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "STIGs",
    };
}

export default async function Page() {
    return (
        <ManifestComponent>
            <Navigation />
            <Main>
                <Stigs />
            </Main>
            <Footer />
        </ManifestComponent>
    );
}
