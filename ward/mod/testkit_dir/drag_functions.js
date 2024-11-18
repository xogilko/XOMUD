export function activate_module(lain) {
    lain.rom.drag_init = () => {
        const initializedElements = new Set();
        let highestZIndex = 1;

        const draggin = (e) => {
            const element = e.target;
            if (element.closest('button')) return;
            if (element.closest('.dragged_content')) return;
            if (element.hasAttribute('data-maximized')) return;
            e.preventDefault();

            element.style.zIndex = ++highestZIndex;

            const isTouchEvent = e.type.includes('touch');
            const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
            const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

            const rect = element.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;

            let translateX = 0, translateY = 0;

            const transform = window.getComputedStyle(element).transform;
            if (transform !== 'none') {
                const matrixValues = transform.match(/matrix.*\((.+)\)/);
                if (matrixValues) {
                    const values = matrixValues[1].split(', ');
                    translateX = parseFloat(values[4]);
                    translateY = parseFloat(values[5]);
                }
            }

            const dragMove = (moveEvent) => {
                const moveClientX = isTouchEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
                const moveClientY = isTouchEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
                
                const newX = moveClientX - offsetX;
                const newY = moveClientY - offsetY;

                const deltaX = newX - rect.left;
                const deltaY = newY - rect.top;
                element.style.transform = `translate(${translateX + deltaX}px, ${translateY + deltaY}px)`;
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
            const draggedContent = element.querySelector('.dragged_content');
            if (draggedContent) {
                const resizeObserver = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                            const style = draggedContent.style;
                            if (style.width || style.height) {
                                element.setAttribute('data-manually-resized', 'true');
                            }
                        }
                    });
                });

                resizeObserver.observe(draggedContent, {
                    attributes: true,
                    attributeFilter: ['style']
                });

                if (element.style.width) {
                    draggedContent.style.width = element.style.width;
                    element.setAttribute('data-manually-resized', 'true');
                }
                if (element.style.height) {
                    draggedContent.style.height = element.style.height;
                    element.setAttribute('data-manually-resized', 'true');
                }

                element.style.removeProperty('width');
                element.style.removeProperty('height');
            }

            element.addEventListener('mousedown', draggin);
            element.addEventListener('touchstart', draggin);
            if (!initializedElements.has(element)) {
                initializedElements.add(element);
            }
            element.style.position = 'absolute';
            element.style.transform = 'translate(12px, 12px)';
        };

        document.body.addEventListener('mousedown', (e) => {
            if (e.target.matches('x-testkit-draggable') && !initializedElements.has(e.target)) {
                addDragEventListener(e.target);
                draggin(e);
            }
        });

        document.body.addEventListener('touchstart', (e) => {
            if (e.target.matches('x-testkit-draggable') && !initializedElements.has(e.target)) {
                addDragEventListener(e.target);
                draggin(e);
            }
        });

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.nodeName === 'X-TESTKIT-DRAGGABLE' && !initializedElements.has(node)) {
                        addDragEventListener(node);
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

        const draggableElements = document.querySelectorAll('x-testkit-draggable');
        draggableElements.forEach(element => {
            addDragEventListener(element);
        });
    };

    lain.rom.drag_init();
}
