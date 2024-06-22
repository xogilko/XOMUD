export function activate_module(lain) {
    window.addEventListener('unload', function (event) {
        // customize closing experience. 
        // currently persists state
   
        if (navigator.serviceWorker.controller) {
            lain.rom.testkit_grave().skellygen('suddendeath');
            navigator.serviceWorker.controller.postMessage({
                type: 'DEATH_SET',
                data: lain.dvr['suddendeath']
            });
            navigator.serviceWorker.controller.postMessage({
                type: 'SAVE_DATA',
                data: lain.dvr['suddendeath']
            });
            navigator.serviceWorker.controller.postMessage({
                type: 'CHANNEL_SET',
                data: {chan: lain.chan, httx: lain.subs["chan:"+lain.chan] || undefined }
            });
        } else {
            console.log('nothing is left...')
        }
    });

    console.log('ready to turn a corner*')
}