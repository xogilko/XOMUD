export function activate_module(lain) {

lain.rom.testkit_grave = () => {
    const removeAllStylesheets = () => {
        //const linkStylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        //linkStylesheets.forEach(link => link.parentNode.removeChild(link));

        const styleElements = document.querySelectorAll('style');
        styleElements.forEach(style => style.parentNode.removeChild(style));
    };
    const skellygen = (label) => {
        try {
            console.log("spooky");
            let skeleton = lain.rom.exporter();
            skeleton.name = "skeleton export";
            lain.dir[label] = skeleton;
            lain.dir[label].file = label;
            testkit_exportName.value = '';
        } catch (error) {
            console.log("failed to generate skeleton", error);
        }
    }
    const deadgen = (label) => {
        try {
            let skeleton = lain.dir[label];
            if (!skeleton) {
                console.log("skeleton not found bro");
                return;
            }
            // the real magic
            // first clean up
            const specialUri = "xo.15901360516061";
            let specialIndex = -1; // To hold the index of the special item if found

            // Process all items except the special one
            for (let i = lain.cache.length - 1; i >= 0; i--) {
                const cacheItem = lain.cache[i];
                if (cacheItem && cacheItem.uri === specialUri) {
                    specialIndex = i; // Save the index of the special item
                    continue; // Skip this iteration
                }
                lain.rom.removeCacheItem({index: i});
            }

            // Now handle the special item if it was found
            if (specialIndex !== -1) {
                console.log("manual removal of special item");
                lain.rom.removeCacheItem({index: specialIndex});
            }
            console.log('cache is..');
            console.log(lain.cache);
            //lain.cache = [];
            console.log('tossed', lain.cache)
            removeAllStylesheets();
            lain.domset= 0; // dom is cleared
            //run proc, then dom_reassignment, then style
            lain.proc = [];
            skeleton.navi_export.proc.forEach(args => {
                let specialCondition = "specialCondition";
                let rest = args.map(arg => arg); //(arg => eval(arg));
                navi(lain, ...rest);
            });
            lain.rom.testkit_reassign(skeleton.navi_export.dom);                
            lain.rom.manageCSS().applyStylesheet(skeleton.navi_export.css);
            console.log("and we're back");

        } catch (error) {
            console.log("failed to regenerate", error);
        }
    }
    return {
        skellygen,
        deadgen
    }
}
lain.rom.testkit_grave();

}