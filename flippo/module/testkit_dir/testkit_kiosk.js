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
                console.log('getscriptpubkey', pubkey);
                const pubKeyHash = bsv.crypto.Hash.sha256ripemd160(pubkey.toBuffer()).toString('hex')
                console.log(pubKeyHash);
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
                            script: pubkey? pubkey && getScriptPubKey(pubkey).toString() : out.script
                        }));
                    })
                    .catch(error => {
                        console.error('Failed to fetch UTXOs:', error);
                        return []; // Return an empty array in case of error
                    });
            };

            const makeTX = async (inputUTXOaddress, inputUTXOpubkey, inputTargetAddr, spend, inputChangeAddr, inputPrivateKey, memo, confirm) => {
                return new Promise(async (resolve, reject) => {
                    try {
                        const utxos = await getUTXO(inputUTXOaddress, confirm, inputUTXOpubkey);
                        if (utxos.length > 0) {
                            let tx = new bsv.Transaction()
                                .from(utxos)
                                .to(inputTargetAddr, parseInt(spend, 10))
                                .addOutput(new bsv.Transaction.Output({
                                    script: bsv.Script.buildDataOut(memo),
                                    satoshis: 0
                                }))
                                .change(new bsv.Address.fromString(inputChangeAddr, 'testnet'))
                                .sign(new bsv.PrivateKey.fromString(inputPrivateKey, 'testnet'))
                                .serialize();
                            resolve(tx); // Resolve the promise with the transaction
                        } else {
                            throw new Error("No UTXOs found.");
                        }
                    } catch (error) {
                        console.error('Error in sendTX:', error);
                        reject(error); // Reject the promise if there's an error
                    }
                });
            };
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

            testkit_kiosk_keygen_button.addEventListener('click', function() {
                let generation;
                if (testkit_kiosk_keygen_derive.value == ''){
                    generation = genKey(testkit_kiosk_keygen_hdcheck.checked);
                } else {
                    generation = genKey(testkit_kiosk_keygen_hdcheck.checked, testkit_kiosk_keygen_derive.value);
                }
                testkit_kiosk_keygen_privKey.innerHTML = '<br>Private Key: ' + generation.gen_privateKey.toString();
                testkit_kiosk_keygen_pubKey.innerHTML = '<br>Public Key: ' + generation.gen_publicKey.toString();
                testkit_kiosk_keygen_pubAddr.innerHTML = '<br>Public Address: ' + generation.gen_pubAddress.toString();
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

            testkit_kiosk_TX_button.addEventListener('click', function() {
                makeTX(testkit_kiosk_inputForTX_utxo.value, testkit_kiosk_inputForTX_pubkey.value,
                    testkit_kiosk_inputForTX_target.value, testkit_kiosk_inputForTX_amount.value,
                    testkit_kiosk_inputForTX_change.value, testkit_kiosk_inputForTX_sign.value,
                    testkit_kiosk_inputForTX_memo.value, testkit_kiosk_inputForTX_confirm.checked).then(xo => {
                        let tx = xo;
                        console.log('will broadcast:', tx)
                        broadcast(tx).then(bres => {
                            testkit_kiosk_TX_ID.innerHTML = "txid: " + bres.toString();
                            // You can use bres here as needed
                        }).catch(error => {
                            console.error('error broadcasting tx:', error);
                            testkit_kiosk_TX_ID.innerHTML = "error broadcasting tx";
                        });;
                    });
            });
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