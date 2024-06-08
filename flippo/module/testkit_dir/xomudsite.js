document.addEventListener('DOMContentLoaded', function() {
// Create a MutationObserver instance
const observer = new MutationObserver((mutationsList) => {
    console.log('Mutation observed'); // Debug: Log when a mutation is observed
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            console.log('ChildList mutation detected'); // Debug: Log specific mutation type
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    console.log(`Node added: ${node.tagName} -- ${node.parentNode}`); // Debug: Log added node tag name and parent
                    if (node.tagName === 'div' && node.parentNode === document.body) {
                        node.classList.add('container');
                        console.log(`Class 'container' added to: ${node.tagName}`); // Debug: Log when class is added
                    
                        // Find the first container div on the page
                        const firstContainer = document.querySelector('.container');
                        // If there's already a container, and it's not the current node
                        if (firstContainer && firstContainer !== node) {
                            // Move the current node underneath the first container
                            firstContainer.parentNode.insertBefore(node, firstContainer.nextSibling);
                            console.log(`Moved node to be under the first container`);
                        }
                    }
                }
            });
        }
    }
});

// Start observing the body for child node additions
observer.observe(document.body, { childList: true });
console.log('xomudsite classify'); // Debug: Confirm observer setup
})