export function activate_module(lain) {
    let targetElement = document.getElementById("testkit_kiosk");
    if (!targetElement) {
        console.error('kiosk element not found');
    }
    else {
        function waitforBSV() {
            if (typeof window.bsv === 'undefined') {
                console.log("kiosk searching for BSV...");
                setTimeout(waitforBSV, 100); // Check every 100ms
            } else {
                console.log("kiosk found BSV");
                lain.rom.testkit_kiosk();
            }
        }
        lain.rom.testkit_kiosk= () => {
            console.log('kiosk is open');
            
            const genKey = (hd, derive = '') => { 
                let randomIndex = Math.floor(Math.random() * 1000000);
                if (derive == ''){
                    if (hd == false){ //fresh normal keys
                        let gen_privateKey = new bsv.PrivateKey.fromRandom('testnet');
                        let gen_publicKey = new bsv.PublicKey.fromPrivateKey(gen_privateKey, 'testnet');
                        console.log(gen_privateKey.toString(), gen_publicKey.toString())
                        let gen_pubAddress = new bsv.Address.fromPublicKey(gen_publicKey, 'testnet'); //remove testnet()
                        return {
                            gen_privateKey,
                            gen_publicKey,
                            gen_pubAddress
                        }
                    } else { //fresh hd keys
                        let gen_privateKey = new bsv.HDPrivateKey.fromRandom('testnet');
                        let gen_publicKey = new bsv.HDPublicKey.fromHDPrivateKey(gen_privateKey, 'testnet');
                        console.log(gen_privateKey.toString(), gen_publicKey.toString())
                        let gen_pubAddress = new bsv.Address.fromPublicKey(gen_publicKey.publicKey, 'testnet');
                        return {
                            gen_privateKey,
                            gen_publicKey,
                            gen_pubAddress
                        }
                    }
                } 
                else { 
                    if (hd == false){ //derive normal keys
                        let derivekey = new bsv.HDPrivateKey.fromString(derive);
                        let childKey = derivekey.deriveChild(`m/0'/0/${randomIndex}`);
                        let gen_privateKey = childKey.privateKey;
                        let gen_publicKey = childKey.publicKey;
                        console.log(gen_privateKey.toString(), gen_publicKey.toString())
                        let gen_pubAddress = new bsv.Address.fromPublicKey(gen_publicKey, 'testnet');
                        return {
                            gen_privateKey,
                            gen_publicKey,
                            gen_pubAddress
                        }

                    } else { //derive hd keys
                        let derivekey = new bsv.HDPrivateKey.fromString(derive);
                        let gen_privateKey = derivekey.deriveChild(`m/0'/0/${randomIndex}`);
                        let gen_publicKey = new bsv.HDPublicKey.fromHDPrivateKey(gen_privateKey, 'testnet');
                        let gen_pubAddress = new bsv.Address.fromPublicKey(gen_publicKey.publicKey, 'testnet');
                        return {
                            gen_privateKey,
                            gen_publicKey,
                            gen_pubAddress
                        }
                    }
                }
            }

            const getScriptPubKey = (pubkey) => {
                const pubKeyHash = bsv.crypto.Hash.sha256ripemd160(pubkey.toBuffer()).toString('hex')
                console.log('pkh:', pubKeyHash);
                return bsv.Script.fromASM(`OP_DUP OP_HASH160 ${pubKeyHash} OP_EQUALVERIFY OP_CHECKSIG`)
            }

            const getUTXO = async(address, confirm, inputPubkey = null) => {
                let lookup = `https://api.whatsonchain.com/v1/bsv/test/address/${address}`;
                if (confirm = true){
                    lookup += '/confirmed/unspent';
                } else {
                    lookup += '/unconfirmed/unspent';
                }
                let pubkey = null;
                if (inputPubkey != null){
                    try{pubkey = new bsv.PublicKey.fromString(inputPubkey); console.log(pubkey);}
                    catch(error){console.log('pubkey fail')}
                } else {
                    console.log('no pubkey');
                }
                return fetch(lookup)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
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
                        return []; // Return an empty array in case of error
                    });
            }

            const fireTX = async (inputUTXOaddress, inputUTXOpubkey, confirm, inputTargetAddr = null, spend, inputChangeAddr, inputPrivateKey, scriptType, script, script2 = null) => {
                return new Promise(async (resolve, reject) => {
                    try {
                        const utxos = await getUTXO(inputUTXOaddress, confirm, inputUTXOpubkey);
                        if (utxos.length > 0) {
                            let tx = new bsv.Transaction()
                                .from(utxos)
                                if (scriptType === 'satalite') {//satalite currently p2pkh ordinal
                                    const newAddress = new bsv.Address.fromPrivateKey(new bsv.PrivateKey.fromRandom('testnet'), 'testnet');
                                    const lockingScript = bsv.Script.buildPublicKeyHashOut(newAddress).toASM();
                                    const customScript = `${lockingScript} OP_FALSE OP_IF 6f7264 OP_TRUE 746578742f706c61696e OP_FALSE ${bsv.deps.Buffer.from(script).toString('hex')} OP_ENDIF`;
                                    tx.addOutput(new bsv.Transaction.Output({
                                        script: bsv.Script.fromASM(customScript),
                                        satoshis: 1 
                                    }));
                                } else if (scriptType === 'ordtxtpkh') {//p2pkh ordinal
                                    const lockingScript = bsv.Script.buildPublicKeyHashOut(new bsv.Address.fromString(inputTargetAddr, 'testnet')).toASM();
                                    const customScript = `${lockingScript} OP_FALSE OP_IF 6f7264 OP_TRUE 746578742f706c61696e OP_FALSE ${bsv.deps.Buffer.from(script).toString('hex')} OP_ENDIF`;
                                    tx.addOutput(new bsv.Transaction.Output({
                                        script: bsv.Script.fromASM(customScript),
                                        satoshis: parseInt(spend, 10)
                                    }));
                                } else if (scriptType === 'ordtxtcustom') { // old: const fullScript = `${addressScript} ${script}`;
                                    const customScript = `${script2} OP_FALSE OP_IF 6f7264 OP_TRUE 746578742f706c61696e OP_FALSE ${bsv.deps.Buffer.from(script).toString('hex')} OP_ENDIF`;
                                    tx.addOutput(new bsv.Transaction.Output({
                                        script: bsv.Script.fromASM(customScript),
                                        satoshis: parseInt(spend, 10),
                                        address: new bsv.Address.fromString(inputTargetAddr, 'testnet')
                                    }));
                                } else if (scriptType === 'asm') { // old: const fullScript = `${addressScript} ${script}`;
                                    tx.addOutput(new bsv.Transaction.Output({
                                        script: bsv.Script.fromASM(script),
                                        satoshis: parseInt(spend, 10),
                                        address: new bsv.Address.fromString(inputTargetAddr, 'testnet')
                                    }));
                                }
                                tx.change(new bsv.Address.fromString(inputChangeAddr, 'testnet'))
                                .sign(new bsv.PrivateKey.fromString(inputPrivateKey, 'testnet'))
                                .serialize();
                            resolve(tx); // Resolve the promise with the transaction
                        } else {
                            throw new Error("No UTXOs found.");
                        }
                    } catch (error) {
                        console.error('Error in fireTX:', error);
                        reject(error); // Reject the promise if there's an error
                    }
                });
            }

            const broadcast = async (tx) => {
                const b = await fetch('https://api.whatsonchain.com/v1/bsv/test/tx/raw' , {
                    method: 'post',
                    body: JSON.stringify({
                        'txhex': tx.toString()
                    })
                })
                const bres = await b.json();
                console.log('broadcasted tx', bres);
                return bres;
            }

            /*testkit_inputForTX_script_select.addEventListener('change', function() {
                var inputField = document.getElementById('testkit_kiosk_inputForTX_script');
                if (this.value === 'asm') {
                    inputField.placeholder = 'asm';
                } else {
                    inputField.placeholder = 'memo';
                }
            });*/
            testkit_inputForTX_lock_select.addEventListener('change', function() {
                if (this.value === 'satalite') {
                    testkit_lock_inputfield.innerHTML = '<br><textarea id="testkit_kiosk_inputForTX_lock" name="lockvalue" rows="1" cols="44" placeholder="memo"></textarea>';
                } else if (this.value === 'asm') {
                    testkit_lock_inputfield.innerHTML = '<input type = "text" id = "testkit_kiosk_inputForTX_target" placeholder = "target address"><br><textarea id="testkit_kiosk_inputForTX_lock" name="lockvalue" rows="1" cols="44" placeholder="locking script"></textarea>';
                } else if (this.value === 'ordtxtpkh') { 
                    testkit_lock_inputfield.innerHTML = '<input type = "text" id = "testkit_kiosk_inputForTX_target" placeholder = "target address"><br><textarea id="testkit_kiosk_inputForTX_lock" name="lockvalue" rows="1" cols="44" placeholder="memo"></textarea>';
                } else if (this.value === 'ordtxtcustom') { 
                    testkit_lock_inputfield.innerHTML = '<input type = "text" id = "testkit_kiosk_inputForTX_target" placeholder = "target address"><br><textarea id="testkit_kiosk_inputForTX_lock" name="lockvalue" rows="1" cols="22" placeholder="memo"></textarea><textarea id="testkit_kiosk_inputForTX_lock2" name="lockvalue2" rows="1" cols="22" placeholder="locking script"></textarea>';
                }
            });

            testkit_kiosk_keygen_button.addEventListener('click', function() {
                let generation;
                if (testkit_kiosk_keygen_derive.value == ''){
                    generation = genKey(testkit_kiosk_keygen_hdcheck.checked);
                } else {
                    generation = genKey(testkit_kiosk_keygen_hdcheck.checked, testkit_kiosk_keygen_derive.value);
                }
                testkit_kiosk_keygen_privKey.innerHTML = '<br>Private Key: <span class="fineprint">' + generation.gen_privateKey.toString() + '</span>';
                testkit_kiosk_keygen_pubKey.innerHTML = '<br>Public Key: <span class="fineprint">' + generation.gen_publicKey.toString() + '</span>';
                testkit_kiosk_keygen_pubAddr.innerHTML = '<br>Public Address: <span class="fineprint">' + generation.gen_pubAddress.toString() + '</span>';
            });
            testkit_kiosk_getUTXO_button.addEventListener('click', function() {
                getUTXO(testkit_kiosk_inputKeyForUTXO.value, testkit_kiosk_confirmForUTXO.checked).then(xo => {
                    let utxos = xo;
                    console.log('if u wanted to know,', utxos);
                    if (utxos.length > 0) {
                    console.log(utxos);
                    let totalValue = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
                    testkit_kiosk_UTXO_total.innerHTML = '<br>total: ' + totalValue.toString() + '⌀';
                    } else {
                        document.getElementById('testkit_kiosk_UTXO_total').innerHTML = 'no record';
                    }
                }).catch(error => {
                    console.error('Error fetching UTXOs:', error);
                });
            });
            testkit_kiosk_fireTX_button.addEventListener('click', function() {
                //could add logic for script_select constructions
                fireTX(testkit_kiosk_inputForTX_utxo.value, testkit_kiosk_inputForTX_pubkey.value,
                    testkit_kiosk_inputForTX_confirm.checked,
                    typeof testkit_kiosk_inputForTX_target !== 'undefined' ? testkit_kiosk_inputForTX_target.value : undefined,
                    testkit_kiosk_inputForTX_amount.value, testkit_kiosk_inputForTX_change.value,
                    testkit_kiosk_inputForTX_sign.value, testkit_inputForTX_lock_select.value,
                    testkit_kiosk_inputForTX_lock.value,
                    typeof testkit_kiosk_inputForTX_lock2 !== 'undefined' ? testkit_kiosk_inputForTX_lock2.value : undefined
                    ).then(xo => {
                        let tx = xo;
                        console.log('will broadcast:', tx)
                        broadcast(tx).then(bres => {
                            testkit_kiosk_TX_ID.innerHTML = 'txid: <span class="fineprint">' + bres.toString() + '</span>';
                            // You can use bres here as needed
                        }).catch(error => {
                            console.error('error broadcasting tx:', error);
                            testkit_kiosk_TX_ID.innerHTML = "error broadcasting tx";
                        });;
                    });
            });

            return {
                genKey,
                getScriptPubKey,
                getUTXO,
                fireTX
            };
        }
        waitforBSV();
    }
}
/*
    pending hierarhical keys

    1DsZT1jYEZG7XAv9rUwLKUwpbGgbPHNZMV
    Can also do testnet:
    const address = Address.Testnet()
*/