export function activate_module(lain) {
    
    lain.rom.removeCacheItem = (item) => {
        try {
            const cacheItem = lain.cache[item.index];
            if (cacheItem) {
                if (cacheItem.kind === 'html'){
                    cacheItem.domset.forEach(domset => {
                        const element = document.querySelector('[data-set="' + domset + '"]');
                        if (element) {
                            element.remove(); 
                            lain.cache.splice(item.index, 1);
                            console.log('Element removed successfully', element);
                        } else {
                            console.log('Element not found', element);
                        }
                    });
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
                        eval(handler_match[0] + ' = null;');      
                        lain.cache.splice(item.index, 1);
                        console.log(handler_match[0], eval(handler_match[0]));
                    } else {
                        console.log('no function to disable');
                    }
                }
                else if (cacheItem.kind === 'jsmod'){
                    lain.cache.splice(item.index, 1);
                    console.log("cached modules have no function to disable");
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
