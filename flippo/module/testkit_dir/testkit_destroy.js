export function activate_module(lain) {
    lain.rom.removeCacheItem = (item) => {
        try {
            const cacheItem = lain.cache[item.index]; // Removed extra parenthesis here
            if (cacheItem) {
                if (cacheItem.kind === 'html'){
                    const element = document.querySelector('[data-set="' + cacheItem.domset + '"]');
                    if (element) {
                        element.remove(); 
                        lain.cache.splice(item.index, 1);
                        console.log('Element removed successfully');
                    } else {
                        console.log('Element not found');
                    }
                    if (cacheItem.child) {
                        const childItemIndex = lain.cache.findIndex(ci => ci.uri === lain.dir[cacheItem.child].uri && (ci.kind === 'js' || ci.kind === 'jsmod'));
                        if (childItemIndex !== -1) {
                            lain.rom.removeCacheItem({ index: childItemIndex });
                        } else {
                            console.log('Child JS item not found:', lain.dir[cacheItem.child].name);
                        }
                    }
                }
                else if (cacheItem.kind === 'js' || cacheItem.kind === 'interpreter'){
                    let handler_match = cacheItem.media.match(/lain\.rom\.[a-zA-Z0-9_]+/g);
                    if (handler_match) {
                        lain.cache.splice(item.index, 1);
                    } else {
                        lain.cache.splice(item.index, 1);
                    }
                }
                else if (cacheItem.kind === 'jsmod'){
                    lain.cache.splice(item.index, 1);
                }
                else {
                    console.log("cache type unrecognized? :O ", cacheItem);
                }
            } else {
                console.log('Cache item not found', item);
            }
        } catch(error) {
            console.log('Failed to destroy bc', error);
        }
    };
}