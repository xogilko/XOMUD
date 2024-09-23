export function activate_module(lain) {
    lain.rom.removeCacheItem = (item) => {
        try {
            const cacheItem = lain.cache[item.index];
            if (cacheItem) {
                if (cacheItem.kind === 'html') {
                    const element = document.querySelector('[data-set="' + cacheItem.domset + '"]');
                    if (element) {
                        // Find the next cache item with a domset
                        let nextDomset = null;
                        for (let i = item.index + 1; i < lain.cache.length; i++) {
                            if (lain.cache[i].domset !== undefined) {
                                nextDomset = lain.cache[i].domset;
                                break;
                            }
                        }

                        // Calculate the domset difference
                        const domsetDiff = nextDomset !== null ? nextDomset - cacheItem.domset : lain.domset - cacheItem.domset;

                        // Remove the element and update the cache
                        element.remove();
                        lain.cache.splice(item.index, 1);
                        console.log('Element removed successfully', lain.domset, domsetDiff);

                        // Update domset values in the cache and DOM
                        if (domsetDiff > 0) {
                            for (let i = item.index; i < lain.cache.length; i++) {
                                if (lain.cache[i].domset !== undefined) {
                                    const oldDomset = lain.cache[i].domset;
                                    lain.cache[i].domset -= domsetDiff;
                                    const domElement = document.querySelector('[data-set="' + oldDomset + '"]');
                                    if (domElement) {
                                        domElement.setAttribute('data-set', lain.cache[i].domset);
                                        // Update children domset values
                                        let newDomset = lain.cache[i].domset + 1;
                                        const updateChildrenDomset = (parent) => {
                                            Array.from(parent.children).forEach(child => {
                                                if (child.hasAttribute('data-set')) {
                                                    child.setAttribute('data-set', newDomset);
                                                    newDomset++;
                                                    updateChildrenDomset(child);
                                                }
                                            });
                                        };
                                        updateChildrenDomset(domElement);
                                    }
                                } 
                            }
                            lain.domset -= domsetDiff;
                        }
                        
                        if (cacheItem.child) {
                            const childItemIndex = lain.cache.findIndex(ci => ci.uri === lain.dvr[cacheItem.child].uri && (ci.kind === 'js' || ci.kind === 'jsmod'));
                            if (childItemIndex !== -1) {
                                lain.rom.removeCacheItem({ index: childItemIndex });
                            } else {
                                console.log('Child JS item not found:', lain.dvr[cacheItem.child].name);
                            }
                        }
                    } else {
                        console.log('Element not found');
                    }
                } else if (cacheItem.kind === 'js' || cacheItem.kind === 'interpreter') {
                    let handler_match = cacheItem.media.match(/lain\.rom\.[a-zA-Z0-9_]+/g);
                    if (handler_match) {
                        lain.cache.splice(item.index, 1);
                    } else {
                        lain.cache.splice(item.index, 1);
                    }
                } else if (cacheItem.kind === 'jsmod') {
                    lain.cache.splice(item.index, 1);
                } else {
                    console.log("cache type unrecognized? :O ", cacheItem);
                }
            } else {
                console.log('Cache item not found', item);
            }
        } catch (error) {
            console.log('Failed to destroy bc', error);
        }
    };
}