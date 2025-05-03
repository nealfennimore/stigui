export const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

export const download = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
};
