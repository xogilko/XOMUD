export function activate_module(lain) {

    const targetElement = document.getElementById('testkit_spotter');
    const spotterSignaller = document.createElement('div');
    const istreamAddress = lain.dvr['_dbs_meta']['chanAddress'];
    const currentPagePath = window.location.pathname.split('/').slice(1, 2)[0];
    
    const getUTXO = async(address, confirm, inputPubkey = null) => {
        console.log('Fetching UTXOs for address:', address, 'with confirmation:', confirm);
        let lookup = `https://api.whatsonchain.com/v1/bsv/test/address/${address}`;
        if (confirm) {
            lookup += '/confirmed/unspent';
        } else {
            lookup += '/unconfirmed/unspent';
        }
        console.log('Lookup URL:', lookup);

        let pubkey = null;
        if (inputPubkey != null) {
            try {
                pubkey = new bsv.PublicKey.fromString(inputPubkey);
                console.log('Public key:', pubkey);
            } catch (error) {
                console.log('Failed to parse public key:', error);
            }
        } else {
            console.log('No public key provided.');
        }

        return fetch(lookup)
            .then(response => response.json())
            .then(data => {
                console.log('UTXO data received:', data);
                if (!data || typeof data !== 'object' || !data.result) {
                    console.error('Unexpected data structure:', data);
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
    }
    
    const getTransaction = async(txid) => {
        console.log('Fetching transaction for txid:', txid);
        const lookup = `https://api.whatsonchain.com/v1/bsv/test/tx/${txid}`;
        return fetch(lookup)
            .then(response => response.json())
            .then(data => {
                console.log('Transaction data received:', data);
                if (!data || typeof data !== 'object') {
                    console.error('Unexpected data structure:', data);
                    return null;
                }
                return data;
            })
            .catch(error => {
                console.error('Failed to fetch transaction:', error);
                return null;
            });
    }
    
    const extractOpReturn = (transaction) => {
        console.log('Extracting OP_RETURN from transaction:', transaction.txid);
        const opReturnOutput = transaction.vout.find(output => {
            const scriptAsm = output.scriptPubKey.asm;
            return scriptAsm.startsWith('OP_RETURN');
        });
        if (opReturnOutput) {
            const opReturnData = opReturnOutput.scriptPubKey.asm.split(' ').slice(1).join('');
            console.log('OP_RETURN data (hex):', opReturnOutput, opReturnData);
            let hexString = [];
            if (opReturnData) {
                hexString = opReturnData.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
            } else {
                console.warn('OP_RETURN data is an empty string');
            }
            const textDecoder = new TextDecoder('utf-8');
            const decodedData = textDecoder.decode(new Uint8Array(hexString));
            console.log('Decoded OP_RETURN data (ASCII):', decodedData);
            return decodedData;
        }
        console.log('No OP_RETURN found in transaction:', transaction.txid);
        return null;
    }
    const getTransactionsWithOpReturn = async(utxos) => {
        console.log('Fetching transactions for UTXOs:', utxos);
        const transactions = await Promise.all(utxos.map(utxo => getTransaction(utxo.txid)));
        const transactionsWithOpReturn = transactions
            .filter(tx => tx !== null)
            .map(tx => ({
                txid: tx.txid,
                return: extractOpReturn(tx)
            }))
            .filter(tx => tx.return !== null);
        console.log('Transactions with OP_RETURN:', transactionsWithOpReturn);
        return transactionsWithOpReturn.sort((a, b) => a.time - b.time);
    }
    
    function initialize() {
        let transactionsWithOpReturn;
        let placed = [];
        const birdieButton = document.createElement('button');
        birdieButton.textContent = 'render vstream content';
        birdieButton.addEventListener('click', () => {
            console.log('Rendering vstream content');
            transactionsWithOpReturn.forEach(tx => {
                if (!placed.some(item => item.txid === tx.txid && item.return === tx.return)) {
                    let birdie = document.createElement('span');
                    birdie.setAttribute("httx", tx.txid);
                    birdie.innerHTML = tx.return;
                    console.log('Appending span with txid:', tx.txid, 'and content:', tx.return);
                    document.body.appendChild(birdie);
                    placed.push(tx);
                }
            });
        });
    
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'refresh istream';
        refreshButton.addEventListener('click', () => {
            console.log('Refreshing istream');
            spotterSignaller.innerHTML = ''; // Clear previous report
            getUTXO(istreamAddress, false).then(async(utxos) => {
                if (utxos.length > 0) {
                    transactionsWithOpReturn = await getTransactionsWithOpReturn(utxos);
                    console.log('Updated transactions with OP_RETURN:', transactionsWithOpReturn);
                    let totalValue = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
                    spotterSignaller.innerHTML += `<br> current channel ${currentPagePath} total: ` + totalValue.toString() + '⌀';
                    transactionsWithOpReturn.forEach(tx => {
                        spotterSignaller.innerHTML += `<br> <span class="fineprint">txid: ${tx.txid}</span>`;
                    });
                } else {
                    getUTXO(istreamAddress, true).then(async(utxos) => {
                        if (utxos.length > 0) {
                            transactionsWithOpReturn = await getTransactionsWithOpReturn(utxos);
                            console.log('Initial transactions with OP_RETURN:', transactionsWithOpReturn);
                            let totalValue = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
                            spotterSignaller.innerHTML += `<br> current channel ${currentPagePath} total: ` + totalValue.toString() + '⌀';
                            transactionsWithOpReturn.forEach(tx => {
                                spotterSignaller.innerHTML += `<br> <span class="fineprint">txid: ${tx.txid}</span>`;
                            });
                            targetElement.appendChild(refreshButton); // Add refresh button
                            targetElement.appendChild(birdieButton);  // Add render button
                        } else {
                            spotterSignaller.innerHTML += "<br>" + 'no record';
                        }
                    });
                }
            });
        });
    
        getUTXO(istreamAddress, false).then(async(utxos) => {
            if (utxos.length > 0) {
                transactionsWithOpReturn = await getTransactionsWithOpReturn(utxos);
                console.log('Initial transactions with OP_RETURN:', transactionsWithOpReturn);
                let totalValue = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
                spotterSignaller.innerHTML += `<br> current channel ${currentPagePath} total: ` + totalValue.toString() + '⌀';
                transactionsWithOpReturn.forEach(tx => {
                    spotterSignaller.innerHTML += `<br> <span class="fineprint">txid: ${tx.txid}</span>`;
                });
                targetElement.appendChild(refreshButton); // Add refresh button
                targetElement.appendChild(birdieButton);  // Add render button
            } else {
                getUTXO(istreamAddress, true).then(async(utxos) => {
                    if (utxos.length > 0) {
                        transactionsWithOpReturn = await getTransactionsWithOpReturn(utxos);
                        console.log('Initial transactions with OP_RETURN:', transactionsWithOpReturn);
                        let totalValue = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
                        spotterSignaller.innerHTML += `<br> current channel ${currentPagePath} total: ` + totalValue.toString() + '⌀';
                        transactionsWithOpReturn.forEach(tx => {
                            spotterSignaller.innerHTML += `<br> <span class="fineprint">txid: ${tx.txid}</span>`;
                        });
                        targetElement.appendChild(refreshButton); // Add refresh button
                        targetElement.appendChild(birdieButton);  // Add render button
                    } else {
                        spotterSignaller.innerHTML += "<br>" + 'no record';
                    }
                });
            }
        });
    }
    
    if (targetElement) {
        console.log('Target element found:', targetElement);
        spotterSignaller.id = 'spotter_signaller';
        targetElement.appendChild(spotterSignaller);
        spotterSignaller.innerHTML = 'Target element acquired.';
        initialize();
    } else {
        console.log('No target element for spotter found.');
    }
    
    }