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
                            console.log('Element removed successfully');
                        } else {
                            console.log('Element not found', element);
                        }
                    });
                }
                else if (cacheItem.kind === 'js' || cacheItem.kind === 'interpreter'){
                    let handler_match = cacheItem.media.match(/lain\.rom\.[a-zA-Z0-9_]+/g);
                    if (handler_match) {
                        eval(handler_match[0] + ' = null;');
                        console.log(handler_match[0], eval(handler_match[0]));
                    } else {
                        console.log('no function to disable');
                    }
                }
                else if (cacheItem.kind === 'jsmod'){
                    console.log("cached modules have no function to disable");
                }
                else {
                    console.log("cache type unrecognized? :O ", cacheItem);
                }
                lain.cache.splice(item.index, 1);
            } else {
                console.log('Cache item not found');
            }
        } catch(error) {
            console.log('Failed to destroy bc', error);
        }
    };
    
}