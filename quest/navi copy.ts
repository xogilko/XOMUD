interface S {
    profile: {[key: string]: any};          //user information miscellaneous
    portal: string;                         //broadcast network gateway url
    chan: string;                           //broadcast DOM document            
    domset: number;                         //dom element caching counter
    proc: any[];                            //navi() arguments catalog
    cache: any[];                           //active program index
    rom: { [key: string]: Function };       //activated functions
    dvr: {                                  //dynamic virtual registry
        [key: string]: {                    //abstract resource template
            uri: string;                    //unique template identifier
            aux: string;                    //template namespace
            kind: string;                   //resource interpreting type
            name: string;                   //resource name for reference
            child?: string;                 //contingent abstract template
            count?: number;                 //cache instance max limit
            media?: string;                 //template resource data
            init?: string;                  //target template for interpreting
            registry?: string[];            //meta template contingent array
            receipt?: {[key: string]: {     //resource access via network httxid
                fee: string;
                subfee: string;
            }};
        }
    };
}

const alice = Object.freeze((() => { 
    const lain: S = {
        profile: { 
            'sign': 'xo',
            'miho': ['protocol', 'navi']
        },
        portal: '',
        chan: '',
        domset: 0,
        proc: [],
        cache: [],
        rom: {},
        dvr: {}
    };

    const getCaller = () => {
        try {
            const stack = new Error().stack || '';
            let debugInfo = '=== Stack Analysis ===\n';
            debugInfo += 'Full stack trace:\n' + stack + '\n\n';
            
            // Initial page load check
            if (stack.includes('HTMLDocument.<anonymous>') && document.readyState !== 'complete') {
                debugInfo += 'Found initial page load event\n';
                console.log(debugInfo);
                alert(debugInfo);

                return 'protocol';
            }
    
            // Check for eval contexts from navi
            if (stack.includes('eval at initInterpreter') && stack.includes('navi.js')) {
                debugInfo += 'Found navi interpreter context\n';
                console.log(debugInfo);
                alert(debugInfo);
                return 'navi';
            }
    
            const callerPatterns = [
                /(\w+)<@/,                    // Firefox format
                /(\w+)@/,                     // Safari format
                /at\s+(\w+)\s+\(/,           // Chrome/Edge format
                /at\s+(\w+)</,               // Another variant
                /at\s+(\w+)(?=\s|$)/,        // More general 'at' format
                /at\s+Object\.(\w+)\s+\(/,   // Object method format
                /at\s+HTMLDocument\.(\w+)\s+\(/  // Event listener format
            ];
    
            const stackLines = stack.split('\n').slice(1);
            debugInfo += 'Checking lines:\n' + stackLines.join('\n') + '\n\n';
    
            for (const line of stackLines) {
                debugInfo += 'Checking line: ' + line + '\n';
                for (const pattern of callerPatterns) {
                    const match = line.match(pattern);
                    if (match) {
                        debugInfo += `Pattern match: ${pattern} -> ${match[1]}\n`;
                        if (lain.profile['miho'].includes(match[1])) {
                            debugInfo += `Found trusted caller: ${match[1]}\n`;
                            console.log(debugInfo);
                            alert(debugInfo);
                            return match[1];
                        }
                    }
                }
            }
            
            debugInfo += 'Could not identify caller\n';
            console.log(debugInfo);
            alert(debugInfo);
        } catch (e) {
            console.log('Stack trace parsing failed: ' + e);
            alert('Stack trace parsing failed: ' + e);
        }
        return null;
    };

    const yasuo = () => {
        const caller = getCaller();
        if (!caller) {
            console.warn('Could not identify caller');
            return false;
        }

        const isAuthorized = lain.profile['miho'].includes(caller);
        
        if (!isAuthorized) {
            console.warn(`Unauthorized access attempt from ${caller}`);
        }
        
        return isAuthorized;
    };

    return (inputLain?: S | string, email?: string) => {
        if (yasuo()) {
            if (typeof inputLain === 'object') {
                Object.assign(lain, inputLain);
            } else if (typeof inputLain === 'string') {
                email = inputLain;
            }
            
            if (email) lain.profile['miho'].push(email);
            return email ? { success: true } : lain;
        } else {
            console.error('Access denied');
            return email ? { success: false } : null;
        }
    };
})());
const navi = Object.freeze(Object.defineProperty(
    function navi(lain: S, ...rest: string[]) {
    console.log("✩ navi called ✩", arguments);
    lain = lain || alice() as S;
    if (!lain) {
        console.error('cant find lain!');
        return { success: false };
    }
    const eiri = (lain: S, input: S['dvr'][string], ...rest: string[]) => {
        const initInterpreter = (interpreter: S['dvr'][string]) => {
            try {
                eval(interpreter.media.replace(/\\n/g, '\n'));
                lain.cache.push(interpreter);
                console.log(`${interpreter.aux} onboard`);
            } catch (error) {
                console.log(`Failed to onboard: ${interpreter.aux}`, error);
            }
        };
        const interprate = (input: S['dvr'][string]) => {
            console.log("Interpreeting", input.name);

            let handler_origin = lain.cache.find(obj => obj.kind === "interpreter" && obj.aux === input.aux).media;
            let handler_match = handler_origin.match(/(\S+?)\s*=\s*{/);
            if (!handler_match) { console.log(`Can't find handler obj name`); return; }
            const handler = eval(handler_match[1]);
            if (handler && typeof [handler] === "object" && handler != null) {
                const functionHandler = handler[input.kind];
                if (typeof functionHandler === "function") {
                    try {
                        functionHandler(input, ...rest);
                        console.log(`${input.name} handled`);
                    } catch (error) {
                        console.log(`Failed to interpret ${input.name}`, error);
                    }
                } else {
                    console.log(`Can't find fooonction: ${input.kind} in handler: ${handler}`, JSON.stringify(handler));
                }
            } else {
                console.log(`Can't find handler: ${handler}`);
            }
        }
        const canInterpret = lain.cache.some(obj => obj.kind === "interpreter" && obj.aux === input.aux);
        console.log('can interpret:', input.name, canInterpret, lain.cache)
        if (input.kind === "interpreter") {
            if (canInterpret) {
                console.log("Already mounted");
            } else {
                try {
                    initInterpreter(input);
                    console.log(`${input.aux} interpreter mounted`);
                } catch (error) {
                    console.log(`Failed to mount ${input.aux} interpreter`, error);
                }
            }
        } else {
            if (!canInterpret) {
                console.log(`Interpreter for ${input.aux} not found. Attempting to mount...`);
                try {
                    let interpreter = Object.values(lain.dvr).find(d => d.aux === input.aux && d.kind === 'interpreter');
                    if (!interpreter) {
                        throw new Error(`Interpreter for ${input.aux} not found`);
                    }
                    initInterpreter(interpreter);
                    console.log(`Interpreter for aux ${input.aux} mounted`);
                } catch (error) {
                    console.log(`Failed to mount interpreter for aux ${input.aux}`, error);
                    return;
                }
            }
            try {
                interprate(input);
            } catch (error) {
                console.log(`Failed to interpret ${input.name}`, error);
            }
        }
    }
    try {
        const filteredRest = rest.filter(arg => arg !== '_ignore');
        console.log('Filtered rest:', filteredRest);

        const evaluatedArgs = filteredRest.map(arg => eval(arg));
        console.log('Evaluated args:', evaluatedArgs);

        if (evaluatedArgs.length > 0) {
            console.log('Branch 1: evaluatedArgs is non-empty and first element is a string');
            eiri(lain, ...evaluatedArgs as [any]);
            if (!rest.includes('_ignore')) {
                console.log('Branch 1.1: rest does not include "_ignore"');
                lain.proc.push(rest);
            } else {
                console.log('Branch 1.2: rest includes "_ignore"');
            }
        }
    }
    catch(error){
        console.log('navi error: ', error)
    }
    return { success: true, };
},
'_identity',
{value: 'navi'}
));
const protocol = Object.freeze(Object.defineProperty(
    async function protocol() {
    Object.defineProperty(Error, 'prepareStackTrace', {
        configurable: false,
        writable: false,
        value: (Error as any).prepareStackTrace
    });
    console.log('"da wings of application state"')
    let lain = alice() as S;
    console.log('we got alice', lain)
    const meta = Array.from(document.getElementsByTagName('meta')).reduce((acc, tag) => {
        Array.from(tag.attributes).forEach(attr => {
            acc[attr.name] = attr.value;
        });
        return acc;
    }, {}); 
    if (!meta['portal']) {
        console.error('navi has no portal key');
        return;
    }
    async function onboard() {
        console.log("client requests init ✩");
        lain.portal = meta['portal'];
        lain.profile['starboard'] = [];
        const hahahahaha = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: new Date().toISOString() })
        };
        const response = await fetch(lain.portal + 'arch/port/', hahahahaha);
        if (response.ok) {
            const token = await response.text();
            try {
                lain.profile['entry-plug'] = JSON.parse(token);
                console.log('navi pilot locked! dae/time hash:', lain.profile['entry-plug']);
            } catch (error) {
                console.error('failed to parse token:', error);
                return;
            }
            await (navigator as any).serviceWorker.ready;
            (navigator as any).serviceWorker.controller?.postMessage({ type: 'TXENEHT', data: lain.profile['entry-plug'] });
        } else {
            console.error('error:', response.statusText);
        }
    }
    async function bootstrap() {
        return new Promise<void>((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = function (event) {
                if (event.data.data) {
                    Object.assign(lain, JSON.parse(event.data.data));
                    alice(lain);
                } else {
                    console.log('navi bootstrap failed, requesting init')
                    onboard();
                }
                resolve();
            };
            console.log('navi bootstrap requesting memory');
            (navigator as any).serviceWorker.controller.postMessage({ type: 'MEM_GET', data: { key:"lain", id: 1 }}, [messageChannel.port2]);
        });
    }
    async function preflight() {
        if ('serviceWorker' in navigator) {
            const registration = await (navigator as any).serviceWorker.ready;
            if (registration.active && (navigator as any).serviceWorker.controller) {
                await bootstrap();
            } else {
                await (navigator as any).serviceWorker.register('/service-worker.js', { scope: '/' });
                if (!(navigator as any).serviceWorker.controller) {
                    console.log('service worker is not controlling the page. reloading...');
                    window.location.reload();
                } else {
                    await bootstrap();
                }
            }
        } else {
            onboard();
        }
    }

    try {
        await preflight();
        lain.chan = meta['chan'];
        lain.profile['arch-config'] = { 'user-friendly': true, 'chan': lain.chan };
        lain.profile['airplane-mode'] = !navigator.onLine;
        if (lain.portal === meta['portal']) {
            lain.profile['starboard'];
            meta['aux'].split(',').forEach((aux: string) => {
                if (!lain.profile['starboard'].includes(aux.trim())) {
                    lain.profile['starboard'].push(aux.trim());
                }
            });
            chisa(lain);
        } else {
            console.error('portal mismatch');
        }
    } catch (error) {
        console.error('Error in preflight:', error);
    }
},
'_identity',
{value: 'protocol'}
));
const chisa = (lain: S): void => {
    function series() {
        Object.values(lain.dvr).forEach(value => {
            if (value.init) {
                navi(lain, `lain.dvr.${value.init}`, '_ignore');
            }
        });
    }
    const route = window.location.pathname.split('/')[1];
    if (route) {
        document.body.classList.add(`chan-${route}`);
    }
    if (!lain.profile['airplane-mode']) {
        let cc = [];

        // New interfaces for type safety
        interface Receipt {
            type: 'fee' | 'sub';
            txid: string;
        }

        interface CompositionPath {
            path: string;
            art?: string;
            receipts: Receipt[];
        }

        function collect(aux: string): string {
            const composition: CompositionPath = {
                path: aux,
                receipts: []
            };

            // Check for direct fee or subfee
            const auxItem = lain.dvr[aux];
            if (auxItem?.receipt) {
                if (auxItem.receipt.fee) {
                    composition.receipts.push({
                        type: 'fee',
                        txid: auxItem.receipt.fee
                    });
                } else if (auxItem.receipt.subfee) {
                    composition.receipts.push({
                        type: 'sub',
                        txid: auxItem.receipt.subfee
                    });
                    
                    // Check parent directories for fees
                    let parentAux = aux;
                    while (parentAux) {
                        parentAux = parentAux.split('/').slice(0, -1).join('/');
                        const parentItem = lain.dvr[parentAux];
                        
                        if (parentItem?.receipt?.fee) {
                            composition.receipts.push({
                                type: 'fee',
                                txid: parentItem.receipt.fee
                            });
                            break;
                        } else if (parentItem?.receipt?.subfee) {
                            composition.receipts.push({
                                type: 'sub',
                                txid: parentItem.receipt.subfee
                            });
                        }
                    }
                }
            }

            // Check for art-specific receipts
            const aux_meta = Object.values(lain.dvr).find(
                item => item.aux === aux && item.kind === "meta"
            );
            
            if (aux_meta?.registry) {
                aux_meta.registry.forEach(art => {
                    const artItem = lain.dvr[`${aux}/${art}`];
                    if (artItem?.receipt?.subfee) {
                        composition.art = art;
                        composition.receipts.push({
                            type: 'sub',
                            txid: artItem.receipt.subfee
                        });
                    }
                });
            }

            // Convert to query string
            const params = new URLSearchParams();
            params.set('path', composition.path);
            if (composition.art) {
                params.set('art', composition.art);
            }
            composition.receipts.forEach((receipt, index) => {
                params.set(`r${index}`, `${receipt.type}:${receipt.txid}`);
            });

            return params.toString();
        }

        lain.profile['starboard'].forEach((aux: string) => {
            let receipts = collect(aux);
            if (receipts) {
                cc.push(receipts);
            } else {
                cc.push(aux);
            }
        });
        const msg = {
            from: window.location.href,
            to: cc,
            config: lain.profile['arch-config'],
        };
        const email = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg)
        };
        console.log(msg, "navi requests art ✩");
        fetch(lain.portal + 'arch/dbs/', email)
            .then(response => {
            if (!response.ok) {
                throw new Error('no response');
            }
            return response.json();
        })
            .then(response => {
            Object.entries(response).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    lain.dvr[key] = value as S['dvr'][string];
                }
            });
            console.log("➜✉: art is cast into dvr!");
        })
            .catch(error => {
            console.error('dvr download error:', error);
        })
            .finally(series);
    }
    else {
        series();
    }
}
document.addEventListener('DOMContentLoaded', protocol);