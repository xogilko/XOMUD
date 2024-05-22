export function activate_module(lain) {

    lain.rom.drag_init = () => {
        const initializedElements = new Set();
        const draggin = (e) => {
            const element = e.target;
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
                // Manually trigger the draggin function
                const simMouseDown = new MouseEvent('mousedown', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: element.getBoundingClientRect().left,
                    clientY: element.getBoundingClientRect().top
                });
                element.dispatchEvent(simMouseDown);
                const simMouseUp = new MouseEvent('mouseup', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: element.getBoundingClientRect().left,
                    clientY: element.getBoundingClientRect().top
                });
                element.dispatchEvent(simMouseUp);
                initializedElements.add(element);
            }
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList.contains('draggable')) {
                        addDragEventListener(node);
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        const draggableElements = document.querySelectorAll('.draggable');
        draggableElements.forEach(element => {
            addDragEventListener(element);
        });
    }
    
    lain.rom.drag_init();
}