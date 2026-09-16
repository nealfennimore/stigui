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

/**
 * Run `work` inside one readwrite transaction that spans `tables`.
 * Requests issued from `work` (and from their success callbacks) all
 * commit or abort together, so a multi-hundred-rule STIG is one write.
 */
const runTransaction = async (
    tables: Table[],
    work: (tx: IDBTransaction) => void
): Promise<void> => {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(tables, Permission.READWRITE);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
        work(tx);
    });
};

/** Delete every record an index maps to `query`, within `tx`. */
const deleteByIndex = (
    tx: IDBTransaction,
    table: Table,
    index: string,
    query: IDBValidKey | IDBKeyRange,
    onDone?: () => void
) => {
    const store = tx.objectStore(table);
    const request = store.index(index).getAllKeys(query);
    request.onsuccess = () => {
        for (const key of request.result) {
            store.delete(key);
        }
        onDone?.();
    };
};

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

export const putMany =
    <T>(table: string) =>
    async (data: T[]): Promise<void> => {
        if (!data.length) {
            return;
        }
        // One readwrite transaction so bulk updates are atomic and fast.
        const store = await getStore(table, Permission.READWRITE);
        return new Promise<void>((resolve, reject) => {
            for (const record of data) {
                store.put(record);
            }
            store.transaction.oncomplete = () => resolve();
            store.transaction.onerror = () => reject();
            store.transaction.onabort = () => reject();
        });
    };

export const del =
    (table: string) =>
    async (key: IDBValidKey): Promise<boolean> => {
        const store = await getStore(table, Permission.READWRITE);
        return new Promise<boolean>((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => {
                resolve(true);
            };
            request.onerror = () => {
                reject(false);
            };
        });
    };

