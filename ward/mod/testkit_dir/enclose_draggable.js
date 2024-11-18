export function activate_module(lain) {
    if (!customElements.get('x-testkit-draggable')) {
        class XDraggable extends HTMLElement {
            connectedCallback() {
                // Check if already initialized
                if (this.querySelector('.remove-btn')) {
                    return; // Already has our structure
                }
                
                // Save the original content
                const content = this.innerHTML;
                const contentDiv = document.createElement('div');
                contentDiv.innerHTML = content;
                // Store natural dimensions before wrapping
                const naturalWidth = contentDiv.offsetWidth;
                const naturalHeight = contentDiv.offsetHeight;
                this.setAttribute('data-natural-width', naturalWidth);
                this.setAttribute('data-natural-height', naturalHeight);
                this.setAttribute('data-manually-resized', 'false');
                
                // Create the draggable structure
                this.innerHTML = `
                    <button style="margin:2px;" class="remove-btn">X</button>
                    <button style="margin:2px;" class="maximize-btn">□</button>
                    <button style="margin:2px;" class="hide-btn">-</button>
                    <div class="dragged_content resizable">${content}</div>
                `;

                this.querySelector('.remove-btn').addEventListener('click', (e) => {
                    const button = e.target;
                    const draggableElement = button.closest('x-testkit-draggable');
                    if (draggableElement) {
                        const dataSet = parseInt(draggableElement.getAttribute('data-set'), 10);
                        const cacheIndex = lain.cache.findIndex(item => item.domset === dataSet);
                        if (cacheIndex !== -1) {
                            lain.rom.removeCacheItem({ index: cacheIndex });
                        }
                        draggableElement.remove();
                        button.remove();
                    }
                });

                this.querySelector('.hide-btn').addEventListener('click', (e) => {
                    const button = e.target;
                    const draggableElement = button.closest('x-testkit-draggable');
                    if (draggableElement) {
                        const dataSet = parseInt(draggableElement.getAttribute('data-set'), 10);
                        const cacheIndex = lain.cache.findIndex(item => item.domset === dataSet);
                        if (cacheIndex !== -1) {
                            lain.cache[cacheIndex].hidden = true;
                        }
                        draggableElement.style.display = 'none';
                        draggableElement.style.pointerEvents = 'none';
                        lain.rom.testkit_menu.updateHiddenList();
                    }
                });

                this.querySelector('.maximize-btn').addEventListener('click', (e) => {
                    const button = e.target;
                    const draggableElement = button.closest('x-testkit-draggable');
                    if (draggableElement) {
                        const content = draggableElement.querySelector('.dragged_content');
                        
                        if (!draggableElement.hasAttribute('data-maximized')) {
                            // Store original state in attributes
                            draggableElement.setAttribute('data-original-transform', draggableElement.style.transform || '');
                            draggableElement.setAttribute('data-original-position', draggableElement.style.position || '');
                            draggableElement.setAttribute('data-original-width', content.style.width || '');
                            draggableElement.setAttribute('data-original-height', content.style.height || '');
                            
                            // Maximize
                            draggableElement.style.transform = 'none';
                            draggableElement.style.position = 'fixed';
                            draggableElement.style.left = '0';
                            draggableElement.style.top = '0';
                            draggableElement.style.zIndex = '9999';
                            content.style.width = '100vw';
                            content.style.height = '100vh';
                            
                            draggableElement.setAttribute('data-maximized', 'true');
                        } else {
                            // Restore from attributes
                            draggableElement.style.transform = draggableElement.getAttribute('data-original-transform');
                            draggableElement.style.position = draggableElement.getAttribute('data-original-position');
                            content.style.width = draggableElement.getAttribute('data-original-width');
                            content.style.height = draggableElement.getAttribute('data-original-height');
                            
                            // Clean up attributes
                            draggableElement.removeAttribute('data-maximized');
                            draggableElement.removeAttribute('data-original-transform');
                            draggableElement.removeAttribute('data-original-position');
                            draggableElement.removeAttribute('data-original-width');
                            draggableElement.removeAttribute('data-original-height');
                        }
                    }
                });
            }
        }
        customElements.define('x-testkit-draggable', XDraggable);
    }

    lain.rom.enclose_draggable = (originalObject) => {
        const newMedia = `<x-testkit-draggable>${originalObject.media}</x-testkit-draggable>`;
        const newName = 'draggable enclosure of ' + originalObject.name;
        return { ...originalObject, media: newMedia, name: newName };
    }
}