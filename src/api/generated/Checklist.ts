// To parse this data:
//
//   import { Convert, Checklist } from "./file";
//
//   const checklist = Convert.toChecklist(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Checklist {
    title: string;
    id: string;
    stigs: Stig[];
    active: boolean;
    mode: number;
    has_path: boolean;
    target_data: TargetData;
    cklb_version: string;
}

export interface Stig {
    stig_name: string;
    display_name: string;
    stig_id: string;
    release_info: string;
    version: string;
    uuid: string;
    reference_identifier: string;
    size: number;
    rules: Rule[];
}

export interface Rule {
    ccis: string[];
    check_content_ref: CheckContentRef;
    check_content: string;
    classification: Classification;
    comments: Comments;
    discussion: string;
    documentable: string;
    false_negatives: string;
    false_positives: string;
    finding_details: FindingDetails;
    fix_text: string;
    group_id_src: string;
    group_id: string;
    group_title: string;
    group_tree: GroupTree[];
    ia_controls: string;
    legacy_ids: string[];
    mitigation_control: string;
    mitigations: string;
    overrides: Overrides;
    potential_impacts: string;
    reference_identifier: string;
    responsibility: string;
    rule_id_src: string;
    rule_id: string;
    rule_title: string;
    rule_version: string;
    security_override_guidance: string;
    severity: Severity;
    status: Status;
    stig_uuid: string;
    third_party_tools: string;
    uuid: string;
    weight: string;
}

export type Href = String;

export interface CheckContentRef {
    href: Href;
    name: Name;
}

export enum Name {
    M = 'M',
}

export enum Classification {
    Unclassified = 'Unclassified',
    Classified = 'Classified',
    Sensitive = 'Sensitive',
}

export type Comments = string;

export type FindingDetails = string;

export interface GroupTree {
    id: string;
    title: string;
    description: Description;
}

export type Description = String;

export interface Overrides {
    severity?: {
        severity: Severity;
        reason: string;
    };
}

export enum Severity {
    High = 'high',
    Low = 'low',
    Medium = 'medium',
    Info = 'info',
}

export enum Status {
    NotAFinding = 'not_a_finding',
    NotApplicable = 'not_applicable',
    NotReviewed = 'not_reviewed',
    Open = 'open',
}

export enum TargetType {
    NonComputing = 'Non-Computing',
    Computing = 'Computing',
}

export enum Role {
    None = 'None',
    WebServer = 'Workstation',
    MemberServer = 'Member Server',
    DomainController = 'Domain Controller',
}

export enum TechnologyArea {
    None = 'None',
    ApplicationReview = 'Application Review',
    BoundarySecurity = 'Boundary Security',
    CDSAdminReview = 'CDS Admin Review',
    CDSTechnicalReview = 'CDS Technical Review',
    DatabaseReview = 'Database Review',
    DomainNameSystem = 'Domain Name System (DNS)',

    ExchangeServer = 'Exchange Server',
    HostBasedSystemSecurity = 'Host Based System Security (HBSS)',
    InternalNetwork = 'Internal Network',
    Mobility = 'Mobility',
    ReleasableNetworks = 'Releasable Networks (REL)',
    TraditionalSecurity = 'Traditional Security',
    UNIXOS = 'UNIX OS',
    VVOIPReview = 'VVOIP Review',
    WebReview = 'Web Review',
    WindowsOS = 'Windows OS',
    OtherReview = 'Other Review',
    Workstation = 'Workstation',
    MemberServer = 'Member Server',
    DomainController = 'Domain Controller',
}

export interface TargetData {
    target_type: TargetType;
    host_name: string;
    ip_address: string;
    mac_address: string;
    fqdn: string;
    comments: string;
    role: Role;
    is_web_database: boolean;
    technology_area: TechnologyArea;
    web_db_site: string;
    web_db_instance: string;
    classification: string | null;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toChecklist(json: string): Checklist {
        return cast(JSON.parse(json), r('Checklist'));
    }

