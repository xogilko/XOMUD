<?php
session_start();

// Mapping of routes to their corresponding PHP files
$routes = [
    'xo' => 'hypertext/waterfall',
    '20xx' => 'hypertext/20xx.php',
    'default' => 'hypertext/testkit.php',
    'xoffline' => 'hypertext/xoffline.php',
];

$routesJson = json_encode(array_keys($routes));

function getEntryPoint($uri, $routes) {
    $uri = trim($uri, '/');
    $parts = explode('/', $uri);
    $firstPart = array_shift($parts);

    if (array_key_exists($firstPart, $routes)) {
        return [$routes[$firstPart], '/' . implode('/', $parts)];
    }

    return [false, ''];
}

function safeEval($code, $context = []) {
    $execute = function() use ($code, $context) {
        extract($context);
        if (preg_match('/(exec|system|shell_exec|passthru|eval|assert|preg_replace|file_get_contents|fopen|unlink|phpinfo|curl_exec|curl_multi_exec|parse_ini_file|show_source)/i', $code)) {
            throw new Exception('Code contains disallowed functions or patterns.');
        }
        ob_start();
        eval('?>' . $code);
        $output = ob_get_clean();
        return $output;
    };
    return $execute();
}

list($entryPoint, $pathInfo) = getEntryPoint($_SERVER['REQUEST_URI'], $routes);

if ($entryPoint) {
    $requestPathInfo = $pathInfo;
    $phpCode = file_get_contents($entryPoint);
    $context = [
        '_GET' => $_GET,
        '_POST' => $_POST,
        '_REQUEST' => $_REQUEST,
        '_SERVER' => $_SERVER,
        'requestPathInfo' => $requestPathInfo
    ];
    try {
        echo safeEval($phpCode, $context);
    } catch (Exception $e) {
        echo 'Error: ' . $e->getMessage();
    }
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
        function validChannel(route) {
            const routes = <?php echo $routesJson; ?>;
            const firstPart = route.split('/')[1];
            return routes.includes(firstPart);
        }
        function broadcast(chan_route, headers = null){
            fetch(chan_route, headers ? { headers } : {})
                .then(response => response.text())
                .then(html => {
                    document.open();
                    document.write(html);
                    document.close();
                    history.replaceState(null, '', chan_route);
                })
                .catch(error => {
                    status.innerText="broadcast failed";
                    console.error('error:', error);
                });
        }
        function load() {
            navigator.serviceWorker.ready.then(function(registration) {
                if (registration.active) {
                    status.innerText="requesting channel name";
                    const messageChannel = new MessageChannel();
                    messageChannel.port1.onmessage = function(event) {
                        const data = event.data;
                        console.log('dispatch:', data);
                        status.innerText="response recieved...";
                        if (data && data.chan) {
                            status.innerText="dispatching " + data.chan;
                            let chan_route = data.chan;
                            if (!validChannel(chan_route)) {
                                status.innerText="invalid channel";
                                chan_route = '/xo/';
                            }
                            let headers = {};
                            if (data.httxid) {
                                headers['httx'] = data.httxid;
                            }
                            status.innerText="casting channel";
                            broadcast(chan_route, headers);
                        }
                        else {
                            status.innerText="no service response";
                            broadcast('/xo/');
                        }
                    };
                    registration.active.postMessage({ type: 'CHAN_GET' }, [messageChannel.port2]);
                } else {
                    status.innerText="no service";
                    broadcast('/xo/');
                }
            });
        }
        let status = document.getElementById('status');
        status.innerText="checking for service";
        if ('serviceWorker' in navigator) {
            status.innerText="registering service";
            navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
                .then(function(registration) {
                    status.innerText="service worker registered";
                    if (!navigator.serviceWorker.controller) {
                        status.innerText="refreshing with service";
                        window.location.reload();
                    }
                }).catch(function(error) {
                    status.innerText="service failed";
                    console.error('service Worker registration failed:', error);
                });
            load();
        } else {
            status.innerText="service unavailable";
            broadcast('/xo/');
        }
    });
    </script>
</head>
<body>
    <div id="content" style="display: grid; place-items: center; height: 100vh">
        <center><img src="/static/resources/hypert.gif"><br><span id="status">off air</span></center>
    </div>
</body>
</html>