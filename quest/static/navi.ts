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
const alice = (() => { 
    const lain: S = {
        profile: { 'sign': 'xo' },
        portal: '',
        chan: '',
        domset: 0,
        proc: [],
        cache: [],
        rom: {},
        dvr: {}
    };
    lain.profile['miho'] = ['protocol', 'navi'];
    const yasuo = () => {
        //normally, yasuo checks the stack to carefully guard lain, but not todae
        return true;
    };

    return (inputLain?: S | string, email?: string) => {
        if (yasuo()) {
            if (typeof inputLain === 'object') {
                // If inputLain is an object, assign it to lain
                Object.assign(lain, inputLain);
            } else if (typeof inputLain === 'string') {
                // If inputLain is a string, treat it as an email
                email = inputLain;
            }
            
            if (email) lain.profile['miho'].push(email);
            return email ? { success: true } : lain;
        } else {
            console.error('Access denied');
            return email ? { success: false } : null;
        }
    };
})();
const navi = function(lain: S, ...rest: string[]) {
    console.log("✩ navi called ✩", arguments);   
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
                console.log('u caught the snake')
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
    return { lain };
};
const protocol = async function () {
    console.log('"da wings of application state"')
    let lain = alice() as S;
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
        console.log(lain,"client requests init ✩");
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
                    console.log('navi bootstrap parsing:', lain, event.data);
                    lain = JSON.parse(event.data.data);
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
};
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
        function collect(aux: string): string {
            let receipts = [];
            let hasDirectFee = false;            
            let receipt = lain.dvr[aux]?.receipt?.fee;
            if (receipt) {
                receipts.push(`${aux};fee;${receipt}`);
                hasDirectFee = true;
            } else {
                receipt = lain.dvr[aux]?.receipt?.subfee;
                if (receipt) {
                    receipts.push(`${aux};sub;${receipt}`);
                    let parentAux = aux;
                    while (parentAux) {
                        parentAux = parentAux.split('/').slice(0, -1).join('/');
                        let parentReceipt = lain.dvr[parentAux]?.receipt?.fee;
                        if (parentReceipt) {
                            receipts.push(`${parentAux};fee;${parentReceipt}`);
                            hasDirectFee = true;
                            break;
                        } else {
                            parentReceipt = lain.dvr[parentAux]?.receipt?.subfee;
                            if (parentReceipt) {
                                receipts.push(`${parentAux};sub;${parentReceipt}`);
                            } else {
                                break;
                            }
                        }
                    }
                }
            }
            const aux_meta = Object.values(lain.dvr).find(item => item.aux === aux && item.kind === "meta");
            if (aux_meta) {
                aux_meta.registry.forEach(art => {
                    let artReceipt = lain.dvr[`${aux}/${art}`]?.receipt?.subfee;
                    if (artReceipt) {
                        receipts.push(`${aux}:&:${art};sub;${artReceipt}`);
                    }
                });
            }

            if (!hasDirectFee) {
                receipts.push(`${aux}`);
            }
            return receipts.join(';;');
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
            console.log("➜✉: art is cast into dvr!", lain);
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