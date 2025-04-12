import Checklist from '@/api/entities/Checklist';
import Stig from '@/api/entities/Stig';
import { Profile as IProfile, Stig as IStig } from '@/api/generated/Stig';

interface IManifest {
    id: string;
    title: string;
    description: string;
    version: string;
}

export class ManifestStore {
    private manifest: IManifest[] = [];
    private _byId: Record<string, IManifest> = {};

    constructor(manifest: IManifest[]) {
        this.manifest = manifest;
        this._byId = manifest.reduce((acc, element) => {
            acc[element.id] = element;
            return acc;
        }, {} as Record<string, IManifest>);
    }

    get elements() {
        return this.manifest;
    }

    byId(stigId: string) {
        const record = this._byId[stigId];
        if (!record) {
            throw new Error(`Stig ${stigId} not found`);
        }
        return record;
    }

    async getStig(stigId: string) {
        return await Stig.read(`${stigId}.json`);
    }

    async getRule(stigId: string, ruleId: string) {
        const stig = await this.getStig(stigId);
        return stig?.groups.find((group) => {
            return group.rule.id === ruleId;
        });
    }
    async getGroup(stigId: string, groupId: string) {
        const stig = await this.getStig(stigId);
        return stig?.groups.find((group) => {
            return group.id === groupId;
        });
    }

    async toChecklist(stig: IStig, profiles: IProfile[]) {
        return Checklist.fromStig(stig, profiles);
    }
}

let manifestPromise = fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/data/stigs/manifest.json?${process.env.MANIFEST_VERSION}`
).then((r) => r.json());
let cache: ManifestStore | null = null;
export class Manifest {
    static async init() {
        if (cache) {
            return cache;
        }
        cache = new ManifestStore((await manifestPromise) as IManifest[]);
        return cache;
    }
}
