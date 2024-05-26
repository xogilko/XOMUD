export function activate_module(lain) {
// IndexedDB module for storing and retrieving data and blobs
lain.rom.dbModule = (() => {
    const dbName = 'appDB';
    const storeName = 'dataStore';
    let db;
    lain.db = [];
    // Open or create IndexedDB database
    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);

            request.onupgradeneeded = (event) => {
                db = event.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const getAllKeysRequest = store.getAllKeys();
    
                getAllKeysRequest.onsuccess = () => {
                    lain.db = getAllKeysRequest.result;
                    resolve(db);
                };
    
                getAllKeysRequest.onerror = (event) => {
                    console.error('Failed to fetch IDs:', event.target.errorCode);
                    resolve(db); // Resolve with the DB anyway
                };
            };

            request.onerror = (event) => {
                reject('Database error: ' + event.target.errorCode);
            };
        });
    }

    // Add data to the database
    function addData(data) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => {
                lain.db.push(request.result); // Record the ID in lain.db
                resolve(request.result);
            };
            request.onerror = () => reject('Error adding data');
        });
    }

    // Retrieve data from the database
    function getData(key) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject('Error retrieving data');
        });
    }

    // Delete data from the database
    function deleteData(key) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => {
                lain.db = lain.db.filter(id => id !== key); // Remove the key from lain.db
                resolve();
            };
            request.onerror = () => reject('Error deleting data');
        });
    }
    // Clear all data from the database
    function clearAllData() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(db.objectStoreNames, 'readwrite');
            transaction.oncomplete = () => {
                console.log('All stores successfully cleared');
                resolve();
            };
            transaction.onerror = (event) => {
                console.error('Transaction failed:', event.target.errorCode);
                reject('Failed to clear all stores');
            };
    
            Array.from(db.objectStoreNames).forEach(storeName => {
                const store = transaction.objectStore(storeName);
                store.clear().onsuccess = () => {
                    console.log(`Cleared ${storeName}`);
                };
            });
        });
    }

    return {
        openDB,
        addData,
        getData,
        deleteData,
        clearAllData
    };
})();

/* Usage example:
console.log('testing database (open, add, retrieve, delete) now...');
lain.rom.dbModule.openDB().then(() => {
    console.log('Database opened successfully');
    // Add data
    lain.rom.dbModule.addData({ file: "testdb", name: 'Hello, world!' }).then((id) => {
        console.log('Data added with ID:', id);
        // Get data
        lain.rom.dbModule.getData(id).then((data) => {
            console.log('Retrieved data:', data);
            // Delete data
            //lain.rom.dbModule.deleteData(id).then(() => {
            //    console.log('Data deleted');
            //});
        });
    });
}).catch((error) => {
    console.error('Error:', error);
});*/
}