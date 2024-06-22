const applyFishSkin = (node) => {
    // Hide the text inside the element
    node.querySelectorAll('span').forEach(child => {
        child.style.visibility = 'hidden'; // Hide text elements specifically
    });

    // Create and configure the img element
    const img = document.createElement('img');
    img.src = "https://pngfre.com/wp-content/uploads/fish-44-300x177.png";
    img.style.width = '5%';
    img.style.position = 'absolute';
    img.style.left = node.offsetLeft + 'px';
    img.style.top = node.offsetTop + 'px';

    // Append the img to the body or a specific container
    document.body.appendChild(img);

    // Function to handle element movement
    let lastPosition = node.offsetLeft;
    const checkPosition = () => {
        let currentPosition = node.offsetLeft;
        img.style.left = node.offsetLeft + 'px';
        img.style.top = node.offsetTop + 'px';
        if (currentPosition < lastPosition) {
            img.style.transform = 'scaleX(-1)'; // Flip image
        } else if (currentPosition > lastPosition) {
            img.style.transform = 'scaleX(1)'; // Flip image back
        }
        lastPosition = currentPosition;
        requestAnimationFrame(checkPosition);
    };
    checkPosition();

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                // Check if the node is removed
                mutation.removedNodes.forEach(removedNode => {
                    if (removedNode === node) {
                        img.remove(); // Remove the img element
                    }
                });

                // Hide text inside the element
                node.querySelectorAll('span').forEach(child => {
                    child.style.visibility = 'hidden';
                });
            }
        });
    });

    // Start observing the parent of the node for childList changes
    if (node.parentNode) {
        observer.observe(node.parentNode, { childList: true });
    }
};

// Apply fish skin to existing elements
document.querySelectorAll('.hyperfish').forEach(applyFishSkin);

// Observe the document body for new .hyperfish elements
const bodyObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(addedNode => {
                if (addedNode.classList && addedNode.classList.contains('hyperfish')) {
                    addedNode.child.style.visibility = 'hidden';
                    applyFishSkin(addedNode);
                }
                // Check for nested .hyperfish elements
                addedNode.querySelectorAll && addedNode.querySelectorAll('.hyperfish').forEach(applyFishSkin);
            });
        }
    });
});

bodyObserver.observe(document.body, { childList: true, subtree: true });

console.log('fish skin!!');