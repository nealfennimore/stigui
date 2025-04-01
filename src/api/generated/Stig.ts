// To parse this data:
//
//   import { Convert, Stig } from "./file";
//
//   const stig = Convert.toStig(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Stig {
    '+p_xml': string;
    '+p_xml-stylesheet': string | undefined;
    Benchmark: Benchmark;
}

export interface Benchmark {
    '+@xmlns:dc': string;
    '+@xmlns:xsi': string;
    '+@xmlns:cpe': string;
    '+@xmlns:xhtml': string;
    '+@xmlns:dsig': string;
    '+@xsi:schemaLocation': string;
    '+@id': string;
    '+@xml:lang': string;
    '+@xmlns': string;
    status: Status;
    title: string;
    description: string;
    notice: Notice;
    'front-matter': Matter | undefined;
    'rear-matter': Matter | undefined;
    reference: BenchmarkReference;
    'plain-text': PlainText[] | PlainText;
    version: string;
    Profile: Profile[];
    Group: Group[] | Group;
}

export interface Profile {
    '+@id': string;
    title: string;
    description: Description;
    select: Select[] | Select;
}

export interface Group {
    '+@id': string;
    title: string;
    description: Description;
    Rule: Rule;
}

export interface Rule {
    '+@id': string;
    '+@weight': string;
    '+@severity': Severity;
    version: string;
    title: string;
    description: string;
    reference: RuleReference;
    ident: IdentElement[] | IdentElement | undefined;
    fixtext: Fixtext;
    fix: Fix;
    check: Check;
}

export enum Severity {
    High = 'high',
    Low = 'low',
    Medium = 'medium',
    Info = 'info',
}

export interface Check {
    '+@system': string;
    'check-content-ref': CheckContentRef;
    'check-content': string;
}

export interface CheckContentRef {
    '+@href': Href | undefined;
    '+@name': Name;
}

export type Href = String;

export enum Name {
    M = 'M',
}

export interface Fix {
    '+@id': string;
}

export interface Fixtext {
    '+content': string;
    '+@fixref': string;
}

export interface IdentElement {
    '+content': string;
    '+@system': string;
}

export interface RuleReference {
    title: Title;
    publisher: Publisher;
    type: Type;
    subject: Subject;
    identifier: string;
}

export type Publisher = String;

export type Subject = String;
export type Title = String;
export type Type = String;

export type Description = String;

export interface Select {
    '+@idref': string;
    '+@selected': string;
}

export interface Matter {
    '+@xml:lang': string;
}

export interface Notice {
    '+@id': string;
    '+@xml:lang': string;
}

export interface PlainText {
    '+content': string;
    '+@id': string;
}

export interface BenchmarkReference {
    '+@href': Href | undefined;
    publisher: Publisher | null;
    source: string;
}

export interface Status {
    '+content': string;
    '+@date': Date;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toStig(json: string): Stig {
        return cast(JSON.parse(json), r('Stig'));
    }

