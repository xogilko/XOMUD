export async function activate_module(lain) {

    //dependencies
    if (!window.Buffer){
        const j = document.createElement('script');
        j.src = "https://star.xomud.quest/quest/lib/buffer.js";
        document.head.appendChild(j);
        j.onload = () => {
            window.Buffer = window.buffer.Buffer;
            if (!window.Message){
                const w = document.createElement('script');
                w.src = "https://star.xomud.quest/quest/lib/message.js";
                document.head.appendChild(w);
            }
        };
    }

    const target = document.getElementById('testkit_keychain');
    
    if (target.parentElement.parentElement.classList.contains('draggable')) {
        target.parentElement.parentElement.style.backgroundColor = 'black';
    }

    const privkey_info = document.createElement('div');
    const keychain_active = document.createElement('span');
    const introtext = document.createElement('div');
    const loginbutton = document.createElement('button');
    let data = null;

    function signProof(key, address){
        if (!window.bsv || !window.Message || !window.Buffer){
            console.log('missing libraries')
            return null
        }
        const privateKey = bsv.PrivateKey.fromWIF(key)
        const message = "This is a test message.";
        const signature = Message.sign(message, privateKey);
        console.log(`Message: ${message}`);
        console.log(`Signature: ${signature}`);
        const isValid = Message.verify(message, address, signature);
        console.log(`Is the signature valid? ${isValid}`);
        return isValid
    }
    const getUTXO = async (address) => {
        const fetchUTXOs = async (url) => {
            return fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log('this is beforee', data)
                if (!data || typeof data !== 'object' || !data.result) {
                    console.error('Unexpected!!! structure:', data);
                    return [];
                }
                return data.result.map(out => ({
                    address,
                    txid: out.tx_hash,
                    vout: out.tx_pos,
                    value: out.value,
                    height: out.height,
                    amount: parseFloat((out.value / 1e8).toFixed(8)),
                    script: out.script
                }));
            })
            .catch(error => {
                console.error('Failed to fetch UTXOs:', error);
                return []; // Return an empty array in case of error
            });
        };
    
        let lookupUnconfirmed = `https://api.whatsonchain.com/v1/bsv/test/address/${address}/unconfirmed/unspent`;
        let utxos = await fetchUTXOs(lookupUnconfirmed);
    
        if (utxos.length === 0) {
            let lookupConfirmed = `https://api.whatsonchain.com/v1/bsv/test/address/${address}/confirmed/unspent`;
            utxos = await fetchUTXOs(lookupConfirmed);
        }
        console.log('are u even listening.', utxos)
        return utxos;
    };
    function keySecured(privatekey){
        privkey_info.innerHTML = `<b><i>private key decrypted🔑</i></b><br>`;
        keychain_active.innerHTML = `Enter UTXO Address:`;
        const utxo_address_form = document.createElement('form');
        utxo_address_form.id = 'utxo_address_form';
        const utxo_address_input = document.createElement('input');
        utxo_address_input.type = 'text';
        utxo_address_input.id = 'utxo_address_input';
        utxo_address_input.placeholder = 'enter UTXO address';

        const submit_button = document.createElement('button');
        submit_button.type = 'submit';
        submit_button.innerText = 'Submit';

        utxo_address_form.appendChild(utxo_address_input);
        utxo_address_form.appendChild(submit_button);

        keychain_active.appendChild(utxo_address_form);

        utxo_address_form.addEventListener('submit', async function(event) {
            event.preventDefault();
            const utxoAddress = utxo_address_input.value;
            utxo_address_form.remove();
            privkey_info.innerHTML = `<b><i>verifying access🔑</i></b><br>`;
            keychain_active.innerHTML = `signing utxo via private key...`;
            const proof = signProof(privatekey, utxoAddress);
            console.log('reported proof:', proof)
            if (proof == false) {
                privkey_info.remove();
                keychain_active.innerText= 'key did not match';
                initial();
            } else {
                
                const utxos = await getUTXO(utxoAddress);
                privkey_info.innerHTML = `<b><i>access verified🔑</i></b><br>`;
                keychain_active.innerHTML = `UTXO balance requested:`;
                console.log('this is the utxo', utxos)
                let totalValue = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
                keychain_active.innerHTML = '<br>total: ' + totalValue.toString() + '⌀';
                
            }
        });
    }
    
    function xorDecrypt(encryptedData, key) {
        const salt = 'some_salt'; // Use the same salt as in the encryption
        const decodedData = atob(encryptedData); // Base64 decode the input
        let output = decodedData;
        for (let round = 0; round < 3; round++) { // Multiple rounds
            let temp = '';
            for (let i = 0; i < output.length; i++) {
                temp += String.fromCharCode(output.charCodeAt(i) ^ key.charCodeAt(i % key.length) ^ salt.charCodeAt(i % salt.length));
            }
            output = temp;
        }
        return output;
    }

    function UserPhraseInput() {
        if (data) {
            privkey_info.innerHTML = `<b><i>encrypted key recieved🔑</i></b><br><span>securely decrypt:</span>`;
            target.secure(privkey_info);
                // Remove the element introtext
                introtext.remove();
                loginbutton.remove();
                keychain_active.id = 'keychain_active';
                const keychain_form = document.createElement('form');
                    keychain_form.id = 'keychain_form';
                const keychain_input = document.createElement('input');
                    keychain_input.type = 'text';
                    keychain_input.id = 'keychain_input';
                    keychain_input.placeholder = 'enter user phrase';
                const submit_button = document.createElement('button');
                    submit_button.type = 'submit';
                    submit_button.innerText = 'Submit';              
                keychain_form.appendChild(keychain_input);
                keychain_form.appendChild(submit_button);
                keychain_form.addEventListener('submit', function(event) {
                    event.preventDefault();
                    const userPhrase = keychain_input.value;
                    try {
                        const decryptedPrivateKey = xorDecrypt(data.encryptedPrivateKey, userPhrase);
                        keySecured(decryptedPrivateKey);
                    } catch (error) {
                        console.error('Error decrypting private key:', error);
                    }
                });
                keychain_active.appendChild(keychain_form);
                target.secure(keychain_active);
        }
        else {
            privkey_info.innerHTML = `<b>no private key loaded</b>`
        }
    }

    navigator.serviceWorker.ready.then(function(registration) {
        if (registration.active) {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = function(event) {
                data = event.data;
                UserPhraseInput();
            };
            registration.active.postMessage({ type: 'KEYCHAIN_INIT' }, [messageChannel.port2]);
        } else {
            target.innerText="no service, we broke";
        }
    });

    function initial() {

    introtext.innerHTML = "<b>custodial auto-sign 🔑</b><br><i>protected via shadow dom</i><br>";
    loginbutton.innerText = 'submit a private key';
    loginbutton.addEventListener('click', function() {
        // give service worker the current page href and channel sub
        navigator.serviceWorker.controller.postMessage({
            type: 'KEYCHAIN_START',
            data: {
                origin: window.location.href,
                httxid: alice.subs["chan:" + window.location.pathname] || undefined
            }
        });
        
        window.location.href = 'https://xomud.quest/static/testkit_keychain.html';

    });
    target.secure(introtext);
    target.secure(loginbutton);
    }
    initial();

}