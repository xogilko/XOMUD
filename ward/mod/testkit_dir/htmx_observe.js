function initialize() {
    function waitForHtmx() {
        if (typeof window.htmx === 'undefined') {
            console.log("observer searching for HTMX...");
            setTimeout(waitForHtmx, 100); // Check every 100ms
        } else {
            console.log("observer found HTMX");
            setupHtmxObserver();
        }
    }

    function setupHtmxObserver() {
        console.log("Setting up HTMX observer");
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.querySelectorAll('[hx-trigger]').length) {
                        htmx.process(node);
                        console.log('HTMX processed a node');
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        console.log("HTMX observer is active");
    }

    waitForHtmx();
}
if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOMContentLoaded has already fired
    initialize();
}
