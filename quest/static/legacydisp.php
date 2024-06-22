<?php
session_start();

// Mapping of routes to their corresponding PHP files
$routes = [
    'testkit' => 'hypertext/testkit.php',
    // Add other routes and their corresponding files here
    'default' => 'hypertext/default.php',
    'example' => 'hypertext/example.php',
];

// Function to determine the entry point based on the request URI
function getEntryPoint($uri, $routes) {
    $uri = trim($uri, '/');
    $parts = explode('/', $uri);
    $firstPart = array_shift($parts);

    if (array_key_exists($firstPart, $routes)) {
        return [$routes[$firstPart], '/' . implode('/', $parts)];
    }

    return [false, '']; // Default handler if no route matches
}

// Check if there's a request to fetch a specific PHP file via 'load' parameter or direct route
list($entryPoint, $pathInfo) = getEntryPoint($_SERVER['REQUEST_URI'], $routes);

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
                    if (getAllKeysRequest.result.length === 0) {
                        console.log("zero channel");
                        window.location.href = page_uri;
                    } else {
                        const getAllRequest = store.getAll();
                        getAllRequest.onsuccess = function() {
                            const data = getAllRequest.result[0].data;
                            console.log(data) // Assuming there's only one object
                            if (data && data.channel) {
                                page_uri = data.channel;
                                console.log(page_uri)
                                window.location.href = page_uri;
                            } else {
                                console.log(page_uri)
                                window.location.href = page_uri;
                            }
                        };
                    }
                };
            };

            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                db.createObjectStore('pyre', {keyPath: 'id'});
            };
        });
    </script>
</head>
<body>
    <div id="content" style="display: grid; place-items: center; height: 100vh">
        <center><img src="/static/resources/xologo.png"><br>hello, world</center>
    </div>
</body>
</html>