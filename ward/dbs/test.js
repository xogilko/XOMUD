if ('serviceWorker' in navigator) {
    console.log('init_proc is active --->');
    
    navigator.serviceWorker.ready.then(function (registration) {
        console.log('(init_proc) Service Worker is ready with scope:', registration.scope);
        
        if (registration.active) {
            console.log('(init_proc) Service Worker is active');
            const messageChannel = new MessageChannel();
            
            messageChannel.port1.onmessage = function (event) {
                const data = event.data;
                console.log('(init_proc) Message received from Service Worker:', data, lain.rom.executionCount);
                
                if (data.data) {
                    console.log('(init_proc) Data received from Service Worker:', data.data);
                    if (lain.proc.some(proc => proc.includes("lain.dvr.demo_proc"))) {
                        console.log('(init_proc) demo_proc is cached, starting skelly_proc');
                        lain.rom.skelly_proc = () => {
                            console.log('(init_proc) starting skelly_proc');
                            eiri(lain, lain.dvr.css_manager);
                            eiri(lain, lain.dvr.dom_reassignment);
                            eiri(lain, lain.dvr.testkit_destroy);
                            eiri(lain, lain.dvr.testkit_grave);
                            const wake = () => {
                                console.log('(init_proc) skelly checking functions');
                                if (typeof lain.rom.removeCacheItem === 'function' &&
                                    typeof lain.rom.manageCSS === 'function' &&
                                    typeof lain.rom.testkit_grave === 'function') {
                                    console.log('(init_proc) parsing', data);
                                    let skeleton = JSON.parse(data.data);
                                    console.log('(init_proc)...regenerating navi', lain.dvr, skeleton);
                                    lain.rom.testkit_grave().deadgen(skeleton);
                                } else {
                                    console.log('(init_proc) Functions not ready, retrying in 500ms');
                                    setTimeout(wake, 500);
                                }
                            };
                            wake();
                        };
                        lain.rom.skelly_proc();
                    } else {
                        console.log('(init_proc) lain.proc does not contain demo_proc, calling demo_proc');
                        navi(alice(), 'lain.dvr.demo_proc');
                    }
                } else {
                    console.log('(init_proc) No data received, calling demo_proc');
                    navi(alice(), 'lain.dvr.demo_proc');
                }
            };
            
            if (navigator.serviceWorker.controller) {
                registration.active.postMessage({ type: 'MEM_GET', data: { key: 'navi', id: 2 } }, [messageChannel.port2]);
                console.log('(init_proc) Message posted to Service Worker');
            } else {
                window.location.reload();
                console.log('(init_proc) Service Worker controller is not available, reloading page');
            }
        }
    }).catch(function (error) {
        console.error('(init_proc) Service Worker ready check failed:', error);
    });
}