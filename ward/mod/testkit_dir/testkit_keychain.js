export async function activate_module(lain) {
    // Add Buffer.js script
    const bufferScript = document.createElement('script');
    bufferScript.src = 'https://star.xomud.quest/arch/lib/buffer.js';
    document.head.appendChild(bufferScript);

    // Wait for Buffer to be available
    console.log('Waiting for Buffer.js to load...');
    while (typeof Buffer === 'undefined') {
        console.log('Still waiting for Buffer.js...');
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log('Buffer.js loaded successfully!');

    // First add our Message implementation
    const Message = {
        magicBytes: Buffer.from('Bitcoin Signed Message:\n', 'utf8'),
        
        sign: function(message, privateKey) {
            try {
                // Convert message to Buffer
                const messageBuffer = Buffer.from(message, 'utf8');
                console.log('Message buffer:', messageBuffer);
                
                // Create combined buffer
                const combinedLength = this.magicBytes.length + messageBuffer.length;
                const combined = Buffer.allocUnsafe(combinedLength);
                
                this.magicBytes.copy(combined, 0);
                messageBuffer.copy(combined, this.magicBytes.length);
                
                console.log('Combined buffer:', combined);
                
                // Create hash
                const hash = bsv.crypto.Hash.sha256(combined);
                console.log('Created hash:', hash);
                
                // Sign the hash
                const signature = bsv.crypto.ECDSA.sign(hash, privateKey);
                return signature.toString();
            } catch (error) {
                console.error('Error in Message.sign:', error);
                throw error;
            }
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
    let currentIndex = 0; // Track the current index for child key generation
    let mainPrivateKey; // Store the main private key
    let isChildrenVisible = true; // For child key visibility state
    let clearableElements = []; // Add this line for tracking elements to clear

    // Create a style element for the shadow DOM
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
            height: 10px; /* Make the progress bar more narrow */
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
            border: 1px solid #555; /* Dark grey border */
            padding: 4px; /* Reduced padding */
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
        console.log('pkh:', pubKeyHash);
        return bsv.Script.fromASM(`OP_DUP OP_HASH160 ${pubKeyHash} OP_EQUALVERIFY OP_CHECKSIG`);
    };

    const getUTXO = async (address, pubkey) => {
        const fetchUTXOs = async (url) => {
            return fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (!data || typeof data !== 'object' || !data.result) {
                        console.error('Unexpected structure:', data);
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
            console.log('Serialized Transaction:', serializedTx);

            // Broadcast the transaction
            const response = await fetch('https://api.whatsonchain.com/v1/bsv/test/tx/raw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ txhex: serializedTx })
            });

            const result = await response.json();
            console.log('Broadcast result:', result);
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
        introtext.innerHTML = "<b>custodial auto-sign 🔑</b><br><i>protected via shadow dom</i><br>";
        loginbutton.innerText = 'submit credentials';
        loginbutton.addEventListener('click', function() {
            UserPhraseInput();
        });
        
        // Setup clearable elements
        const clearableIntro = setupClearableElement(introtext);
        const clearableButton = setupClearableElement(loginbutton);
        
        target.secure(clearableIntro);
        target.secure(clearableButton);
    }

    function UserPhraseInput() {
        clearElements(); // Clear previous elements

        privkey_info.innerHTML = `<b><i>Enter your credentials🔑</i></b><br>`;
        const clearableInfo = setupClearableElement(privkey_info);
        target.secure(clearableInfo);

        keychain_active.id = 'keychain_active';
        const keychain_form = document.createElement('form');
        keychain_form.id = 'keychain_form';

        const email_input = document.createElement('input');
        email_input.type = 'text';
        email_input.id = 'email_input';
        email_input.name = 'email';
        email_input.placeholder = 'enter private key';
        email_input.required = true;

        const password_input = document.createElement('input');
        password_input.type = 'text';
        password_input.id = 'password_input';
        password_input.name = 'password';
        password_input.placeholder = 'enter UTXO address';
        password_input.required = true;

        const submit_button = document.createElement('button');
        submit_button.type = 'submit';
        submit_button.innerText = 'Submit';

        keychain_form.appendChild(email_input);
        keychain_form.appendChild(password_input);
        keychain_form.appendChild(submit_button);

        const clearableForm = setupClearableElement(keychain_form);

        keychain_form.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = email_input.value;
            const password = password_input.value;
            keySecured(email, password);
        });

        target.secure(clearableForm);
    }

    async function keySecured(email, password) {
        try {
            // Clear all existing clearable elements
            while (clearableElements.length > 0) {
                const element = clearableElements.pop();
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }

            // Create and secure new status elements
            const statusMessage = document.createElement('div');
            statusMessage.innerHTML = `<b><i>credentials secured🔑</i></b><br>`;
            target.secure(statusMessage);

            const processingMessage = document.createElement('div');
            processingMessage.innerHTML = `Processing...`;
            target.secure(processingMessage);

            // Set up the signing functionality
            mainPrivateKey = email;
            console.log('Set mainPrivateKey to:', mainPrivateKey);

            // Set up keychain signature request function
            lain.rom.keychain_sig_request = async function(thingToSign) {
                console.log('Received signing request for:', thingToSign);
                return new Promise((resolve, reject) => {
                    const userConfirmed = confirm("Do you want to sign this item?");
                    console.log('User confirmation:', userConfirmed);
                    
                    if (userConfirmed) {
                        try {
                            if (!mainPrivateKey) {
                                throw new Error('Private key not set');
                            }
                            
                            console.log('Using mainPrivateKey:', mainPrivateKey);
                            const signature = Message.sign(thingToSign, mainPrivateKey);
                            console.log('Generated signature:', signature);
                            
                            resolve(signature);
                        } catch (error) {
                            console.error('Signing failed:', error);
                            reject('Signing failed: ' + error.message);
                        }
                    } else {
                        reject('User declined to sign');
                    }
                });
            };

            // Now proceed with UTXO setup
            mainPrivateKey = new bsv.PrivateKey.fromWIF(email);
            const pubkey = mainPrivateKey.publicKey;
            const utxos = await getUTXO(password, pubkey);
            let totalValue = utxos.reduce((acc, utxo) => acc + utxo.value, 0);

            // Remove processing message after UTXO setup
            if (processingMessage.parentNode) {
                processingMessage.parentNode.removeChild(processingMessage);
            }

            // Create and add the table
            const table = document.createElement('table');
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `<th></th><th>Address</th><th>UTXO</th>`;
            table.appendChild(headerRow);

            const mainRow = document.createElement('tr');
            mainRow.innerHTML = `<td>🔑</td><td><span class="fineprint">${password}</span></td><td class="balance-cell"><div class="balance-inner">???</div></td>`;
            table.appendChild(mainRow);

            target.secure(table);

            // Create button container for better layout
            const buttonContainer = document.createElement('div');
            buttonContainer.style.marginTop = '10px';
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';

            // Generate child keys button
            const generateKeysButton = document.createElement('button');
            generateKeysButton.innerText = 'Generate Child Keys';
            generateKeysButton.addEventListener('click', function() {
                generateChildKeys(email, table);
            });

            // Toggle visibility button
            const toggleButton = document.createElement('button');
            toggleButton.innerText = '▲ Hide Children';
            toggleButton.addEventListener('click', function() {
                isChildrenVisible = !isChildrenVisible;
                const childRows = table.querySelectorAll('.child-row');
                childRows.forEach(row => {
                    row.style.display = isChildrenVisible ? 'table-row' : 'none';
                });
                toggleButton.innerText = isChildrenVisible ? '▲ Hide Children' : '▼ Show Children';
            });

            buttonContainer.appendChild(generateKeysButton);
            buttonContainer.appendChild(toggleButton);
            target.secure(buttonContainer);

            // Add refresh button
            const refreshButton = document.createElement('button');
            refreshButton.innerText = 'Refresh UTXO Balances';
            refreshButton.addEventListener('click', function() {
                refreshUTXOBalances(table);
            });
            target.secure(refreshButton);

            // Add UTXO splitting functionality
            const satoshiInput = document.createElement('input');
            satoshiInput.type = 'number';
            satoshiInput.placeholder = 'Enter satoshis';
            satoshiInput.style.width = '50px';
            target.secure(satoshiInput);

            const splitButton = document.createElement('button');
            splitButton.innerText = 'Split';
            splitButton.addEventListener('click', function() {
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                const progressBarFill = document.createElement('div');
                progressBarFill.className = 'progress-bar-fill';
                progressBar.appendChild(progressBarFill);
                target.secure(progressBar);

                const targetAddresses = Array.from(table.getElementsByTagName('tr'))
                    .slice(1)
                    .map(row => row.cells[1].textContent.trim());
                
                fireTX(utxos, targetAddresses, satoshiInput.value, password, mainPrivateKey)
                    .then(result => {
                        progressBarFill.style.width = '100%';
                        setTimeout(() => {
                            progressBar.remove();
                            const successMessage = document.createElement('div');
                            successMessage.className = 'success-message';
                            successMessage.innerHTML = `Split successful! TXID: <span class="fineprint">${result.txid || result}</span>`;
                            target.secure(successMessage);
                        }, 500);
                    })
                    .catch(error => {
                        console.error('Error broadcasting transaction:', error);
                        progressBar.remove();
                    });
            });
            target.secure(splitButton);

            // Add the necessary CSS
            const additionalStyle = document.createElement('style');
            additionalStyle.textContent += `
                .child-row {
                    transition: all 0.3s ease;
                }
                .child-row.hidden {
                    display: none;
                }
            `;
            target.secure(additionalStyle);

        } catch (error) {
            console.error('Error during processing:', error);
            
            // Clear existing elements properly
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

    function generateChildKeys(email, table) {
        let hdPrivateKey;
        try {
            hdPrivateKey = new bsv.HDPrivateKey.fromString(email);
        } catch (e) {
            const privateKey = new bsv.PrivateKey.fromWIF(email);
            const buffer = privateKey.toBuffer();
            const hash = bsv.crypto.Hash.sha256(buffer);
            hdPrivateKey = new bsv.HDPrivateKey.fromSeed(hash, 'testnet');
        }

        for (let i = currentIndex; i < currentIndex + 5; i++) {
            const childKey = hdPrivateKey.deriveChild(`m/0'/0/${i}`);
            const childPrivateKey = childKey.privateKey;
            const childPublicKey = childPrivateKey.publicKey;
            const childAddress = new bsv.Address.fromPublicKey(childPublicKey, 'testnet');

            const childRow = document.createElement('tr');
            childRow.className = 'child-row';
            childRow.style.display = isChildrenVisible ? 'table-row' : 'none'; // Use global state
            childRow.innerHTML = `<td><b>${i + 1}</b></td><td><span class="fineprint">${childAddress.toString()}</span></td><td class="balance-cell"><div class="balance-inner">???</div></td>`;
            table.appendChild(childRow);
        }

        currentIndex += 5;

        // Add click event listeners to balance cells
        const balanceCells = table.querySelectorAll('.balance-cell');
        balanceCells.forEach(cell => {
            cell.addEventListener('click', async function() {
                const address = this.parentElement.cells[1].textContent.trim();
                await updateBalanceForCell(this, address);
            });
        });
    }

    async function refreshUTXOBalances(table) {
        const rows = table.getElementsByTagName('tr');
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progressBarFill = document.createElement('div');
        progressBarFill.className = 'progress-bar-fill';
        progressBar.appendChild(progressBarFill);
        target.secure(progressBar);

        for (let i = 1; i < rows.length; i++) { // Skip the header row
            const addressCell = rows[i].cells[1];
            const balanceCell = rows[i].cells[2];
            const address = addressCell.textContent.trim();

            await updateBalanceForCell(balanceCell, address);
            progressBarFill.style.width = `${((i / (rows.length - 1)) * 100).toFixed(2)}%`;

            // Delay for 1.5 seconds between requests
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

    initial();
}
