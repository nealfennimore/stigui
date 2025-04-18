"use client";
import { Checklist, Rule, Stig } from "@/api/generated/Checklist";
export const version = 1;
let loader: Promise<IDBDatabase> | undefined;

enum Table {
    CHECKLISTS = "checklists",
    STIGS = "stigs",
    RULES = "rules",
    CHECKLIST_STIGS = "checklist_stigs",
}

if (typeof window !== "undefined") {
    const request = window?.indexedDB?.open("stigs", version);

    loader = new Promise((resolve, reject) => {
        request.onerror = (event) => {
            console.error("Can't use IndexDB");
            reject(event);
        };
        request.onsuccess = (event) => {
            const db = event.target?.result as IDBDatabase;
            resolve(db);
        };

        request.onupgradeneeded = function (event) {
            const db = event.target?.result as IDBDatabase;

            // Checklist store
            const checklistStore = db.createObjectStore(Table.CHECKLISTS, {
                keyPath: "id",
            });
            checklistStore.createIndex("title", "title", { unique: false });
            checklistStore.createIndex("active", "active", { unique: false });
            checklistStore.createIndex("mode", "mode", { unique: false });

            // STIG store
            const stigStore = db.createObjectStore(Table.STIGS, {
                keyPath: "uuid",
            });
            stigStore.createIndex("stig_id", "stig_id", { unique: false });
            stigStore.createIndex("stig_name", "stig_name", { unique: false });

            // Rule store
            const ruleStore = db.createObjectStore(Table.RULES, {
                keyPath: "uuid",
            });
            ruleStore.createIndex("group_id", "group_id", { unique: false });
            ruleStore.createIndex("rule_id", "rule_id", { unique: false });
            ruleStore.createIndex("stig_uuid", "stig_uuid", { unique: false });
            ruleStore.createIndex("status", "status", { unique: false });
            ruleStore.createIndex("severity", "severity", { unique: false });

            const checklistStigsStore = db.createObjectStore(
                Table.CHECKLIST_STIGS,
                {
                    keyPath: "id",
                    autoIncrement: true,
                }
            );
            checklistStigsStore.createIndex("checklist_id", "checklist_id", {
                unique: false,
            });
            checklistStigsStore.createIndex("stig_uuid", "stig_uuid", {
                unique: false,
            });

            // Composite index for quick lookups
            checklistStigsStore.createIndex(
                "checklist_stig",
                ["checklist_id", "stig_uuid"],
                { unique: true }
            );
        };
    });
}

export const getDB = function () {
    return loader || Promise.reject("Can't use IndexDB");
};

enum Permission {
    READONLY = "readonly",
    READWRITE = "readwrite",
}

export const getStore = async (table: string, permission: Permission) => {
    const db = await getDB();
    return db.transaction(table, permission).objectStore(table);
};
export const getIndex = async (
    table: string,
    permission: Permission,
    index: string
) => {
    const store = await getStore(table, permission);
    return store.index(index);
};

type StoreGenerator = Promise<IDBObjectStore | IDBIndex>;

export const getAll =
    <T>(table: string, index?: string) =>
    async (
        query: IDBKeyRange | IDBValidKey | null = null,
        count?: number
    ): Promise<T[]> => {
        let store: IDBObjectStore | IDBIndex = await getStore(
            table,
            Permission.READONLY
        );
        if (index) {
            // debugger;
            store = store.index(index) as IDBIndex;
        }
        const request = store.getAll(query, count);

        return new Promise<T[]>((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result as T[]);
            };
            request.onerror = () => {
                reject();
            };
        });
    };
export const get =
    <T>(table: string, index?: string) =>
    async (query: IDBKeyRange | IDBValidKey): Promise<T> => {
        let store: IDBObjectStore | IDBIndex = await getStore(
            table,
            Permission.READONLY
        );
        if (index) {
            // debugger;
            store = store.index(index) as IDBIndex;
        }
        const request = store.get(query);

        return new Promise<T>((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result as T);
            };
            request.onerror = () => {
                reject();
            };
        });
    };

export const put =
    <T>(table: string) =>
    async (data: T): Promise<T[]> => {
        const store = await getStore(table, Permission.READWRITE);
        return new Promise<T[]>((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => {
                resolve(request.result as T[]);
            };
            request.onerror = () => {
                reject();
            };
        });
    };

