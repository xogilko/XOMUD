export function activate_module(lain) {

lain.rom.testkit_grave = () => {
    const removeAllStylesheets = () => {
        const styleElements = document.querySelectorAll('style');
        styleElements.forEach(style => style.parentNode.removeChild(style));
    };
    const skellygen = (label) => {
        try {
            console.log("embalming navi state");
            let skeleton = lain.rom.exporter();
            skeleton.name = "skeleton export";
            lain.dvr[label] = skeleton;
            lain.dvr[label].file = label;
            lain.dvr[label].subs = lain.subs;
        } catch (error) {
            console.log("failed to generate skeleton", error);
        }
    }

    const waitForAllAsyncOps = () => {
        return new Promise((resolve) => {
            if (lain.rom.testkit_handler.pendingAsyncOps === 0) {
                resolve();
            } else {
                lain.rom.testkit_handler.allAsyncOpsResolvedCallback = resolve;
            }
        });
    };

    const deadgen = async (label) => {
        try {
            let skeleton = lain.dvr[label];
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
            for (const args of skeleton.navi_export.proc) {
                let specialCondition = "specialCondition";
                let rest = args.map(arg => arg); //(arg => eval(arg));
                await navi(lain, ...rest);
                await waitForAllAsyncOps();
            }
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