export function activate_module(lain) {
    lain.rom.drag_init = () => {
        const initializedElements = new Set();

        // Function to handle the dragging
        const draggin = (e) => {
            const element = e.target;
            if (element.closest('button')) return;
            if (element.closest('.dragged_content')) return;
            e.preventDefault();

            // Determine if the event is touch or mouse and set coordinates accordingly
            const isTouchEvent = e.type.includes('touch');
            const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
            const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

            const rect = element.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;
            const leftInPx = rect.left + window.scrollX;
            const topInPx = rect.top + window.scrollY;
            element.style.position = 'absolute';
            element.style.left = leftInPx + 'px';
            element.style.top = topInPx + 'px';
            document.body.append(element);

            const dragMove = (moveEvent) => {
                const moveClientX = isTouchEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
                const moveClientY = isTouchEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
                const newLeft = moveClientX - offsetX;
                const newTop = moveClientY - offsetY;
                element.style.left = newLeft + 'px';
                element.style.top = newTop + 'px';
            };

            const dragEnd = () => {
                document.removeEventListener('mousemove', dragMove);
                document.removeEventListener('mouseup', dragEnd);
                document.removeEventListener('touchmove', dragMove);
                document.removeEventListener('touchend', dragEnd);
            };

            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchmove', dragMove);
            document.addEventListener('touchend', dragEnd);
        };

        const addDragEventListener = (element) => {
            element.addEventListener('mousedown', draggin);
            element.addEventListener('touchstart', draggin);
            if (!initializedElements.has(element)) {
                initializedElements.add(element);
            }
            element.style.position = 'absolute';
                element.style.left = '12px';
                element.style.top = '12px';
        };

        // Event delegation for drag events
        document.body.addEventListener('mousedown', (e) => {
            if (e.target.matches('.draggable') && !initializedElements.has(e.target)) {
                addDragEventListener(e.target);
                draggin(e);
            }
        });

        document.body.addEventListener('touchstart', (e) => {
            if (e.target.matches('.draggable') && !initializedElements.has(e.target)) {
                addDragEventListener(e.target);
                draggin(e);
            }
        });

        // Mutation observer to handle dynamic elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList.contains('draggable') && !initializedElements.has(node)) {
                        addDragEventListener(node);
                        // Manually trigger the draggin function to bring the element to the front
                        const simMouseDown = new MouseEvent('mousedown', {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                            clientX: node.getBoundingClientRect().left + 12,
                            clientY: node.getBoundingClientRect().top + 12
                        });
                        node.dispatchEvent(simMouseDown);
                        const simMouseUp = new MouseEvent('mouseup', {
                            view: window,
                            bubbles: true,
                            cancelable: true,
                            clientX: node.getBoundingClientRect().left + 12,
                            clientY: node.getBoundingClientRect().top + 12
                        });
                        node.dispatchEvent(simMouseUp);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Initialize existing draggable elements
        const draggableElements = document.querySelectorAll('.draggable');
        draggableElements.forEach(element => {
            addDragEventListener(element);
        });
    };

    lain.rom.drag_init();
}