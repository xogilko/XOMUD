export function activate_module(lain) {
//memory overhaul
lain.rom.testkit_grave = () => {
    const removeAllStylesheets = () => {
        const styleElements = document.querySelectorAll('style');
        styleElements.forEach(style => style.parentNode.removeChild(style));
    };
    const skellygen = (label) => {
        try {
            console.log("embalming navi state");
            let skeleton = lain.rom.exporter();
            skeleton.name = "navi state export";
            lain.dvr[label] = skeleton;
            lain.dvr[label].file = label;
           // lain.dvr[label].return = lain;
            lain.dvr[label].subs = lain.subs;
            lain.dvr[label].chan = lain.chan;            
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
            //clean up
            for (let i = lain.cache.length - 1; i >= 0; i--) {
                const cacheItem = lain.cache[i];
                lain.rom.removeCacheItem({index: i});
            }
            removeAllStylesheets();
            lain.domset= 0;
            //run proc, then dom_reassignment, then style
            lain.proc = [];
            for (const args of skeleton.navi_export.proc) {
                let rest = args.map(arg => arg); //(arg => eval(arg));
                await navi(lain, ...rest);
                await waitForAllAsyncOps();
            }
            lain.rom.testkit_reassign(skeleton.navi_export.dom);                
            lain.rom.manageCSS().applyStylesheet(skeleton.navi_export.css);
            console.log("& we're back");

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