    public static checklistToJson(value: Checklist): string {
        return JSON.stringify(uncast(value, r('Checklist')), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(
        `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
            val
        )}`
    );
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ
                .map((a) => {
                    return prettyTypeName(a);
                })
                .join(', ')}]`;
        }
    } else if (typeof typ === 'object' && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach(
            (p: any) => (map[p.json] = { key: p.js, typ: p.typ })
        );
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach(
            (p: any) => (map[p.js] = { key: p.json, typ: p.typ })
        );
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(
    val: any,
    typ: any,
    getProps: any,
    key: any = '',
    parent: any = ''
): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(
            cases.map((a) => {
                return l(a);
            }),
            val,
            key,
            parent
        );
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val))
            return invalidValue(l('array'), val, key, parent);
        return val.map((el) => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l('Date'), val, key, parent);
        }
        return d;
    }

    function transformObject(
        props: { [k: string]: any },
        additional: any,
        val: any
    ): any {
        if (val === null || typeof val !== 'object' || Array.isArray(val)) {
            return invalidValue(l(ref || 'object'), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach((key) => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key)
                ? val[key]
                : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(
                    val[key],
                    additional,
                    getProps,
                    key,
                    ref
                );
            }
        });
        return result;
    }

    if (typ === 'any') return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === 'object' && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === 'object') {
        return typ.hasOwnProperty('unionMembers')
            ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty('arrayItems')
            ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty('props')
            ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== 'number') return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    Checklist: o(
        [
            { json: 'title', js: 'title', typ: '' },
            { json: 'id', js: 'id', typ: '' },
            { json: 'stigs', js: 'stigs', typ: a(r('Stig')) },
            { json: 'active', js: 'active', typ: true },
            { json: 'mode', js: 'mode', typ: 0 },
            { json: 'has_path', js: 'has_path', typ: true },
            { json: 'target_data', js: 'target_data', typ: r('TargetData') },
            { json: 'cklb_version', js: 'cklb_version', typ: '' },
        ],
        false
    ),
    Stig: o(
        [
            { json: 'stig_name', js: 'stig_name', typ: '' },
            { json: 'display_name', js: 'display_name', typ: '' },
            { json: 'stig_id', js: 'stig_id', typ: '' },
            { json: 'release_info', js: 'release_info', typ: '' },
            { json: 'version', js: 'version', typ: '' },
            { json: 'uuid', js: 'uuid', typ: '' },
            {
                json: 'reference_identifier',
                js: 'reference_identifier',
                typ: '',
            },
            { json: 'size', js: 'size', typ: 0 },
            { json: 'rules', js: 'rules', typ: a(r('Rule')) },
        ],
        false
    ),
    Rule: o(
        [
            { json: 'group_id_src', js: 'group_id_src', typ: '' },
            { json: 'group_tree', js: 'group_tree', typ: a(r('GroupTree')) },
            { json: 'group_id', js: 'group_id', typ: '' },
            { json: 'severity', js: 'severity', typ: r('Severity') },
            { json: 'group_title', js: 'group_title', typ: '' },
            { json: 'rule_id_src', js: 'rule_id_src', typ: '' },
            { json: 'rule_id', js: 'rule_id', typ: '' },
            { json: 'rule_version', js: 'rule_version', typ: '' },
            { json: 'rule_title', js: 'rule_title', typ: '' },
            { json: 'fix_text', js: 'fix_text', typ: '' },
            { json: 'weight', js: 'weight', typ: '' },
            { json: 'check_content', js: 'check_content', typ: '' },
            {
                json: 'check_content_ref',
                js: 'check_content_ref',
                typ: r('CheckContentRef'),
            },
            {
                json: 'classification',
                js: 'classification',
                typ: r('Classification'),
            },
            { json: 'discussion', js: 'discussion', typ: '' },
            { json: 'false_positives', js: 'false_positives', typ: '' },
            { json: 'false_negatives', js: 'false_negatives', typ: '' },
            { json: 'documentable', js: 'documentable', typ: '' },
            {
                json: 'security_override_guidance',
                js: 'security_override_guidance',
                typ: '',
            },
            { json: 'potential_impacts', js: 'potential_impacts', typ: '' },
            { json: 'third_party_tools', js: 'third_party_tools', typ: '' },
            { json: 'ia_controls', js: 'ia_controls', typ: '' },
            { json: 'responsibility', js: 'responsibility', typ: '' },
            { json: 'mitigations', js: 'mitigations', typ: '' },
            { json: 'mitigation_control', js: 'mitigation_control', typ: '' },
            { json: 'legacy_ids', js: 'legacy_ids', typ: a('') },
            { json: 'ccis', js: 'ccis', typ: a('') },
            {
                json: 'reference_identifier',
                js: 'reference_identifier',
                typ: '',
            },
            { json: 'uuid', js: 'uuid', typ: '' },
            { json: 'stig_uuid', js: 'stig_uuid', typ: '' },
            { json: 'status', js: 'status', typ: r('Status') },
            { json: 'overrides', js: 'overrides', typ: r('Overrides') },
            { json: 'comments', js: 'comments', typ: r('Comments') },
            {
                json: 'finding_details',
                js: 'finding_details',
                typ: r('FindingDetails'),
            },
        ],
        false
    ),
    CheckContentRef: o(
        [
            { json: 'href', js: 'href', typ: '' },
            { json: 'name', js: 'name', typ: r('Name') },
        ],
        false
    ),
    GroupTree: o(
        [
            { json: 'id', js: 'id', typ: '' },
            { json: 'title', js: 'title', typ: '' },
            { json: 'description', js: 'description', typ: r('Description') },
        ],
        false
    ),
    Overrides: o([], false),
    TargetData: o(
        [
            { json: 'target_type', js: 'target_type', typ: '' },
            { json: 'host_name', js: 'host_name', typ: '' },
            { json: 'ip_address', js: 'ip_address', typ: '' },
            { json: 'mac_address', js: 'mac_address', typ: '' },
            { json: 'fqdn', js: 'fqdn', typ: '' },
            { json: 'comments', js: 'comments', typ: '' },
            { json: 'role', js: 'role', typ: '' },
            { json: 'is_web_database', js: 'is_web_database', typ: true },
            { json: 'technology_area', js: 'technology_area', typ: '' },
            { json: 'web_db_site', js: 'web_db_site', typ: '' },
            { json: 'web_db_instance', js: 'web_db_instance', typ: '' },
            { json: 'classification', js: 'classification', typ: null },
        ],
        false
    ),
    Href: [],
    Name: ['M'],
    Classification: ['Unclassified', 'Classified', 'Sensitive'],
    Comments: '',
    FindingDetails: '',
    Description: ['<GroupDescription></GroupDescription>'],
    Severity: ['high', 'low', 'medium', 'info'],
    Status: ['not_a_finding', 'not_applicable', 'not_reviewed', 'open'],
};
