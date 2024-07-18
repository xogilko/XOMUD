export function activate_module(lain) {
    lain.rom.testkit_corner = () => {
        console.log('memory activated')
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CHAN_SET',
                data: {chan: lain.chan, httx: lain.subs["chan:"+lain.chan] || undefined }
            });
            navigator.serviceWorker.controller.postMessage({
                type: 'MEM_SET',
                data: { key: 'lain', id: 1, value: lain}
            });
            lain.rom.testkit_grave().skellygen('unload_state');
            navigator.serviceWorker.controller.postMessage({
                type: 'MEM_SET',
                data: { key: 'navi', id: 2, value: lain.dvr['unload_state']}
            });
            //took out SAVE_DATA
        }
    }
    window.addEventListener('unload', lain.rom.corner);
    document.addEventListener('DOMContentLoaded', function() {
        lain.rom.testkit_corner(); console.log('ready to turn a corner*')
    });
}