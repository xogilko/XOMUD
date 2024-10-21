export async function activate_module(lain) {
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
            color: red;
            animation: colorTransitionSuccess 5s forwards;
        }
        @keyframes colorTransitionSuccess {
            from { color: red; }
            to { color: blue; }
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

    async function keySecured(email, password) {
        privkey_info.innerHTML = `<b><i>credentials secured🔑</i></b><br>`;
        keychain_active.innerHTML = `Processing...`;

        try {
            // Assume the email is the private key and password is the UTXO address
            mainPrivateKey = new bsv.PrivateKey.fromWIF(email);
            const pubkey = mainPrivateKey.publicKey;
            const utxos = await getUTXO(password, pubkey);
            privkey_info.innerHTML = `<b><i>credentials secured🔑</i></b><br>`;
            let totalValue = utxos.reduce((acc, utxo) => acc + utxo.value, 0);

            // Create a table to display the main address and its UTXO balance
            const table = document.createElement('table');
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `<th></th><th>Address</th><th>UTXO</th>`;
            table.appendChild(headerRow);

            const mainRow = document.createElement('tr');
            mainRow.innerHTML = `<td>🔑</td><td><span class="fineprint">${password}</span></td><td class="balance-cell"><div class="balance-inner">???</div></td>`;
            table.appendChild(mainRow);

            target.secure(table);

            // Create a button to generate child keys
            const generateKeysButton = document.createElement('button');
            generateKeysButton.innerText = 'Generate Child Keys';
            generateKeysButton.addEventListener('click', function() {
                generateChildKeys(email, table);
            });
            target.secure(generateKeysButton);

            // Create a button to refresh UTXO balances
            const refreshButton = document.createElement('button');
            refreshButton.innerText = 'Refresh UTXO Balances';
            refreshButton.addEventListener('click', function() {
                refreshUTXOBalances(table);
            });
            target.secure(refreshButton);

            // Create input and button for splitting UTXO
            const satoshiInput = document.createElement('input');
            satoshiInput.type = 'number';
            satoshiInput.placeholder = 'Enter satoshis';
            satoshiInput.style.width = '50px'; // Set the width to 50px
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

                const targetAddresses = Array.from(table.getElementsByTagName('tr')).slice(1).map(row => row.cells[1].textContent.trim());
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

        } catch (error) {
            console.error('Error during processing:', error);
            privkey_info.remove();
            keychain_active.innerText = 'An error occurred during processing';
            initial();
        }
    }

    function generateChildKeys(privateKeyWIF, table) {
        let hdPrivateKey;
        try {
            // Try to create an HDPrivateKey directly
            hdPrivateKey = new bsv.HDPrivateKey.fromString(privateKeyWIF);
        } catch (e) {
            // If it fails, convert a normal private key to an HDPrivateKey
            const privateKey = new bsv.PrivateKey.fromWIF(privateKeyWIF);
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
            childRow.innerHTML = `<td><b>${i + 1}</b></td><td><span class="fineprint">${childAddress.toString()}</span></td><td class="balance-cell"><div class="balance-inner">???</div></td>`;
            table.appendChild(childRow);
        }

        currentIndex += 5; // Increment the index for the next batch of addresses

        // Add click event listeners to balance cells
        const balanceCells = table.querySelectorAll('.balance-cell');
        balanceCells.forEach(cell => {
            cell.addEventListener('click', function() {
                const address = this.parentElement.cells[1].textContent.trim();
                updateBalanceForCell(this, address);
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

    function UserPhraseInput() {
        privkey_info.innerHTML = `<b><i>Enter your credentials🔑</i></b><br>`;
        target.secure(privkey_info);
        introtext.remove();
        loginbutton.remove();
        keychain_active.id = 'keychain_active';
        const keychain_form = document.createElement('form');
        keychain_form.id = 'keychain_form';

        const email_input = document.createElement('input');
        email_input.type = 'text';  // Changed from 'email' to 'text'
        email_input.id = 'email_input';
        email_input.name = 'email';  // Keep the name attribute for autofill
        email_input.placeholder = 'enter email';
        email_input.required = true;

        const password_input = document.createElement('input');
        password_input.type = 'password';
        password_input.id = 'password_input';
        password_input.name = 'password';  // Keep the name attribute for autofill
        password_input.placeholder = 'enter password';
        password_input.required = true;

        const submit_button = document.createElement('button');
        submit_button.type = 'submit';
        submit_button.innerText = 'Submit';

        keychain_form.appendChild(email_input);
        keychain_form.appendChild(password_input);
        keychain_form.appendChild(submit_button);

        keychain_form.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = email_input.value;
            const password = password_input.value;
            keySecured(email, password);
        });

        target.secure(keychain_form);
    }

    function initial() {
        introtext.innerHTML = "<b>custodial auto-sign 🔑</b><br><i>protected via shadow dom</i><br>";
        loginbutton.innerText = 'submit credentials';
        loginbutton.addEventListener('click', function() {
            UserPhraseInput();
        });
        target.secure(introtext);
        target.secure(loginbutton);
    }
    initial();
}