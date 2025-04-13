import {
    Stig as ChecklistStig,
    Classification,
    Convert,
    Checklist as IChecklist,
    Rule,
    Status,
} from '@/api/generated/Checklist';
import { Group, IdentElement, Profile, Stig } from '@/api/generated/Stig';
import { v4 as uuidv4 } from 'uuid';

// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';

function getClassification(profile: Profile): Classification {
    const id = profile['+@id'];

    switch (id.split('_')[1]) {
        case 'Classified':
            return Classification.Classified;
        case 'Sensitive':
            return Classification.Sensitive;
        default:
            return Classification.Unclassified;
    }
}

export default class Checklist extends Convert {
    static vulnDiscussionRe = new RegExp(
        '/<VulnDiscussion>(.*)</VulnDiscussion>/'
    );

    static read = async (path: string) => {
        const data = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/data/stigs/checklist/${path}?${process.env.NEXT_PUBLIC_MANIFEST_VERSION}`
        );
        const checklist: IChecklist = Checklist.toChecklist(await data.text());
        return checklist;
    };

    static fromStig(stig: Stig, profiles: Profile[]): IChecklist {
        const { Benchmark } = stig;

        const profileIds = profiles.map((profile) => profile['+@id']);

        if (
            !profileIds.every((id) =>
                Benchmark.Profile.some((profile) => profile['+@id'] === id)
            )
        ) {
            throw new Error(`Profile not found in STIG`);
        }

        const stigId = uuidv4();

        const classification = getClassification(profiles[0]);

        const groups = Array.isArray(Benchmark.Group)
            ? Benchmark.Group
            : [Benchmark.Group];

        const groupsById = groups.reduce((acc, group) => {
            acc[group['+@id']] = group;
            return acc;
        }, {} as Record<string, Group>);

        const ruleIds = new Set(
            profiles.flatMap((profile) => {
                if (Array.isArray(profile.select)) {
                    return profile.select.flatMap(
                        (selection) => selection['+@idref']
                    );
                }
                return [profile.select['+@idref']];
            })
        );

        const rules: Rule[] = [];

        for (const ruleId of ruleIds) {
            const group: Group = groupsById[ruleId];

            const ident: IdentElement[] = Array.isArray(group.Rule.ident)
                ? group.Rule.ident
                : group.Rule.ident
                ? [group.Rule.ident]
                : [];

            const rule: Rule = {
                group_id_src: group['+@id'],
                group_tree: [
                    {
                        id: group['+@id'],
                        title: group.title,
                        description: group.description,
                    },
                ],
                group_id: group['+@id'],
                severity: group.Rule['+@severity'],
                group_title: group.Rule.title,
                rule_id_src: group.Rule['+@id'],
                rule_id: group.Rule['+@id'].replace('_rule', ''),
                rule_version: group.Rule.version,
                rule_title: group.Rule.title,
                fix_text: group.Rule.fixtext['+content'],
                weight: group.Rule['+@weight'],
                check_content: group.Rule.check['check-content'],
                check_content_ref: {
                    href: group.Rule.check['check-content-ref']['+@href'] || '',
                    name: group.Rule.check['check-content-ref']['+@name'],
                },
                classification,
                discussion:
                    group.Rule.description.match(
                        Checklist.vulnDiscussionRe
                    )?.[1] || '',
                false_positives: '',
                false_negatives: '',
                documentable: 'false',
                security_override_guidance: '',
                potential_impacts: '',
                third_party_tools: '',
                ia_controls: '',
                responsibility: '',
                mitigations: '',
                mitigation_control: '',
                legacy_ids: ident.reduce((acc, item) => {
                    if (item['+@system'] === 'http://cyber.mil/legacy') {
                        acc.push(item['+content']);
                    }
                    return acc;
                }, [] as string[]),
                ccis: ident.reduce((acc, item) => {
                    if (item['+@system'] === 'http://cyber.mil/cci') {
                        acc.push(item['+content']);
                    }
                    return acc;
                }, [] as string[]),
                reference_identifier: group.Rule.reference.identifier,
                uuid: uuidv4(),
                stig_uuid: stigId,
                status: Status.NotReviewed,
                overrides: {},
                comments: '',
                finding_details: '',
            };

            rules.push(rule);
        }

        const plainText = Array.isArray(stig.Benchmark['plain-text'])
            ? stig.Benchmark['plain-text']
            : [stig.Benchmark['plain-text']];

        const stigs: ChecklistStig = {
            stig_name: stig.Benchmark.title,
            display_name: stig.Benchmark['+@id'],
            stig_id: stig.Benchmark['+@id'].replaceAll('_', ' '),
            release_info:
                plainText.find((item) => item['+@id'] === 'release-info')?.[
                    '+content'
                ] || '',
            version: stig.Benchmark.version,
            uuid: uuidv4(),
            reference_identifier: groups[0].Rule.reference.identifier,
            size: rules.length,
            rules,
        };

        const checklist: IChecklist = {
            title: Benchmark.title,
            id: stigId,
            stigs: [stigs],
            active: false,
            mode: 2,
            has_path: true,
            target_data: {
                classification: null,
                comments: '',
                fqdn: '',
                host_name: '',
                ip_address: '',
                is_web_database: false,
                mac_address: '',
                role: '',
                target_type: '',
                technology_area: '',
                web_db_instance: '',
                web_db_site: '',
            },
            cklb_version: '1.0',
        };

        return checklist;
    }
}
