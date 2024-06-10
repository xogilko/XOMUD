self.addEventListener('install', function(event) {
    console.log('Service Worker installing.');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activating.');
});

self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SAVE_DATA') {
        saveDataToIndexedDB(event.data.data);
    }
});

function saveDataToIndexedDB(data) {
    const request = indexedDB.open('tomb', 2);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('pyre')) {
            db.createObjectStore('pyre');
        }
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        // Delete the object from the store
        const deleteTransaction = db.transaction(['pyre'], 'readwrite');
        const smoke = deleteTransaction.objectStore('pyre');
        const forget = smoke.delete('1');
        forget.onerror = function(event) {
            console.error('Delete request error:', event.target.errorCode);
        };
        const transaction = db.transaction(['pyre'], 'readwrite');
        const pyre = transaction.objectStore('pyre');
        pyre.put({ id: '1', data: data });
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}