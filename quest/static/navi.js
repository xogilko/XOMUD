const navi = async function (lain, ...rest) {
    console.log("✩ navi called ✩", arguments);
    const eiri = (lain, input, ...rest) => {
        const initInterpreter = (interpreter) => {
            try {
                eval(interpreter.media);
                lain.cache.push(interpreter);
                console.log(`${interpreter.urns} initialized`);
            }
            catch (error) {
                console.log(`Failed to initialize: ${interpreter.urns}`, error);
            }
        };
        const interprate = (input) => {
            console.log("Interpreting", input.name);
            let handler_origin = lain.cache.find(obj => obj.kind === "interpreter" && obj.urns === input.urns).media;
            let handler_match = handler_origin.match(/(\S+?)\s*=\s*{/);
            if (!handler_match) {
                console.log(`Can't find handler obj name`);
                return;
            }
            const handler = eval(handler_match[1]);
            if (handler && typeof [handler] === "object" && handler != null) {
                const functionHandler = handler[input.kind];
                if (typeof functionHandler === "function") {
                    try {
                        functionHandler(input, ...rest);
                        console.log(`${input.name} handled`);
                    }
                    catch (error) {
                        console.log(`Failed to interpret ${input.name}`, error);
                    }
                }
                else {
                    console.log(`Can't find function: ${input.kind} in handler: ${handler}`);
                }
            }
            else {
                console.log(`Can't find handler: ${handler}`);
            }
        };
        const canInterpret = lain.cache.some(obj => obj.kind === "interpreter" && obj.urns === input.urns);
        if (input.kind === "interpreter") {
            if (canInterpret) {
                console.log("Already mounted");
            }
            else {
                try {
                    initInterpreter(input);
                    console.log(`${input.urns} interpreter mounted`);
                }
                catch (error) {
                    console.log(`Failed to mount ${input.urns} interpreter`, error);
                }
            }
        }
        else {
            if (!canInterpret) {
                console.log(`Interpreter for ${input.urns} not found. Attempting to mount...`);
                try {
                    let interpreter = Object.values(lain.dvr).find(d => d.urns === input.urns && d.kind === 'interpreter');
                    if (!interpreter) {
                        throw new Error(`Interpreter for ${input.urns} not found`);
                    }
                    initInterpreter(interpreter);
                    console.log(`Interpreter for urns ${input.urns} mounted`);
                }
                catch (error) {
                    console.log(`Failed to mount interpreter for urns ${input.urns}`, error);
                    return;
                }
            }
            try {
                interprate(input);
            }
            catch (error) {
                console.log(`Failed to interpret ${input.name}`, error);
            }
        }
    };
    try {
        const evaluatedArgs = rest.map(arg => eval(arg));
        if (!(evaluatedArgs.length > 0 && typeof evaluatedArgs[0] === 'string' && evaluatedArgs[0] === "specialCondition")) {
            eiri(lain, ...evaluatedArgs);
        }
        lain.proc.push(rest);
    }
    catch (error) {
        console.log('navi error: ', error);
    }
    return { lain };
};
function chisa() {
    const meta = {};
    Array.from(document.getElementsByTagName('meta')).forEach(tag => {
        Array.from(tag.attributes).forEach(attr => {
            meta[attr.name] = attr.value;
        });
    });
    if (!meta['portal']) {
        console.error('navi has no portal key');
        return;
    }
    else {
        alice.portal = meta['portal'];
        alice.chan = meta['chan'];
    }
    const bodyData = {
        client: {
            href: window.location.href,
            aux: Array.from(document.querySelectorAll('meta[aux]')).map(tag => tag.getAttribute('aux')),
        }
    };
    console.log(bodyData, "requesting service ✩");
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(bodyData)
    };
    fetch(alice.portal + '/quest/dvrbox/', requestOptions)
        .then(response => {
        if (!response.ok) {
            throw new Error('no response');
        }
        return response.json();
    })
        .then((urls) => {
        urls.forEach((url) => {
            fetch(alice.portal + url, requestOptions)
                .then(modResponse => {
                if (!modResponse.ok) {
                    throw new Error(`Failed to load module ${url}`);
                }
                return modResponse.text();
            })
                .then(moduleScript => {
                eval(moduleScript);
            })
                .catch(error => {
                console.error('Error loading module:', error);
            });
        });
    })
        .catch(error => {
        console.error('failed download to dvr:', error);
    });
}
const alice = {
    sign: 'xo',
    portal: '',
    chan: '',
    subs: {},
    domset: 0,
    proc: [],
    cache: [],
    rom: {},
    dvr: {}
};
document.addEventListener('DOMContentLoaded', function () { chisa(); });