    public static stigToJson(value: Stig): string {
        return JSON.stringify(uncast(value, r('Stig')), null, 2);
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
    Stig: o(
        [
            { json: '+p_xml', js: '+p_xml', typ: '' },
            {
                json: '+p_xml-stylesheet',
                js: '+p_xml-stylesheet',
                typ: u('', undefined),
            },
            { json: 'Benchmark', js: 'Benchmark', typ: r('Benchmark') },
        ],
        false
    ),
    Benchmark: o(
        [
            { json: '+@xmlns:dc', js: '+@xmlns:dc', typ: '' },
            { json: '+@xmlns:xsi', js: '+@xmlns:xsi', typ: '' },
            { json: '+@xmlns:cpe', js: '+@xmlns:cpe', typ: '' },
            { json: '+@xmlns:xhtml', js: '+@xmlns:xhtml', typ: '' },
            { json: '+@xmlns:dsig', js: '+@xmlns:dsig', typ: '' },
            {
                json: '+@xsi:schemaLocation',
                js: '+@xsi:schemaLocation',
                typ: '',
            },
            { json: '+@id', js: '+@id', typ: '' },
            { json: '+@xml:lang', js: '+@xml:lang', typ: '' },
            { json: '+@xmlns', js: '+@xmlns', typ: '' },
            { json: 'status', js: 'status', typ: r('Status') },
            { json: 'title', js: 'title', typ: '' },
            { json: 'description', js: 'description', typ: '' },
            { json: 'notice', js: 'notice', typ: r('Notice') },
            {
                json: 'front-matter',
                js: 'front-matter',
                typ: u(undefined, r('Matter')),
            },
            {
                json: 'rear-matter',
                js: 'rear-matter',
                typ: u(undefined, r('Matter')),
            },
            {
                json: 'reference',
                js: 'reference',
                typ: r('BenchmarkReference'),
            },
            {
                json: 'plain-text',
                js: 'plain-text',
                typ: u(r('PlainText'), a(r('PlainText'))),
            },
            { json: 'version', js: 'version', typ: '' },
            { json: 'Profile', js: 'Profile', typ: a(r('Profile')) },
            { json: 'Group', js: 'Group', typ: u(r('Group'), a(r('Group'))) },
        ],
        false
    ),
    Group: o(
        [
            { json: '+@id', js: '+@id', typ: '' },
            { json: 'title', js: 'title', typ: '' },
            { json: 'description', js: 'description', typ: r('Description') },
            { json: 'Rule', js: 'Rule', typ: r('Rule') },
        ],
        false
    ),
    Profile: o(
        [
            { json: '+@id', js: '+@id', typ: '' },
            { json: 'title', js: 'title', typ: '' },
            { json: 'description', js: 'description', typ: r('Description') },
            {
                json: 'select',
                js: 'select',
                typ: u(r('Select'), a(r('Select'))),
            },
        ],
        false
    ),
    Rule: o(
        [
            { json: '+@id', js: '+@id', typ: '' },
            { json: '+@weight', js: '+@weight', typ: '' },
            { json: '+@severity', js: '+@severity', typ: r('Severity') },
            { json: 'version', js: 'version', typ: '' },
            { json: 'title', js: 'title', typ: '' },
            { json: 'description', js: 'description', typ: '' },
            { json: 'reference', js: 'reference', typ: r('RuleReference') },
            {
                json: 'ident',
                js: 'ident',
                typ: u(a(r('IdentElement')), r('IdentElement'), undefined),
            },
            { json: 'fixtext', js: 'fixtext', typ: r('Fixtext') },
            { json: 'fix', js: 'fix', typ: r('Fix') },
            { json: 'check', js: 'check', typ: r('Check') },
        ],
        false
    ),
    Check: o(
        [
            { json: '+@system', js: '+@system', typ: '' },
            {
                json: 'check-content-ref',
                js: 'check-content-ref',
                typ: r('CheckContentRef'),
            },
            { json: 'check-content', js: 'check-content', typ: '' },
        ],
        false
    ),
    CheckContentRef: o(
        [
            { json: '+@href', js: '+@href', typ: u(undefined, r('Href')) },
            { json: '+@name', js: '+@name', typ: r('Name') },
        ],
        false
    ),
    Fix: o([{ json: '+@id', js: '+@id', typ: '' }], false),
    Fixtext: o(
        [
            { json: '+content', js: '+content', typ: '' },
            { json: '+@fixref', js: '+@fixref', typ: '' },
        ],
        false
    ),
    IdentElement: o(
        [
            { json: '+content', js: '+content', typ: '' },
            { json: '+@system', js: '+@system', typ: '' },
        ],
        false
    ),
    RuleReference: o(
        [
            { json: 'title', js: 'title', typ: r('Title') },
            {
                json: 'publisher',
                js: 'publisher',
                typ: u(undefined, r('Publisher')),
            },
            { json: 'type', js: 'type', typ: r('Type') },
            { json: 'subject', js: 'subject', typ: r('Subject') },
            { json: 'identifier', js: 'identifier', typ: '' },
        ],
        false
    ),
    Select: o(
        [
            { json: '+@idref', js: '+@idref', typ: '' },
            { json: '+@selected', js: '+@selected', typ: '' },
        ],
        false
    ),
    Matter: o([{ json: '+@xml:lang', js: '+@xml:lang', typ: '' }], false),
    Notice: o(
        [
            { json: '+@id', js: '+@id', typ: '' },
            { json: '+@xml:lang', js: '+@xml:lang', typ: '' },
        ],
        false
    ),
    PlainText: o(
        [
            { json: '+content', js: '+content', typ: '' },
            { json: '+@id', js: '+@id', typ: '' },
        ],
        false
    ),
    BenchmarkReference: o(
        [
            { json: '+@href', js: '+@href', typ: u(undefined, r('Href')) },
            {
                json: 'publisher',
                js: 'publisher',
                typ: u(null, r('Publisher')),
            },
            { json: 'source', js: 'source', typ: '' },
        ],
        false
    ),
    Status: o(
        [
            { json: '+content', js: '+content', typ: '' },
            { json: '+@date', js: '+@date', typ: Date },
        ],
        false
    ),
    Severity: ['high', 'low', 'medium', 'info'],
    Href: '',
    Name: ['M'],
    Publisher: '',
    Subject: '',
    Title: '',
    Type: '',
    Description: '',
};
