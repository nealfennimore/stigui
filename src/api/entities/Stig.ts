import {
    Convert,
    Group as IGroup,
    Profile as IProfile,
    Rule as IRule,
    Select as ISelect,
    Stig as IStig,
} from '@/api/generated/Stig';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export class RuleWrapper {
    private _rule: IRule;
    constructor(rule: IRule) {
        this._rule = rule;
    }
    get rule() {
        return this._rule;
    }
    get id() {
        return this._rule['+@id'];
    }
    get title() {
        return this._rule.title;
    }
    get description() {
        return (
            this._rule.description.match(
                /<VulnDiscussion>(.*)<\/VulnDiscussion>/
            )?.[1] || this._rule.description
        );
    }
    get severity() {
        return this._rule['+@severity'];
    }
    get fixText() {
        return this._rule.fixtext['+content'];
    }
    get fix() {
        return this._rule.fix['+@id'];
    }
    get check() {
        return this._rule.check['check-content'];
    }
}
export class GroupWrapper {
    private _group: IGroup;
    constructor(group: IGroup) {
        this._group = group;
    }
    get group() {
        return this._group;
    }
    get id() {
        return this._group['+@id'];
    }
    get title() {
        return this._group.title;
    }
    get description() {
        return this._group.description;
    }
    get rule() {
        return new RuleWrapper(this._group.Rule);
    }
}

export class SelectWrapper {
    private _select: ISelect;
    constructor(select: ISelect) {
        this._select = select;
    }
    get select() {
        return this._select;
    }
    get id() {
        return this._select['+@idref'];
    }
    get selected() {
        return this._select['+@selected'];
    }
}

export class ProfileWrapper {
    private _profile: IProfile;
    constructor(profile: IProfile) {
        this._profile = profile;
    }
    get profile() {
        return this._profile;
    }
    get id() {
        return this._profile['+@id'];
    }
    get title() {
        return this._profile.title;
    }
    get description() {
        return this._profile.description;
    }
    get select() {
        const select = Array.isArray(this._profile.select)
            ? this._profile.select
            : [this._profile.select];
        return select.map((select) => new SelectWrapper(select));
    }
}

export class StigWrapper {
    private _stig: IStig;
    constructor(stig: IStig) {
        this._stig = stig;
    }
    get stig() {
        return this._stig;
    }
    get id() {
        return this._stig.Benchmark['+@id'];
    }
    get title() {
        return this._stig.Benchmark.title;
    }
    get description() {
        return this._stig.Benchmark.description;
    }

    get groups() {
        const groups = Array.isArray(this._stig.Benchmark.Group)
            ? this._stig.Benchmark.Group
            : [this._stig.Benchmark.Group];

        return groups.map((group) => new GroupWrapper(group));
    }

    get profiles() {
        return this._stig.Benchmark.Profile.map(
            (profile) => new ProfileWrapper(profile)
        );
    }

    get version() {
        return this._stig.Benchmark.version;
    }
}

export default class Stig extends Convert {
    private static cache = new Map<string, StigWrapper>();

    static read = async (path: string) => {
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }
        const data = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/data/stigs/schema/${path}`
        );
        const stig: IStig = Stig.toStig(await data.text());
        this.cache.set(path, new StigWrapper(stig));
        return this.cache.get(path);
    };
}
