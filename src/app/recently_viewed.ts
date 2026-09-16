const KEY = "stigui:recent-stigs";
const LIMIT = 8;

export type RecentStig = {
    id: string;
    title: string;
    viewedAt: number;
};

/** Most recent first. Returns [] when localStorage is unavailable. */
export const getRecent = (): RecentStig[] => {
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(
            (entry): entry is RecentStig =>
                typeof entry?.id === "string" &&
                typeof entry?.title === "string"
        );
    } catch {
        return [];
    }
};

export const recordView = (id: string, title: string) => {
    try {
        const next: RecentStig[] = [
            { id, title, viewedAt: Date.now() },
            ...getRecent().filter((entry) => entry.id !== id),
        ].slice(0, LIMIT);
        window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        // Private mode or storage quota; recents are best-effort.
    }
};
