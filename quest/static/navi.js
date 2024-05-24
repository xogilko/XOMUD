document.addEventListener('DOMContentLoaded', () => {
});
const navi = function (lain, ...rest) {
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
                    console.log(`urns ${input.urns} mounted`);
                }
                catch (error) {
                    console.log(`Failed to mount urns ${input.urns}`, error);
                }
            }
        }
        else {
            if (!canInterpret) {
                console.log(`Interpreter for ${input.urns} not found. Attempting to mount...`);
                try {
                    let interpreter = lain.dir.xotestkit_in; // Simulate fetching urns interpreter
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
        const specialCondition = "specialCondition";
        const evaluatedArgs = rest.map(arg => eval(arg));
        if (evaluatedArgs.length > 0 && typeof evaluatedArgs[0] === 'string' && evaluatedArgs[0] === specialCondition) {
            // a special request eiri doesn't need
            console.log('special', rest);
        }
        else {
            // Otherwise, proceed as normal
            eiri(lain, ...evaluatedArgs);
        }
        lain.proc.push(rest);
    }
    catch (error) {
        console.log('navi has failed', error);
    }
    return { lain };
};
function chisa(request) {
    if (request && request.msg) { //request.msg is the http path for module
        const req_headers = {
            'Content-Type': 'application/json',
        };
        if (request.headers) {
            Object.assign(req_headers, request.headers);
        }
        const bodyData = {
            ...request, // Spread other properties of request into the body
        };
        const requestOptions = {
            method: 'POST',
            headers: req_headers,
            body: JSON.stringify(bodyData)
        };
        fetch(alice.portal + request.msg, requestOptions)
            .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load module ${request.msg}`);
            }
            return response.text();
        })
            .then(moduleScript => {
            eval(moduleScript);
        })
            .catch(error => {
            console.error('Error loading module:', error);
        });
    }
    else { //when request.msg does not exist
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
        }
        const req_headers = {
            'Content-Type': 'application/json',
        };
        const bodyData = {
            client: {
                href: window.location.href,
                touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
                connection: navigator.connection ? navigator.connection.effectiveType : 'unknown',
                uri: Array.from(document.querySelectorAll('meta[uri]')).map(tag => tag.getAttribute('uri')),
            }
        };
        console.log(bodyData, "requesting service ✩");
        const requestOptions = {
            method: 'POST',
            headers: req_headers,
            body: JSON.stringify(bodyData)
        };
        fetch(alice.portal + '/quest/dirbox/', requestOptions)
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
            console.error('failed to collect dir:', error);
        });
    }
}
const alice = {
    sign: 'xo',
    portal: '',
    domset: 0,
    proc: [],
    cache: [],
    rom: {},
    dir: {}
};
document.addEventListener('DOMContentLoaded', function () { chisa(); });
