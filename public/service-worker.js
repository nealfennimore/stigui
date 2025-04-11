if ('serviceWorker' in navigator) {
    // navigator.serviceWorker.register('/sw.js', { scope: '/data/stigs/' });
    // navigator.serviceWorker.register('/sw.js', {
    //     scope: '/data/stigs/schema/',
    // });
    navigator.serviceWorker.register('/sw.js');
}
