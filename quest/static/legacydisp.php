<?php
session_start();

// Mapping of routes to their corresponding PHP files
$routes = [
    'xo' => 'hypertext/testkit.php',
    '20xx' => 'hypertext/20xx.php',
    'default' => 'hypertext/testkit.php',
    'example' => 'hypertext/example.php',
];

function getEntryPoint($uri, $routes) {
    $uri = trim($uri, '/');
    $parts = explode('/', $uri);
    $firstPart = array_shift($parts);

    if (array_key_exists($firstPart, $routes)) {
        return [$routes[$firstPart], '/' . implode('/', $parts)];
    }

    return [false, ''];
}

list($entryPoint, $pathInfo) = getEntryPoint($_SERVER['REQUEST_URI'], $routes);

if ($entryPoint) {
    $requestPathInfo = $pathInfo;
    include $entryPoint;
    exit;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>★ xomud.quest ★</title>
    <script>
    //get channel via service worker else indexeddb then dispatch
            document.addEventListener('DOMContentLoaded', function() {
        function fetchFromIndexedDB() {
            status.innerText="opening database";
            const request = indexedDB.open('tomb', 2);

            request.onerror = function(event) {
                status.innerText="database error";
                console.error('Database error:', event.target.errorCode);
            };

            request.onsuccess = function(event) {
                status.innerText="opening datastore";
                const db = event.target.result;
                const transaction = db.transaction(['pyre'], 'readonly');
                const store = transaction.objectStore('pyre');
                const getAllKeysRequest = store.getAllKeys();

                getAllKeysRequest.onsuccess = function() {
                    status.innerText="finding data";
                    if (getAllKeysRequest.result.length !== 0) {
                        const getAllRequest = store.getAll();
                        getAllRequest.onsuccess = function() {
                            const data = getAllRequest.result[0].data;
                            status.innerText="reading stored data";
                            console.log(data); // Assuming there's only one object
                            if (data && data.chan) {
                                status.innerText="casting channel " + data.chan;
                                let page_uri = data.chan;
                                console.log(page_uri);
                                let headers = {};
                                if (data.subs && data.subs[data.chan]) {
                                    headers['httx'] = data.subs[data.chan];
                                }
                                fetch(page_uri, { headers })
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error('Network response was not ok');
                                        }
                                        return response.text();
                                    })
                                    .then(html => {
                                        document.open();
                                        document.write(html);
                                        document.close();
                                        history.replaceState(null, '', page_uri);
                                    })
                                    .catch(error => {
                                    status.innerText="failed via db, casting /xo/";
                                    console.log("factory init: default channel");
                                    page_uri = '/xo/';
                                    fetch(page_uri)
                                        .then(response => response.text())
                                        .then(html => {
                                            document.open();
                                            document.write(html);
                                            document.close();
                                            history.replaceState(null, '', page_uri);
                                        })
                                        .catch(error => { // Added catch block here
                                            status.innerText="failed casting /xo/";
                                        });
                                });
                                return;
                            }
                            else{
                                status.innerText="data cannot be read. casting /xo/";
                                console.log("factory init: default channel on");
                                let page_uri = '/xo/';
                                fetch(page_uri)
                                    .then(response => response.text())
                                    .then(html => {
                                        document.open();
                                        document.write(html);
                                        document.close();
                                        history.replaceState(null, '', page_uri);
                                    });
                            }
                        };
                    } else {
                        console.log("factory init: default channel on");
                        let page_uri = '/xo/';
                        fetch(page_uri)
                            .then(response => response.text())
                            .then(html => {
                                document.open();
                                document.write(html);
                                document.close();
                                history.replaceState(null, '', page_uri);
                            });
                    }
                };
            };

            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                db.createObjectStore('pyre', { keyPath: 'id' });
            };
        }

        function isValidRoute(uri) {
            const routes = ['xo', '20xx', 'default', 'example'];
            const firstPart = uri.split('/')[1];
            return routes.includes(firstPart);
        }
        let status = document.getElementById('status');
        status.innerText="checking for service";
        if ('serviceWorker' in navigator) {
            status.innerText="registering service";
            navigator.serviceWorker.register('/service-worker.js')
                .then(function(registration) {
                    console.log('service Worker registered with scope:', registration.scope);
                    status.innerText="service worker registered";
                    if (!navigator.serviceWorker.controller) {
                        console.log('service Worker is not controlling the page. Reloading...');
                        status.innerText="refreshing with service";
                        window.location.reload();
                    }
                }).catch(function(error) {
                    status.innerText="service failed, trying db";
                    console.error('service Worker registration failed:', error);
                    fetchFromIndexedDB();
                });

            navigator.serviceWorker.ready.then(function(registration) {
                if (registration.active) {
                    status.innerText="requesting channel name";
                    const messageChannel = new MessageChannel();
                    messageChannel.port1.onmessage = function(event) {
                        const data = event.data;
                        console.log('dispatch', data);
                        status.innerText="response recieved...";
                        if (data && data.chan) {
                            status.innerText="dispatching " + data.chan;
                            let page_uri = data.chan;
                            if (!isValidRoute(page_uri)) {
                                status.innerText="invalid channel";
                                page_uri = '/xo/';
                            }
                            let headers = {};
                            if (data.httxid) {
                                headers['httx'] = data.httxid;
                            }
                            status.innerText="casting channel";
                            fetch(page_uri, { headers })
                                .then(response => response.text())
                                .then(html => {
                                    document.open();
                                    document.write(html);
                                    document.close();
                                    history.replaceState(null, '', page_uri);
                                })
                                .catch(error => {
                                    status.innerText="broadcast failed, trying db";
                                    console.error('Fetch error:', error);
                                    fetchFromIndexedDB();
                                });
                        } else {
                            status.innerText="no service response, trying db";
                            fetchFromIndexedDB();
                        }
                    };

                    registration.active.postMessage({ type: 'CHANNEL_GET' }, [messageChannel.port2]);
                } else {
                    status.innerText="no service, trying db";
                    fetchFromIndexedDB();
                }
            });
        } else {
            status.innerText="service unavailable, trying db";
            fetchFromIndexedDB();
        }
    });
    </script>
</head>
<body>
    <div id="content" style="display: grid; place-items: center; height: 100vh">
        <center><img src="/static/resources/staticlogo.gif"><br><span id="status">off air</span></center>
    </div>
</body>
</html>