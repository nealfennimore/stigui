const KEY = "stigui:last-checklist";

/** The checklist the Workbench nav item reopens. Best-effort storage. */
export const getLastChecklistId = (): string | null => {
    try {
        return window.localStorage.getItem(KEY);
    } catch {
        return null;
    }
};

export const setLastChecklistId = (id: string | null) => {
    try {
        if (id) {
            window.localStorage.setItem(KEY, id);
        } else {
            window.localStorage.removeItem(KEY);
        }
    } catch {
        // Private mode or storage quota; the nav item simply stays disabled.
    }
};
