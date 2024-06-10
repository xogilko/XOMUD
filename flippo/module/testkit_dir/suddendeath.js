export function activate_module(lain) {
    window.addEventListener('unload', function (event) {
        // customize closing experience. 
        // currently persists state
            lain.rom.testkit_grave().skellygen('suddendeath');      
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SAVE_DATA',
                data: lain.dir['suddendeath']
            });
        } else {
            console.log('no service worker')
        }
    });

    console.log('ready to turn a corner*')
}