export const delMany =
    (table: string) =>
    async (keys: IDBValidKey[]): Promise<void> => {
        if (!keys.length) {
            return;
        }
        const store = await getStore(table, Permission.READWRITE);
        return new Promise<void>((resolve, reject) => {
            for (const key of keys) {
                store.delete(key);
            }
            store.transaction.oncomplete = () => resolve();
            store.transaction.onerror = () => reject();
            store.transaction.onabort = () => reject();
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
    putMany: (data: T[]) => Promise<void>;
    del: (key: IDBValidKey) => Promise<boolean>;
    delMany: (keys: IDBValidKey[]) => Promise<void>;
    clear: () => Promise<boolean>;
    store: (permission: Permission) => Promise<IDBObjectStore>;

    constructor(table: Table) {
        this.table = table;
        this.getAll = getAll<T>(table);
        this.get = get<T>(table);
        this.put = put<T>(table);
        this.putMany = putMany<T>(table);
        this.del = del(table);
        this.delMany = delMany(table);
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

/** Queue one STIG's records (metadata, link, rules) on an open transaction. */
const writeStig = (tx: IDBTransaction, checklistId: string, stigData: Stig) => {
    const { rules, ...stig } = stigData;
    tx.objectStore(Table.STIGS).put(stig);
    tx.objectStore(Table.CHECKLIST_STIGS).put({
        checklist_id: checklistId,
        stig_uuid: stig.uuid,
    });
    const ruleStore = tx.objectStore(Table.RULES);
    for (const rule of rules) {
        if (rule.uuid) {
            ruleStore.put(rule);
        }
    }
};

/** Queue removal of one STIG's rules, links and metadata on `tx`. */
const eraseStig = (tx: IDBTransaction, checklistId: string, stigUuid: string) => {
    deleteByIndex(tx, Table.RULES, "stig_uuid", stigUuid);
    deleteByIndex(tx, Table.CHECKLIST_STIGS, "checklist_stig", [
        checklistId,
        stigUuid,
    ]);
    tx.objectStore(Table.STIGS).delete(stigUuid);
};

export class IDB {
    static checklists = new StoreWrapper<IDBChecklist>(Table.CHECKLISTS);
    static stigs = new StoreWrapper<IDBStig>(Table.STIGS);
    static rules = new StoreWrapper<IDBRule>(Table.RULES);
    static checklistStigs = new StoreWrapper<IDBChecklistStig>(
        Table.CHECKLIST_STIGS
    );

    static version = version;

    static async exportChecklist(
        checklistId: string
    ): Promise<Checklist | null> {
        if (typeof window === "undefined") {
            return Promise.resolve(null);
        }
        try {
            // Get checklist metadata
            const checklist = await IDB.checklists.get(checklistId);
            if (!checklist) {
                throw new Error("Checklist not found");
            }

            const links = await new IndexWrapper<IDBChecklistStig>(
                IDB.checklistStigs.table,
                "checklist_id"
            ).getAll(checklistId);

            const stigUuids = links.map((link) => link.stig_uuid);
            const rulesIdx = new IndexWrapper<IDBRule>(
                IDB.rules.table,
                "stig_uuid"
            );

            // Fetch every STIG and its rules concurrently.
            const [stigs, rulesPerStig] = await Promise.all([
                Promise.all(stigUuids.map((uuid) => IDB.stigs.get(uuid))),
                Promise.all(stigUuids.map((uuid) => rulesIdx.getAll(uuid))),
            ]);

            const result: Checklist = {
                ...checklist,
                stigs: stigs.map((stig, index) => ({
                    ...stig,
                    rules: rulesPerStig[index],
                    size: rulesPerStig[index].length,
                })),
            };

            return result;
        } catch (error) {
            console.error("Error exporting checklist:", error);
            throw error;
        }
    }

    static async addStig(
        checklistId: string,
        stigData: Stig
    ): Promise<boolean> {
        try {
            await runTransaction(
                [Table.STIGS, Table.CHECKLIST_STIGS, Table.RULES],
                (tx) => writeStig(tx, checklistId, stigData)
            );
            return true;
        } catch (error) {
            console.error("Error adding stig to checklist:", error);
            return false;
        }
    }

    static async removeStig(
        checklistId: string,
        stigUuid: string
    ): Promise<boolean> {
        try {
            await runTransaction(
                [Table.STIGS, Table.CHECKLIST_STIGS, Table.RULES],
                (tx) => eraseStig(tx, checklistId, stigUuid)
            );
            return true;
        } catch (error) {
            console.error("Error removing stig from checklist:", error);
            return false;
        }
    }

    static async removeChecklist(checklistId: string): Promise<boolean> {
        try {
            await runTransaction(
                [
                    Table.CHECKLISTS,
                    Table.STIGS,
                    Table.CHECKLIST_STIGS,
                    Table.RULES,
                ],
                (tx) => {
                    const links = tx
                        .objectStore(Table.CHECKLIST_STIGS)
                        .index("checklist_id")
                        .getAll(checklistId);
                    links.onsuccess = () => {
                        for (const link of links.result as IDBChecklistStig[]) {
                            eraseStig(tx, checklistId, link.stig_uuid);
                        }
                        tx.objectStore(Table.CHECKLISTS).delete(checklistId);
                    };
                }
            );
            return true;
        } catch (error) {
            console.error("Error removing checklist:", error);
            return false;
        }
    }

    static async importChecklist(checklistData: Checklist): Promise<boolean> {
        try {
            const { stigs, ...checklist } = checklistData;
            await runTransaction(
                [
                    Table.CHECKLISTS,
                    Table.STIGS,
                    Table.CHECKLIST_STIGS,
                    Table.RULES,
                ],
                (tx) => {
                    tx.objectStore(Table.CHECKLISTS).put(checklist);
                    for (const stig of stigs) {
                        writeStig(tx, checklist.id, stig);
                    }
                }
            );
            return true;
        } catch (error) {
            console.error("Error importing checklist:", error);
            return false;
        }
    }
}

// @ts-ignore
typeof window !== "undefined" && (window.db = IDB);
