<?php
$requestPath = isset($requestPathInfo) ? $requestPathInfo : $_SERVER['REQUEST_URI'];
$urlComponents = parse_url($requestPath);
$path = $urlComponents['path'];
$scriptPath = '/xo/';

if (substr($path, 0, strlen($scriptPath)) === $scriptPath) {
    $request = substr($path, strlen($scriptPath));
    $request = $request ?: '/';
} else {
    $request = $path;
}
$isAjax = isset($_GET['ajax']);
$cssURL = "../static/style.css?" . time();
$dateTime = strtolower(date('l'));
$dateTime = str_replace('y', 'e', $dateTime);
function getContent($request) {
switch ($request) {
case '/':
case '/index':
return <<<HTML
<div class="navigation"><table class="horizon"><tr><td>
<nav>✰ home ✰ <a href="/about" onclick="loadContent('/about'); return false;">about</a> ✰ <a href="/navi" onclick="loadContent('/navi'); return false;">navi</a> ✰</nav>
</td>
</tr>
</table>
</div>
<div class="container">
<table class="primitive">
<tr>
<td><p>
/xo/ <br>
hello, world<br>
welcome to ur homepage</p>
<p><i>what is xomud?</i></p>
<p>xomud is a multi-user hypermedia agency</p>
<button onclick="navi(alice(), 'lain.rom.enclose_draggable(lain.dvr.testkit_menu_html)', 'document.body')">Click Me</button> status: <i>here be dragons</i>
<p>join discord using this <a href= "https://discord.gg/9U48T5UNJN"> hyperlink</a></p>
<p><u><b>everything is subject to change</b></u></p>
</td>
</tr>
</table>
</div>
<div class="container">
<table class="primitive">
<tr>
<td>
<p>u may be here to visit our premiere vaporware ux solution.
<br> it is currently under development, <a href="/navi" onclick="loadContent('/navi'); return false;">click here to learn more.</a></p>
</td>
</tr>
</table>
</div>
HTML;
case '/about':
return <<<HTML
<div class="navigation"><table class="horizon"><tr><td>
<nav>✰ <a href="/" onclick="loadContent('/'); return false;">home</a> ✰ about ✰ <a href="/navi" onclick="loadContent('/navi'); return false;">navi</a> ✰</nav>
</td>
</tr>
</table>
</div>
<div class="container">
<table class="primitive">
<tr>
<td><center>
<p>
<img src="../static/resources/dialup.png" align="center" style="width: 28%;"></p>
<p><u><b>everything is subject to change</b></u></p></center>
</td>
</tr>
</table>
</div>
<div class="container">
<table class="primitive">
<tr>
<td>
<p>this html document is generated by my web server
<br>it is routed to /xo/ as a default channel</p>
<p>this document also has navi.js library which has a portal: <i>star.xomud.quest</i>
<br>this portal has an /arch/ api which forwards requests to a network that returns aux data for navi users</p>
</td>
</tr>
</table>
</div>
HTML;
case '/navi':
return <<<HTML
<div class="navigation"><table class="horizon"><tr><td>
<nav>✰ <a href="/" onclick="loadContent('/'); return false;">home</a> ✰ <a href="/about" onclick="loadContent('/about'); return false;">about</a> ✰ navi ✰</nav>
</td>
</tr>
</table>
</div>
<div class="container">
<table class="primitive">
<tr>
<td>
<p><center><img src="../static/resources/meridian/2.png"><br>
<img src="../static/resources/meridian/0.png"><br>
<img src="../static/resources/meridian/diagram1.png"><br>
<img src="../static/resources/meridian/diagram2.png"></center></p>
<p><u><center><b>everything is subject to change</b></center></u></p>
</td>
</tr>
</table>
</div>
HTML;
default:
http_response_code(404);
return <<<HTML
<div class="navigation"><table class="horizon"><tr><td>
<nav>✰ <a href="/">home</a> ✰ <a href="/about">about</a> ✰ <a href="/navi">navi</a> ✰</nav>
</td>
</tr>
</table>
</div>
<div class="container">
<br>
<h1>404</h1>
<table class="primitive">
<tr>
<td>
<p>page not found?!?!</p>
</td>
</tr>
</table>
</div>
HTML;
}
}
$content = getContent($request);
if ($isAjax) {
echo $content;
exit;
}
?>
<!DOCTYPE html>
<html>
<head>
<script src="https://xomud.quest/hypertext/navi.js"></script>
<meta portal="https://star.xomud.quest/" aux="testkit" chan="/xo/">
<title>★ xomud.quest ★</title>
<link rel="stylesheet" type="text/css" href="<?php echo $cssURL; ?>">
<link rel="manifest" href="/manifest.json">
<meta property="og:title" content="XOMUD" />
<meta property="og:description" content="a real-time multiplayer hypermedia agency" />
<meta property="og:image" content="http://xomud.quest/static/resources/netter.png" />
<meta property="og:url" content="http://xomud.quest/" />
<meta property="og:type" content="website" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="mobile-web-app-capable" content="yes">
</head>
<body bgcolor="cyan">
<center>
<div class="header"><br>
<h1><a href="/"><img src="../static/resources/wordart.png" width="200"></a></h1>
</div>
<span id="content"><?php echo $content; ?>
</span>
<div class="container">
<table class="primitive">
<tr>
<td>
<span id="datetime">
<?php echo $dateTime; ?>
</span>
</tr>
</td>
</table>
<a href="https://star.xomud.quest">✰</a><br>
</div>
<script>
function loadContent(url) {
    const urlpath = '/xo' + url;
    fetch(urlpath + '?ajax=1')
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            window.history.pushState({ path: urlpath }, '', urlpath);
        })
        .catch(error => console.error('Error loading the page: ', error));
}
window.onpopstate = function(event) {
    fetch(window.location.pathname + '?ajax=1')
        .then(response => response.text())
        .then(html => document.getElementById('content').innerHTML = html)
        .catch(error => console.error('Error loading the page: ', error));
};
</script>
</center>
</body>
</html>