export const clear = (table: string) => async (): Promise<boolean> => {
    const store = await getStore(table, Permission.READWRITE);
    return new Promise<boolean>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => {
            resolve(true);
        };
        request.onerror = () => {
            reject(false);
        };
    });
};

class IndexWrapper<T> {
    getAll: (
        query?: IDBKeyRange | IDBValidKey | null,
        count?: number
    ) => Promise<T[]>;
    get: (query: IDBKeyRange | IDBValidKey) => Promise<T>;

    constructor(table: string, index: string) {
        this.getAll = getAll<T>(table, index);
        this.get = get<T>(table, index);
    }
}

class StoreWrapper<T> {
    public table: Table;
    getAll: (
        query?: IDBKeyRange | IDBValidKey | null,
        count?: number
    ) => Promise<T[]>;
    get: (query: IDBKeyRange | IDBValidKey) => Promise<T>;
    put: (data: T) => Promise<T[]>;
    clear: () => Promise<boolean>;
    store: (permission: Permission) => Promise<IDBObjectStore>;

    constructor(table: Table) {
        this.table = table;
        this.getAll = getAll<T>(table);
        this.get = get<T>(table);
        this.put = put<T>(table);
        this.clear = clear(table);
        this.store = (permission: Permission = Permission.READONLY) =>
            getStore(table, permission);
    }
}

// Interface for the intermediate table
export interface IDBChecklistStig {
    id?: number; // Optional as it's auto-incremented
    checklist_id: string;
    stig_uuid: string;
}

export type IDBChecklist = Omit<Checklist, "stigs">;
export type IDBStig = Omit<Stig, "rules">;
export type IDBRule = Rule;

export class IDB {
    static checklists = new StoreWrapper<IDBChecklist>(Table.CHECKLISTS);
    static stigs = new StoreWrapper<IDBStig>(Table.STIGS);
    static rules = new StoreWrapper<IDBRule>(Table.RULES);
    static checklistStigs = new StoreWrapper<IDBChecklistStig>(
        Table.CHECKLIST_STIGS
    );

    static version = version;

    static async exportChecklist(checklistId: string): Promise<IDBChecklist> {
        try {
            // Get checklist metadata
            const checklist = await IDB.checklists.get(checklistId);
            if (!checklist) {
                throw new Error("Checklist not found");
            }

            const stigChecklistsIdx = await new IndexWrapper<IDBChecklistStig>(
                IDB.checklistStigs.table,
                "checklist_id"
            ).getAll(checklistId);

            const stidUuids = stigChecklistsIdx.map((link) => link.stig_uuid);

            const stigs = await Promise.all(
                stidUuids.map((uuid) => IDB.stigs.get(uuid))
            );

            const rulesIdx = new IndexWrapper<IDBRule>(
                IDB.rules.table,
                "stig_uuid"
            );

            const rulesByStigUuid = await stidUuids.reduce(
                async (accPromise, uuid) => {
                    const acc = await accPromise;
                    const rules = await rulesIdx.getAll(uuid);
                    acc[uuid] = rules;
                    return acc;
                },
                Promise.resolve({} as Record<string, Rule[]>)
            );

            const result: Checklist = {
                ...checklist,
                stigs: stigs.map((stig) => ({
                    ...stig,
                    rules: rulesByStigUuid[stig.uuid],
                    size: rulesByStigUuid[stig.uuid].length,
                })),
            };

            return result;
        } catch (error) {
            console.error("Error exporting checklist:", error);
            throw error;
        }
    }

    static async importChecklist(checklistData: Checklist): Promise<boolean> {
        try {
            const { stigs: stigsData, ...checklist } = checklistData;
            await IDB.checklists.put(checklist);

            // Store STIGs and create relations
            for (const stigData of stigsData) {
                const { rules: rulesData, ...stig } = stigData;
                await IDB.stigs.put(stig);
                await IDB.checklistStigs.put({
                    checklist_id: checklist.id,
                    stig_uuid: stig.uuid,
                });
                for (const rule of rulesData) {
                    if (rule.uuid) {
                        await IDB.rules.put(rule);
                    }
                }
            }

            return true;
        } catch (error) {
            console.error("Error importing checklist:", error);
            return false;
        }
    }
}
