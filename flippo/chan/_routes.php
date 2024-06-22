// server-side script: routes.php
<?php
$routes = [
    'testkit' => 'https://star.xomud.quest/quest/channel/testkit.php',
    'default' => 'https://star.xomud.quest/quest/channel/default.php',
    'example' => 'hypertext/example.php',
];

header('Content-Type: application/json');
echo json_encode($routes);