<?php

?>
<!DOCTYPE html>
<html>
<head>

<title>★ private key entry ★</title>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
</head>
<body>
    <div id="content" style="display: grid; place-items: center; height: 100vh">
        <center><img src="/static/resources/statictv.png"></center><br>
    
    <center>
        testkit_keychain will be passed a private key encrypted using a secret phrase, <br>
        which must be entered again manually upon returning to testkit_keychain on navi. <br>
    <form action="/login" method="post">
        <!-- Username Field -->
        <div>
            <label for="username">Secret Phrase:</label>
            <input type="text" id="username" name="username" autocomplete="username" required>
        </div>

        <!-- Password Field -->
        <div>
            <label for="password">Private Key:</label>
            <input type="password" id="password" name="password" autocomplete="current-password" required>
        </div>
        <!-- Submit Button -->
        <div>
            <button type="submit">Enter Key</button>
        </div>
    </form>
    </center>
    </div>
<script>
    document.getElementById('keychainForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Get the form values
        const secretphrase = document.getElementById('username').value;
        const privatekey = document.getElementById('password').value;

        if (navigator.serviceWorker.controller) {

            //encrypt password with cypher and pass it to postmsg
            const enc = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                enc.encode(secretphrase),
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            );
            const key = await window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: enc.encode('some_salt'), // Use a proper salt in a real application
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt']
            );
            // Encrypt the private key
            const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
            const encryptedPrivateKey = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                enc.encode(privatekey)
            );
            const encryptedPrivateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedPrivateKey)));
            
            navigator.serviceWorker.controller.postMessage({
                type: 'KEYCHAIN_END',
                data: {
                    iv: Array.from(iv),
                    encryptedPrivateKey: encryptedPrivateKeyBase64
                }
            });
        } else {
            console.log('nothing is left...')
        }
        if (navigator.credentials) {
            const cred = new PasswordCredential({
                id: username,
                password: password
            });

            navigator.credentials.store(cred).then(() => {
                console.log('Credentials stored successfully');
            }).catch(err => {
                console.error('Error storing credentials:', err);
            });
        }
    }
</script>
</body>
</html>