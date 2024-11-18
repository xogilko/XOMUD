export async function activate_module(lain) {
    if (typeof window.Buffer === 'undefined') {
        window.Buffer = {
            from: function(data, encoding) {
                if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
                    return new Uint8Array(data);
                }
                if (encoding === 'utf8' || encoding === 'utf-8' || !encoding) {
                    const encoder = new TextEncoder();
                    return encoder.encode(data);
                }
                throw new Error('Unsupported encoding: ' + encoding);
            },
            
            allocUnsafe: function(size) {
                return new Uint8Array(size);
            }
        };

        Uint8Array.prototype.copy = function(target, targetStart, sourceStart, sourceEnd) {
            sourceStart = sourceStart || 0;
            sourceEnd = sourceEnd || this.length;
            targetStart = targetStart || 0;
            
            const sourceData = this.slice(sourceStart, sourceEnd);
            target.set(sourceData, targetStart);
            return sourceData.length;
        };
    }

    const Message = {
        magicBytes: Buffer.from('Bitcoin Signed Message:\n', 'utf8'),
        
        sign: function(message, privateKey) {
            try {
                const messageBuffer = Buffer.from(message, 'utf8');
                
                const combinedLength = this.magicBytes.length + messageBuffer.length;
                const combined = Buffer.allocUnsafe(combinedLength);
                
                this.magicBytes.copy(combined, 0);
                messageBuffer.copy(combined, this.magicBytes.length);
                
                const arrayData = Array.from(combined);
                
                const bsvBuffer = new bsv.deps.Buffer(arrayData);
                const hash = bsv.crypto.Hash.sha256(bsvBuffer);
                
                const signature = bsv.crypto.ECDSA.sign(hash, privateKey);
                return signature.toString();
            } catch (error) {
                console.error('Error in Message.sign:', error);
                throw error;
            }
        }
    };

    lain.rom.keychain_sig_request = function(message) {
        if (!mainPrivateKey) {
            console.error('No private key available');
            return null;
        }

        console.log('Received signing request for:', message);
        
        if (!confirm('Sign this message?')) {
            return null;
        }
        console.log('User confirmation: true');

        try {
            const signature = Message.sign(message, mainPrivateKey);
            console.log('Generated signature:', signature);
            return signature;
        } catch (error) {
            console.error('Signing error:', error);
            return null;
        }
    };

    const target = document.getElementById('testkit_keychain');

    if (target.parentElement.parentElement.classList.contains('draggable')) {
        target.parentElement.parentElement.style.backgroundColor = 'black';
    }

    const privkey_info = document.createElement('div');
    const keychain_active = document.createElement('span');
    const introtext = document.createElement('div');
    const loginbutton = document.createElement('button');
    let data = null;
    let currentIndex = 0;
    let mainPrivateKey;
    let isChildrenVisible = true;
    let clearableElements = [];

    const style = document.createElement('style');
    style.textContent = `
        .fineprint {
            font-size: 13px;
            font-weight: 300;
            text-shadow: 0px 0px 2px SteelBlue;
            letter-spacing: -1px;
        }
        .progress-bar {
            width: 100%;
            background-color: #f3f3f3;
            border-radius: 5px;
            overflow: hidden;
            margin-top: 10px;
            height: 10px;
        }
        .progress-bar-fill {
            height: 100%;
            width: 0;
            background-color: #4caf50;
            transition: width 0.5s;
        }
        .success-message {
            color: blue;
            animation: colorTransitionSuccess 5s forwards;
        }
        @keyframes colorTransitionSuccess {
            from { color: blue; }
            to { color: black; }
        }
        @keyframes colorTransitionFailure {
            from { color: red; }
            to { color: black; }
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #555;
            padding: 4px;
            position: relative;
        }
        td.balance-cell {
            cursor: pointer;
            transition: box-shadow 0.3s;
        }
        td.balance-cell:hover {
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
        }
        .balance-inner {
            display: inline-block;
            width: 100%;
            height: 100%;
            transition: color 5s;
            color: black;
        }
    `;
    target.secure(style);

    const getScriptPubKey = (pubkey) => {
        const pubKeyHash = bsv.crypto.Hash.sha256ripemd160(pubkey.toBuffer()).toString('hex');
        return bsv.Script.fromASM(`OP_DUP OP_HASH160 ${pubKeyHash} OP_EQUALVERIFY OP_CHECKSIG`);
    };

    const getUTXO = async (address, pubkey) => {
        const fetchUTXOs = async (url) => {
            return fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (!data || typeof data !== 'object' || !data.result) {
                        return [];
                    }
                    return data.result.map(out => ({
                        address,
                        txid: out.tx_hash,
                        vout: out.tx_pos,
                        value: out.value,
                        height: out.height,
                        amount: parseFloat((out.value / 1e8).toFixed(8)),
                        script: pubkey ? getScriptPubKey(pubkey).toString() : out.script
                    }));
                })
                .catch(error => {
                    console.error('Failed to fetch UTXOs:', error);
                    return [];
                });
        };

        let lookupUnconfirmed = `https://api.whatsonchain.com/v1/bsv/test/address/${address}/unconfirmed/unspent`;
        let utxos = await fetchUTXOs(lookupUnconfirmed);

        if (utxos.length === 0) {
            let lookupConfirmed = `https://api.whatsonchain.com/v1/bsv/test/address/${address}/confirmed/unspent`;
            utxos = await fetchUTXOs(lookupConfirmed);
        }
        return utxos;
    };

    const fireTX = async (utxos, targetAddresses, satoshis, changeAddress, privateKey) => {
        try {
            let tx = new bsv.Transaction()
                .from(utxos);

            targetAddresses.forEach(address => {
                tx.to(address, parseInt(satoshis, 10));
            });

            tx.change(changeAddress)
              .sign(privateKey);

            const serializedTx = tx.serialize();

            const response = await fetch('https://api.whatsonchain.com/v1/bsv/test/tx/raw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ txhex: serializedTx })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error in fireTX:', error);
            throw error;
        }
    };

    function setupClearableElement(element) {
        clearableElements.push(element);
        return element;
    }

    function clearElements() {
        clearableElements.forEach(element => element.remove());
        clearableElements = [];
    }

    function initial() {
        clearElements();
        
        const elements = [];
        
        introtext.innerHTML = "<b>custodial keychain 🔑</b><br><i>protected via shadow dom</i>";
        target.secure(introtext);
        elements.push(introtext);
        
        const hr = document.createElement('hr');
        hr.style.marginTop = '10px';
        target.secure(hr);
        elements.push(hr);
        
        const modeToggle = document.createElement('div');
        modeToggle.style.marginTop = '10px';
        modeToggle.style.marginBottom = '10px';
        elements.push(modeToggle);
        
        const toggleCheckbox = document.createElement('input');
        toggleCheckbox.type = 'checkbox';
        toggleCheckbox.id = 'newWindowMode';
        
        const toggleLabel = document.createElement('label');
        toggleLabel.htmlFor = 'newWindowMode';
        toggleLabel.innerHTML = ' <i>static mode (for autofill)</i>';
        
        modeToggle.appendChild(toggleCheckbox);
        modeToggle.appendChild(toggleLabel);
        target.secure(modeToggle);
        
        loginbutton.innerText = 'submit credentials';
        loginbutton.style.marginTop = '0px';
        target.secure(loginbutton);
        elements.push(loginbutton);
        
        loginbutton.addEventListener('click', function() {
            if (toggleCheckbox.checked) {
                handleNewWindowMode();
            } else {
                UserPhraseInput();
            }
        });
        
        clearableElements = elements;
    }

    function handleNewWindowMode() {
        if (navigator.serviceWorker.controller) {
            const sessionId = Math.random().toString(36).substring(7);
            console.log('(keychain) Starting new window mode, sessionId:', sessionId);
            lain.rom.testkit_corner();
            navigator.serviceWorker.controller.postMessage({
                type: 'KEYCHAIN_START',
                data: sessionId
            });
            
            // Direct redirect instead of new tab
            window.location.href = 'https://xomud.quest/hypertext/testkit_keychain.php';
        }
    }

    function UserPhraseInput() {
        clearElements();

        const elements = [];

        const info = document.createElement('div');
        info.innerHTML = `<b><i>Enter your credentials🔑</i></b><br>`;
        elements.push(info);
        target.secure(info);

        const form = document.createElement('form');
        form.id = 'keychain_form';
        form.method = 'post';
        form.setAttribute('autocomplete', 'on');
        elements.push(form);

        const phrase_input = document.createElement('input');
        phrase_input.type = 'text';
        phrase_input.id = 'username_input';
        phrase_input.name = 'username';
        phrase_input.placeholder = 'enter encryption phrase';
        phrase_input.autocomplete = 'username webauthn';
        phrase_input.required = true;

        const lineBreak = document.createElement('br');

        const privkey_input = document.createElement('input');
        privkey_input.type = 'password';
        privkey_input.id = 'password_input';
        privkey_input.name = 'password';
        privkey_input.placeholder = 'enter private key';
        privkey_input.autocomplete = 'current-password';
        privkey_input.required = true;

        form.appendChild(phrase_input);
        form.appendChild(lineBreak);
        form.appendChild(privkey_input);

        const submit_button = document.createElement('button');
        submit_button.type = 'submit';
        submit_button.innerText = 'Submit';
        form.appendChild(submit_button);

        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            try {
                const privateKeyWIF = privkey_input.value;
                clearElements();
                await setupKeychainInterface(privateKeyWIF);
            } catch (error) {
                console.error('(keychain) Error:', error);
                const errorMsg = document.createElement('div');
                errorMsg.style.color = 'red';
                errorMsg.innerText = 'Invalid private key format';
                target.secure(errorMsg);
                initial();
            }
        });

        clearableElements = elements;
        target.secure(form);
    }

    async function keySecured(encryptedData) {
        console.log('(keychain) Entering keySecured with data:', encryptedData);
        
        try {
            while (clearableElements.length > 0) {
                const element = clearableElements.pop();
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }

            console.log('(keychain) Creating decryption UI');
            const phraseInput = document.createElement('input');
            phraseInput.type = 'text';
            phraseInput.placeholder = 'Enter encryption phrase';
            target.secure(phraseInput);

            const decryptButton = document.createElement('button');
            decryptButton.innerText = 'Decrypt';
            target.secure(decryptButton);

            decryptButton.addEventListener('click', async () => {
                console.log('(keychain) Attempting decryption');
                try {
                    const enc = new TextEncoder();
                    const keyMaterial = await window.crypto.subtle.importKey(
                        'raw',
                        enc.encode(phraseInput.value),
                        { name: 'PBKDF2' },
                        false,
                        ['deriveKey']
                    );

                    const key = await window.crypto.subtle.deriveKey(
                        {
                            name: 'PBKDF2',
                            salt: enc.encode('some_salt'),
                            iterations: 100000,
                            hash: 'SHA-256'
                        },
                        keyMaterial,
                        { name: 'AES-GCM', length: 256 },
                        true,
                        ['decrypt']
                    );

                    console.log('(keychain) Key derived, attempting to decrypt');
                    const decrypted = await window.crypto.subtle.decrypt(
                        {
                            name: 'AES-GCM',
                            iv: new Uint8Array(encryptedData.iv)
                        },
                        key,
                        Uint8Array.from(atob(encryptedData.encryptedPrivateKey), c => c.charCodeAt(0))
                    );

                    const privateKeyWIF = new TextDecoder().decode(decrypted);
                    console.log('(keychain) Successfully decrypted private key');

                    // Remove decryption UI
                    phraseInput.remove();
                    decryptButton.remove();

                    // Setup keychain interface with the decrypted private key
                    await setupKeychainInterface(privateKeyWIF);
                    
                } catch (error) {
                    console.error('Decryption failed:', error);
                    const errorMsg = document.createElement('div');
                    errorMsg.style.color = 'red';
                    errorMsg.innerText = 'Incorrect encryption phrase';
                    target.secure(errorMsg);
                }
            });

        } catch (error) {
            console.error('Error during processing:', error);
            
            while (clearableElements.length > 0) {
                const element = clearableElements.pop();
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }
            
            const errorMessage = document.createElement('div');
            errorMessage.style.color = 'red';
            errorMessage.style.textShadow = '2px 2px 4px black';
            errorMessage.style.marginTop = '10px';
            errorMessage.innerText = 'Failed, try again';
            target.secure(errorMessage);
            
            initial();
        }
    }

    function generateChildKeys(privateKeyWIF, table) {
        let hdPrivateKey;
        try {
            // Try to create HD key from the private key
            const privateKey = new bsv.PrivateKey.fromWIF(privateKeyWIF);
            const buffer = privateKey.toBuffer();
            const hash = bsv.crypto.Hash.sha256(buffer);
            hdPrivateKey = new bsv.HDPrivateKey.fromSeed(hash, 'testnet');
        } catch (e) {
            console.error('Error generating HD key:', e);
            return;
        }

        // Create table header if it doesn't exist
        if (table.rows.length === 0) {
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `
                <th>Index</th>
                <th>Address</th>
                <th>Balance</th>
            `;
            table.appendChild(headerRow);
        }

        for (let i = currentIndex; i < currentIndex + 5; i++) {
            const childKey = hdPrivateKey.deriveChild(`m/0'/0/${i}`);
            const childPrivateKey = childKey.privateKey;
            const childPublicKey = childPrivateKey.publicKey;
            const childAddress = childPublicKey.toAddress('testnet').toString();

            const childRow = document.createElement('tr');
            childRow.className = 'child-row';
            childRow.style.display = isChildrenVisible ? 'table-row' : 'none';
            childRow.innerHTML = `
                <td><b>${i + 1}</b></td>
                <td><span class="fineprint">${childAddress}</span></td>
                <td class="balance-cell"><div class="balance-inner">???</div></td>
            `;
            table.appendChild(childRow);
        }

        currentIndex += 5;

        const balanceCells = table.querySelectorAll('.balance-cell');
        balanceCells.forEach(cell => {
            cell.addEventListener('click', async function() {
                const address = this.parentElement.cells[1].textContent.trim();
                await updateBalanceForCell(this, address);
            });
        });
    }

    async function setupKeychainInterface(privateKeyWIF) {
        clearElements();

        const table = document.createElement('table');
        target.secure(table);

        // Create table header
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Index</th>
            <th>Address</th>
            <th>Balance</th>
        `;
        table.appendChild(headerRow);

        // Add main address row with emoji
        try {
            const mainPrivateKey = new bsv.PrivateKey.fromWIF(privateKeyWIF);
            const mainPublicKey = mainPrivateKey.publicKey;
            const mainAddress = mainPublicKey.toAddress('testnet').toString();

            const mainRow = document.createElement('tr');
            mainRow.innerHTML = `
                <td><b>🔑</b></td>
                <td><span class="fineprint">${mainAddress}</span></td>
                <td class="balance-cell"><div class="balance-inner">???</div></td>
            `;
            table.appendChild(mainRow);

            // Add click listener for main balance
            const mainBalanceCell = mainRow.querySelector('.balance-cell');
            mainBalanceCell.addEventListener('click', async function() {
                await updateBalanceForCell(this, mainAddress);
            });
        } catch (error) {
            console.error('(keychain) Error creating main address:', error);
        }

        // Add "Load More" button
        const loadMoreButton = document.createElement('button');
        loadMoreButton.innerText = 'Load More Keys';
        loadMoreButton.addEventListener('click', () => generateChildKeys(privateKeyWIF, table));
        target.secure(loadMoreButton);

        // Add refresh button
        const refreshButton = document.createElement('button');
        refreshButton.innerText = 'Refresh Balances';
        refreshButton.addEventListener('click', () => refreshUTXOBalances(table));
        target.secure(refreshButton);

        // Add toggle visibility button
        const toggleButton = document.createElement('button');
        toggleButton.innerText = isChildrenVisible ? 'Hide Children' : 'Show Children';
        toggleButton.addEventListener('click', () => {
            isChildrenVisible = !isChildrenVisible;
            toggleButton.innerText = isChildrenVisible ? 'Hide Children' : 'Show Children';
            const rows = table.getElementsByClassName('child-row');
            for (let row of rows) {
                row.style.display = isChildrenVisible ? 'table-row' : 'none';
            }
        });
        target.secure(toggleButton);

        // Add buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.marginTop = '10px';
        buttonContainer.appendChild(loadMoreButton);
        buttonContainer.appendChild(refreshButton);
        buttonContainer.appendChild(toggleButton);
        target.secure(buttonContainer);
    }

    async function refreshUTXOBalances(table) {
        const rows = table.getElementsByTagName('tr');
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progressBarFill = document.createElement('div');
        progressBarFill.className = 'progress-bar-fill';
        progressBar.appendChild(progressBarFill);
        target.secure(progressBar);

        for (let i = 1; i < rows.length; i++) {
            const addressCell = rows[i].cells[1];
            const balanceCell = rows[i].cells[2];
            const address = addressCell.textContent.trim();

            await updateBalanceForCell(balanceCell, address);
            progressBarFill.style.width = `${((i / (rows.length - 1)) * 100).toFixed(2)}%`;

            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        setTimeout(() => {
            progressBar.remove();
        }, 500);
    }

    async function updateBalanceForCell(balanceCell, address) {
        try {
            const utxos = await getUTXO(address);
            let totalValue = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
            const balanceInner = balanceCell.querySelector('.balance-inner');
            if (!isNaN(totalValue) && totalValue > 0) {
                balanceInner.textContent = `${totalValue.toString()} ⌀`;
                balanceInner.style.color = 'blue';
                balanceInner.style.animation = 'colorTransitionSuccess 5s forwards';
            } else {
                balanceInner.style.color = 'red';
                balanceInner.style.animation = 'colorTransitionFailure 5s forwards';
            }
        } catch {
            const balanceInner = balanceCell.querySelector('.balance-inner');
            balanceInner.style.color = 'red';
            balanceInner.style.animation = 'colorTransitionFailure 5s forwards';
        }
    }

    // Check for stored credentials first
    if (navigator.serviceWorker.controller) {
        console.log('(keychain) Module activated, checking service worker for stored credentials');
        
        try {
            const messageChannel = new MessageChannel();
            const promise = new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    console.log('(keychain) Received response from service worker:', event.data);
                    resolve(event.data);
                };
                
                // Add timeout to the promise
                setTimeout(() => {
                    console.log('(keychain) Service worker response timed out');
                    resolve(null);
                }, 5000);
            });
            
            console.log('(keychain) Sending KEYCHAIN_INIT message to service worker');
            navigator.serviceWorker.controller.postMessage({
                type: 'KEYCHAIN_INIT'
            }, [messageChannel.port2]);
            
            const storedCredentials = await promise;
            if (storedCredentials) {
                console.log('(keychain) Found stored credentials, proceeding to keySecured');
                keySecured(storedCredentials);
                return;
            } else {
                console.log('(keychain) No stored credentials found, proceeding to initial setup');
            }
        } catch (error) {
            console.log('(keychain) Error checking service worker:', error);
        }
    } else {
        console.log('(keychain) No service worker controller found');
    }

    initial();
}
