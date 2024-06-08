console.log('splash!');

// Array to keep track of active display elements
const activeDisplays = [];

// Function to create and animate display elements
function createDisplayElement(innerHTML, mode) {
    const displayElement = document.createElement('div');
    displayElement.innerHTML = innerHTML;
    displayElement.style.position = 'absolute';
    displayElement.style.left = '-100%'; // Start off-screen to the left
    displayElement.style.zIndex = '1000'; // Ensure it is on top of other elements
    displayElement.style.opacity = '1'; // Ensure full opacity for slide in
    displayElement.style.whiteSpace = 'nowrap';

    let leftStart, leftEnd, topOffset;

    // Apply styles and animations based on the mode
    if (mode === 'mode1') {
        displayElement.style.padding = '5px';
        displayElement.style.backgroundColor = 'black';
        displayElement.style.borderRadius = '5px';
        displayElement.style.color = 'white';
        displayElement.style.transition = 'left 0.5s ease-out, transform 0.5s ease-out, opacity 0.5s ease-out'; // Custom transition for mode1
        leftStart = '-100%';
        leftEnd = '18px';
        topOffset = 18;
    } else if (mode === 'mode2') {
        displayElement.style.padding = '3px';
        displayElement.style.fontSize = '0.64em';
        displayElement.style.color = 'black';
        displayElement.style.backgroundColor = 'white';
        displayElement.style.transition = 'left 0.2s ease-in, transform 0.2s ease-in, opacity 0.2s ease-in'; // Fast transition for mode2
        leftStart = '-50%';
        leftEnd = '5px';
        topOffset = 5;
    }

    document.body.appendChild(displayElement);

    // Calculate the top position based on the number of active displays
    const topPosition = topOffset + activeDisplays.length * 20; // Adjust 20px for each new element
    displayElement.style.top = `${topPosition}px`;

    // Slide in the element
    setTimeout(() => {
        displayElement.style.left = leftEnd; // Move into view
    }, 100); // Start sliding in shortly after adding to the document

    // Add the element to the active displays array
    activeDisplays.push(displayElement);

    // Prepare for shrink and fade out after 3 seconds
    setTimeout(() => {
        displayElement.style.transform = 'scale(0)'; // Shrink
        displayElement.style.opacity = '0'; // Fade out
        // Remove the element after the transition
        setTimeout(() => {
            displayElement.remove();
            // Remove the element from the active displays array
            const index = activeDisplays.indexOf(displayElement);
            if (index > -1) {
                activeDisplays.splice(index, 1);
                // Adjust the positions of remaining elements
                for (let i = index; i < activeDisplays.length; i++) {
                    activeDisplays[i].style.top = `${18 + i * 20}px`;
                }
            }
        }, mode === 'mode1' ? 500 : 200); // Wait for the transition to complete based on mode
    }, 2000);
}

// Access the meta tag with the specified attributes
const metaTag = document.querySelector('meta[portal][uri]');

if (metaTag) {
    // Extract the 'portal' and 'uri' attributes
    const portal = metaTag.getAttribute('portal');
    const uri = metaTag.getAttribute('uri');

    console.log(`Portal: ${portal}, URI: ${uri}`);
    createDisplayElement(`<b>navi power on! uri:</b> <i>${uri}</i>`, 'mode1');
} else {
    console.log('Meta tag with specified attributes not found.');
}

// Add a listener for any HTTP request being made
(function() {
    // Intercept XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        createDisplayElement(`<b>http request:</b> ${method} ${url}`, 'mode2');
        return originalOpen.apply(this, arguments);
    };

    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
        const method = (init && init.method) || 'GET';
        const url = (typeof input === 'string') ? input : input.url;
        createDisplayElement(`<b>http request:</b> ${method} ${url}`, 'mode2');
        return originalFetch.apply(this, arguments);
    };
})();