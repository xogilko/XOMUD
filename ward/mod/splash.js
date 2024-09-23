console.log('splash!');

// Array to keep track of active display elements for mode2
const activeDisplaysMode2 = [];

// Function to create and animate display elements
function createDisplayElement(innerHTML, mode) {
    const displayElement = document.createElement('div');
    displayElement.innerHTML = innerHTML;
    displayElement.style.position = 'absolute';
    displayElement.style.zIndex = '1000'; // Ensure it is on top of other elements
    displayElement.style.opacity = '1'; // Ensure full opacity for slide in
    displayElement.style.whiteSpace = 'nowrap';

    if (mode === 'mode1') {
        displayElement.style.left = '-100%'; // Start off-screen to the left
        displayElement.style.padding = '5px';
        displayElement.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        displayElement.style.borderRadius = '4px';
        displayElement.style.color = 'white';
        displayElement.style.textShadow = '2px 2px 2px black'; // Add text shadow with black color
        displayElement.style.transition = 'left 0.8s ease-out, transform 0.4s ease-out, opacity 0.2s ease-out'; // Custom transition for mode1
        document.body.appendChild(displayElement);

        // Calculate the top position based on the number of active displays
        const topPosition = 18 + document.querySelectorAll('.mode1').length * 20; // Adjust 20px for each new element
        displayElement.style.top = `${topPosition}px`;
        displayElement.classList.add('mode1');

        // Slide in the element
        setTimeout(() => {
            displayElement.style.left = '18px'; // Move into view
        }, 1); // Start sliding in shortly after adding to the document

        setTimeout(() => {
            displayElement.style.transition = 'left 2.6s ease-out, opacity 0.4s ease-out';
            displayElement.style.left = '100%'; // Move out of view to the right
            displayElement.style.opacity = '0'; // Fade out
            // Remove the element after the transition
            setTimeout(() => {
                displayElement.remove();
            }, 500); // Wait for the transition to complete
        }, 2000);
    } else if (mode === 'mode2') {
        displayElement.style.left = '-100%'; // Start off-screen to the left
        displayElement.style.padding = '3px';
        displayElement.style.fontSize = '0.64em';
        displayElement.style.color = 'black';
        displayElement.style.backgroundColor = 'white';
        displayElement.style.transition = 'left 0.2s ease-in, transform 0.2s ease-in, opacity 0.2s ease-in'; // Fast transition for mode2
        document.body.appendChild(displayElement);

        // Calculate the bottom position based on the number of active displays
        const bottomPosition = 18 + activeDisplaysMode2.length * 20; // Adjust 20px for each new element
        displayElement.style.bottom = `${bottomPosition}px`;

        // Slide in the element
        setTimeout(() => {
            displayElement.style.left = '5px'; // Move into view
        }, 100); // Start sliding in shortly after adding to the document

        // Add the element to the active displays array
        activeDisplaysMode2.push(displayElement);

        // Adjust the positions of all active displays
        for (let i = 0; i < activeDisplaysMode2.length; i++) {
            activeDisplaysMode2[i].style.bottom = `${18 + i * 20}px`;
        }

        // Prepare for shrink and fade out after 3 seconds
        setTimeout(() => {
            displayElement.style.transform = 'scale(0)'; // Shrink
            displayElement.style.opacity = '0'; // Fade out
            // Remove the element after the transition
            setTimeout(() => {
                displayElement.remove();
                // Remove the element from the active displays array
                const index = activeDisplaysMode2.indexOf(displayElement);
                if (index > -1) {
                    activeDisplaysMode2.splice(index, 1);
                    // Adjust the positions of remaining elements
                    for (let i = index; i < activeDisplaysMode2.length; i++) {
                        activeDisplaysMode2[i].style.bottom = `${18 + i * 20}px`;
                    }
                }
            }, 200); // Wait for the transition to complete
        }, 2000);
    }
}

// Access the meta tag with the specified attributes
const metaTag = document.querySelector('meta[portal][aux]');

if (metaTag) {
    // Extract the 'portal' and 'aux' attributes
    const portal = metaTag.getAttribute('portal');
    const aux = metaTag.getAttribute('aux');
    const chan = metaTag.getAttribute('chan');

    console.log(`portal: ${portal}, aux: ${aux}`);
    createDisplayElement(`<b>navi power on! channel:</b> <i>${chan}</i> <b>aux:</b> <i>${aux}</i>`, 'mode1');
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