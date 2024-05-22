function fishFunction() {
    
    const fish = document.createElement('div');
    fish.className = 'hyperfish';
    fish.innerText = 'fish';
    fish.style.position = 'absolute';
    fish.style.left = `${Math.random() * window.innerWidth}px`;
    fish.style.top = `${Math.random() * window.innerHeight}px`;
    fish.style.transition = 'left 1s ease-out, top 1s ease-out';
    fish.style.color = getRandomColor();

    document.body.appendChild(fish);

    let directionX = Math.random() < 0.5 ? -1 : 1;
    let directionY = Math.random() < 0.5 ? -1 : 1;
    let speed = 2; // Reduced speed for more natural movement
    let darting = false;
    let moving = true;

    // Handle mouse movement
    document.addEventListener('mousemove', (event) => {
        handleMovement(event.clientX, event.clientY);
    });

    // Handle touch movement
    document.addEventListener('touchmove', (event) => {
        const touch = event.touches[0];
        handleMovement(touch.clientX, touch.clientY);
    });

    function handleMovement(x, y) {
        if (isNearMouse(fish, x, y)) {
            startDarting(x, y);
        }
    }

    function startDarting(x, y) {
        darting = true;
        fish.innerHTML = '<i>fish</i>'; // Change innerHTML to italicized when darting
        speed = 20; // Temporarily increase speed for darting
        directionX = x > parseInt(fish.style.left, 10) + fish.offsetWidth / 2 ? -1 : 1;
        directionY = y > parseInt(fish.style.top, 10) + fish.offsetHeight / 2 ? -1 : 1;
        setTimeout(() => {
            darting = false;
            fish.innerText = 'fish'; // Reset innerText when not darting
            speed = 2; // Reset to lazy speed after darting
        }, 1000); // Dart for one second
    }

    function moveFish() {
        if (moving) {
            const allFish = document.querySelectorAll('.hyperfish');
            allFish.forEach(otherFish => {
                if (otherFish !== fish && isNearFish(fish, otherFish)) {
                    const otherFishRect = otherFish.getBoundingClientRect();
                    const fishRect = fish.getBoundingClientRect();
    
                    // Calculate direction to avoid overlap
                    if (otherFishRect.left > fishRect.left) {
                        directionX = -1; // Move left if the other fish is to the right
                    } else {
                        directionX = 1; // Move right if the other fish is to the left
                    }
    
                    if (otherFishRect.top > fishRect.top) {
                        directionY = -1; // Move up if the other fish is below
                    } else {
                        directionY = 1; // Move down if the other fish is above
                    }
                }
            });

            let newX = parseInt(fish.style.left, 10) + directionX * speed;
            let newY = parseInt(fish.style.top, 10) + directionY * speed;

            // Ensure fish stays within the screen bounds
            newX = Math.max(0, Math.min(newX, window.innerWidth - fish.offsetWidth));
            newY = Math.max(0, Math.min(newY, window.innerHeight - fish.offsetHeight));

            // Update position
            fish.style.left = `${newX}px`;
            fish.style.top = `${newY}px`;
        }

        // Randomly decide to stop or start moving, less frequently
        if (Math.random() < 0.05) { // 5% chance to change moving state
            moving = !moving;
        }

        // Randomly change direction more frequently
        if (Math.random() < 0.2) { // 20% chance to change direction
            directionX = Math.random() < 0.5 ? -1 : 1;
            directionY = Math.random() < 0.5 ? -1 : 1;
        }

        // Avoid collision with draggable divs
        const draggableDivs = document.querySelectorAll('.draggable');
        draggableDivs.forEach(div => {
            if (isColliding(fish, div)) {
                startDarting(parseInt(div.style.left, 10), parseInt(div.style.top, 10));
            }
        });

        requestAnimationFrame(moveFish);
    }

    requestAnimationFrame(moveFish);
}
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function isNearFish(fish1, fish2) {
    const rect1 = fish1.getBoundingClientRect();
    const rect2 = fish2.getBoundingClientRect();
    const proximity = 100; // Distance in pixels to consider "near"

    return Math.abs(rect1.left - rect2.left) < proximity && Math.abs(rect1.top - rect2.top) < proximity;
}

function isColliding(el1, el2) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();

    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

function isNearMouse(element, mouseX, mouseY) {
    const rect = element.getBoundingClientRect();
    const distance = 50; // Reduced distance to consider "near" the mouse for more reactivity
    return mouseX >= rect.left - distance && mouseX <= rect.right + distance &&
           mouseY >= rect.top - distance && mouseY <= rect.bottom + distance;
}

// Initialize the observer to monitor DOM changes
function initializeObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.id === 'fishtext') {
                    document.body.removeChild(node); // Remove the detected node
                    fishFunction(); // Trigger the fish function
                }
            });
        });
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);

    document.querySelectorAll('#fishtext').forEach(node => {
        document.body.removeChild(node);
        fishFunction();
    });
}

// Start the observer
initializeObserver();