import { Convert, Stig as IStig } from '@/api/generated/Stig';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default class Stig extends Convert {
    static read = async (path: string) => {
        const data = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/data/stigs/schema/${path}`
        );
        const stig: IStig = Stig.toStig(await data.text());
        return stig;
    };
}
