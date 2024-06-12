<?php
$requestPath = isset($requestPathInfo) ? $requestPathInfo : $_SERVER['REQUEST_URI'];
$urlComponents = parse_url($requestPath);
$path = $urlComponents['path'];
$scriptPath = '/default';
if (substr($path, 0, strlen($scriptPath)) === $scriptPath) {
    $request = substr($path, strlen($scriptPath));
    $request = $request ?: '/';
} else {
    $request = $path;
}
$isAjax = isset($_GET['ajax']);
$cssURL = "../static/style.css?" . time();
$dateTime = date('l');
function getContent($request) {
switch ($request) {
case '/':
case '/index':
return <<<HTML
<div class="navigation"><table class="horizon"><tr><td>
<nav>✰ home / <a href="/about" onclick="loadContent('/about'); return false;">about</a> / <a href="/navi" onclick="loadContent('/navi'); return false;">navi</a> ✰</nav>
</td>
</tr>
</table>
</div>
<div class="container">
<table class="primitive">
<tr>
<td>
<p>hello, world<br>
welcome to the homepage</p>
<p><i>what is xomud?</i></p>
<p>xomud is a real-time multiplayer hypermedia agency</p>
<button onclick="navi(alice, 'alice.rom.enclose_draggable(alice.dir.testkit_menu_html)', 'document.body')">Click Me</button>
<p><u><b>everything is subject to change</b></u></p>
<p>join discord using this <a href= "https://discord.gg/9U48T5UNJN"> hyperlink</a></p>
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
<nav>✰ <a href="/" onclick="loadContent('/'); return false;">home</a> / about / <a href="/navi" onclick="loadContent('/navi'); return false;">navi</a> ✰</nav>
</td>
</tr>
</table>
</div>
<div class="container">
<table class="primitive">
<tr>
<td>
<img src="../static/resources/dialup.png" style="width: 24%;">
<br>
<img src="../static/resources/ytpost.png" style="width: 20%;">
<br>
about us
<br>
<p><i>we may not be best friends, ok tysm there will be more information later, alright.</i></p>
<p><u><b>everything is subject to change</b></u></p>
</td>
</tr>
</table>
</div>
HTML;
case '/navi':
return <<<HTML
<div class="navigation"><table class="horizon"><tr><td>
<nav>✰ <a href="/" onclick="loadContent('/'); return false;">home</a> / <a href="/about" onclick="loadContent('/about'); return false;">about</a> / navi ✰</nav>
</td>
</tr>
</table>
</div>
<div class="container">
<table class="primitive">
<tr>
<td>
<img src="../static/resources/meridian/2.png"><br>
<img src="../static/resources/meridian/0.png">
<img src="../static/resources/meridian/diagram1.png">
<img src="../static/resources/meridian/diagram2.png">
</td>
</tr>
</table>
</div>
HTML;
default:
http_response_code(404);
return <<<HTML
<div class="navigation">
<nav>✰ <a href="/">home</a> / <a href="/about">about</a> / <a href="/navi">navi</a> ✰</nav>
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
<script src="https://unpkg.com/simpercell@1.1.0/navi.js"></script>
<meta portal="https://star.xomud.quest" uri="testkit" domain="/default">
<title>★_xomud.quest_★</title>
<link rel="stylesheet" type="text/css" href="<?php echo $cssURL; ?>">
<link rel="manifest" href="/manifest.json">
<meta property="og:title" content="XOMUD" />
<meta property="og:description" content="a real-time multiplayer hypermedia agency" />
<meta property="og:image" content="http://xomud.quest/static/resources/xologo.png" />
<meta property="og:url" content="http://xomud.quest/" />
<meta property="og:type" content="website" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
</head>
<body>
<div class="header">
<table class="horizon">
<tr>
<td><br>
<h1><a href="/"><img src="../static/resources/xologo.png"></a></h1>
<h1><span style="color: yellow; text-shadow: 1px 1px 2px black;">xomud</span></h1>
</td></tr></table></div>
<span id="content"><?php echo $content; ?>
</span>
<div class="container">
<table class="primitive">
<tr>
<td>
<span id="datetime">
<?php echo $dateTime; ?><hr>
</span>
<a href="../static/resources/compliance_certificate_xomud.png.sig.asc.html"><img src="../static/resources/compliance_certificate_xomud.png" style="width: 30%;"></a>
</td>
</tr>
</table>
</div>
<script>
function loadContent(url) {
    fetch('/default' + url + '?ajax=1')
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            window.history.pushState({ path: url }, '', url);
        })
        .catch(error => console.error('Error loading the page: ', error));
}
window.onpopstate = function(event) {
    fetch('/default' + window.location.pathname + '?ajax=1')
        .then(response => response.text())
        .then(html => document.getElementById('content').innerHTML = html)
        .catch(error => console.error('Error loading the page: ', error));
};
</script>
<div id="end"></div>
</body>
</html>
