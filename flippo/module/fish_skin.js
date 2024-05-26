const hyperfishElements = document.querySelectorAll('.hyperfish');

hyperfishElements.forEach(node => {
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
                node.querySelectorAll('span').forEach(child => {
                    child.style.visibility = 'hidden';
                });
            }
        });
    });

    // Start observing the node for configured mutations
    observer.observe(node, { childList: true, subtree: true });

});
console.log('fish skin!!')