self.addEventListener('install', function(event) {
    console.log('SERVICE WORKER INSTALLING.');
    self.skipWaiting();
});
self.addEventListener('activate', function(event) {
    console.log('SERVICE WORKER ACTIVATING.');
    event.waitUntil(self.clients.claim());
});
//channel service
let current_channel = null;
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'CHAN_SET') {
        current_channel = event.data.data;
        //holding channel for dispatch
    }
});
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'CHAN_GET') {
        event.ports[0].postMessage(current_channel);
        //giving channel to dispatch
    }
});
//proxy db
let txeneht = 'theworld';
//set auth token
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'TXENEHT') {
        txeneht = event.data.data;
    }
});
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'REALACCESS') {
        if (isValidRequest(event)) {
            handleDBOperation(event.data.storeName, event.data.operation, event.data.data, event.ports[0]);
        } else {
            event.ports[0].postMessage({ error: 'Unauthorized request' });
        }
    }
});
function isValidRequest(data) {
    // Exempt dispatch
    if (data.request && data.request.url.origin === 'https://xomud.quest/' && data.request.url.pathname === '/') {
        return true;
    }
    return data.token === txeneht;
}
function handleDBOperation(storeName, operation, data, replyPort) {
    const request = indexedDB.open('realworld', 2);
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
        }
        if (!db.objectStoreNames.contains('upperlayer')) {
            db.createObjectStore('upperlayer');
        }
    };
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        if (operation === 'PUT') {
            objectStore.put(data, data.id);
            if (replyPort) {
                replyPort.postMessage({ success: true });
            }
        } else if (operation === 'GET') {
            const getRequest = objectStore.get(data.id);
            getRequest.onsuccess = function(event) {
                if (replyPort) {
                    let temp = event.target.result;
                    if (temp && temp.value){
                        console.log('(sw) indexeddb contains entry', temp)
                        replyPort.postMessage({ success: true, data: temp.value });
                    } else {
                        console.log('(sw) indexeddb does not contain entry', temp)
                        replyPort.postMessage({ success: false, data: undefined });
                    }
                }
            };
        }
    };
    request.onerror = function(event) {
        replyPort.postMessage({ error: 'IndexedDB error', errorCode: event.target.errorCode });
    };
}
//memory service
let memory = null;
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'MEM_SET') {
        console.log('(sw) setting memory:', event.data.data.key, memory)
        if (!memory){
            memory = [];
        }
        memory[event.data.data.key] = event.data.data.value;
        const message = {
            type: 'REALACCESS',
            storeName: 'upperlayer',
            operation: 'PUT',
            data: { id: event.data.data.id, name: event.data.data.key, value: event.data.data.value },
            token: txeneht
        };
        if (isValidRequest(message)) { console.log(message, 'setting mem to db')
            handleDBOperation(message.storeName, message.operation, message.data, event.ports[0]);
        } else {
            event.ports[0].postMessage({ error: 'Unauthorized request' });
        }
        //holding memory for navi
    }
});
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'MEM_GET') {
        if (memory && event.data.key && memory[event.data.key]) {
            console.log('(sw)surface memory present. proof:', memory, 'this', event.data.key, 'is', memory[event.data.key])
            event.ports[0].postMessage(memory[event.data.key]);
        } else {
            console.log('(sw)no matching surface memory. checking indexeddb.', event.data, event.data.data.key)
            const message = {
                type: 'REALACCESS',
                storeName: 'upperlayer',
                operation: 'GET',
                data: { id: event.data.data.id },
                token: txeneht
            };
            console.log('(sw)via this', message)
            if (isValidRequest(message)) {
                handleDBOperation(message.storeName, message.operation, message.data, event.ports[0]);
            } else {
                event.ports[0].postMessage({ error: 'invalidated request' });
            }
        }
        //giving memory to navi
    }
});
//deprecated
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SAVE_DATA') {
        dbstore_memory(event.data.data);
    }
});
function dbstore_memory(data) {
    const message = {
        type: 'REALACCESS',
        storeName: 'upperlayer', // Specify the target object store
        operation: 'PUT', // Specify the operation (e.g., PUT or GET)
        data: data,
        token: txeneht // Include authorization token
    };
    // Send message to service worker for handling
    handleDBOperation(message.storeName, message.operation, message.data, event.ports[0]);
    
}

//key management service
let keychain_data = null;
let privkey_data = null;
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'KEYCHAIN_START') {  
        console.log('(sw) Keychain start received, storing sessionId:', event.data.data);
        keychain_data = event.data.data;
    }
});

self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'KEYCHAIN_STOP') {
        console.log('(sw) Keychain stop received, storing encrypted key');
        if (keychain_data){
            privkey_data = event.data.data;
            event.ports[0].postMessage(keychain_data);
            keychain_data = null;
        }
        else {
            console.log('(sw) keychain origin lost');
        }
    }
});
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'KEYCHAIN_INIT') {
        console.log('(sw) Keychain init received, checking for stored key');
        if (privkey_data){
            console.log('(sw) Found stored key, sending back');
            event.ports[0].postMessage(privkey_data);
            keychain_data = null;
            privkey_data = null;
        }
        else {
            console.log('(sw) No stored key found');
            event.ports[0].postMessage(null);
        }
    }
});