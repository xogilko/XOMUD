<?php
session_start();

// Mapping of routes to their corresponding PHP files
$routes = [
    'xo/testkit' => 'hypertext/testkit.php',
    // Add other routes and their corresponding files here
    'default' => 'hypertext/default.php',
    'example' => 'hypertext/example.php',
];

// Function to determine the entry point based on the request URI
function getEntryPoint($uri, $routes) {
    $uri = trim($uri, '/');
    foreach ($routes as $route => $file) {
        // Use regular expression to match the route
        $pattern = str_replace('/', '\/', $route);
        if (preg_match("/^$pattern(\/|$)/", $uri, $matches)) {
            $pathInfo = substr($uri, strlen($matches[0]));
            return [$file, $pathInfo];
        }
    }
    return [false, '']; // Default handler if no route matches
}

// Normalize the URI by removing leading and trailing slashes
$normalizedUri = trim($_SERVER['REQUEST_URI'], '/');

// Check if there's a request to fetch a specific PHP file via 'load' parameter or direct route
list($entryPoint, $pathInfo) = getEntryPoint($normalizedUri, $routes);
error_log("Request URI: " . $_SERVER['REQUEST_URI']);
error_log("Normalized URI: " . $normalizedUri);
error_log("Entry Point: " . ($entryPoint ? $entryPoint : 'None'));
error_log("Path Info: " . $pathInfo);

if ($entryPoint) {
    // Define a variable that testkit.php can use
    $requestPathInfo = $pathInfo;
    include $entryPoint;
    exit;
}

// If no 'load' parameter is present, serve the initial HTML page
// This part is now redundant since all requests are handled above
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>★ xomud.quest ★</title>
    <script>
        document.addEventListener('DOMContentLoaded', function() {

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(function(registration) {
                        console.log('service Worker registered with scope:', registration.scope);
                        if (!navigator.serviceWorker.controller) {
                            console.log('service Worker is not controlling the page. Reloading...');
                            window.location.reload();
                        }
                        console.log('.... uh')
                    }).catch(function(error) {
                        console.error('service Worker registration failed:', error);
                    });
            } else {
                console.log('no service worker for persistence :( ')
            }

            let page_uri = '/default';
            const request = indexedDB.open('tomb', 2);

            request.onerror = function(event) {
                console.error('Database error:', event.target.errorCode);
            };

            request.onsuccess = function(event) {
                const db = event.target.result;
                const transaction = db.transaction(['pyre'], 'readonly');
                const store = transaction.objectStore('pyre');
                const getAllKeysRequest = store.getAllKeys();

                getAllKeysRequest.onsuccess = function() {
                    if (getAllKeysRequest.result.length !== 0) {
                        const getAllRequest = store.getAll();
                        getAllRequest.onsuccess = function() {
                            const data = getAllRequest.result[0].data;
                            console.log(data); // Assuming there's only one object
                            if (data && data.chan) {
                                page_uri = data.chan;
                                console.log(page_uri);

                                let headers = {};
                                if (data.subs && data.subs[data.chan]) {
                                    headers['httx'] = data.subs[data.chan];
                                }

                                fetch(page_uri, { headers })
                                    .then(response => response.text())
                                    .then(html => {
                                        document.open();
                                        document.write(html);
                                        document.close();
                                        history.pushState(null, '', page_uri)
                                    });
                                return;
                            }
                        };
                    } else {
                        console.log("factory init: default channel on");
                        fetch(page_uri)
                            .then(response => response.text())
                            .then(html => {
                                document.open();
                                document.write(html);
                                document.close();
                                history.pushState(null, '', page_uri)
                            });
                    }
                };
            };

            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                db.createObjectStore('pyre', { keyPath: 'id' });
            };
        });
    </script>
</head>
<body>
    <div id="content" style="display: grid; place-items: center; height: 100vh">
        <center><img src="/static/resources/xologo.png"><br><i>on air</i></center>
    </div>
</body>
</html>