import { Convert, Stig } from '@/api/generated/Stig';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const read = async (path: string) => {
    const data = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/data/stigs/schema/${path}`
    );
    const stig: Stig = Convert.toStig(await data.text());
    return stig;
};
