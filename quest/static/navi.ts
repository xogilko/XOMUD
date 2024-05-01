document.addEventListener('DOMContentLoaded', () => { /* phone home */ 
});

interface S {
    sign: string;                       
    domset: number;                     //dom element counter
    proc: any[];                        //navi session call log
    cache: any[];                       //active state index
    rom: { [key: string]: Function };   //activated functions
    dir: {                              //local repository
        [key: string]: {
            uri: string;
            urns: string;
            kind: string;
            name: string;
            child?: string;
            media: string;
        } 
    };        
    aux: any[];                         //supplementary doc index
}

const navi = function(lain: S, ...rest: string[]) {
    console.log("✩ navi called ✩", arguments);   
    const eiri = (lain: S, input: S['dir'][string], ...rest: string[]) => {
        const initInterpreter = (interpreter: S['dir'][string]) => {
            try {
                eval(interpreter.media);
                lain.cache.push(interpreter);
                console.log(`${interpreter.urns} initialized`);
            } catch (error) {
                console.log(`Failed to initialize: ${interpreter.urns}`, error);
            }
        };
        const interprate = (input: S['dir'][string]) => {
            console.log("Interpreting", input.name);

            let handler_origin = lain.cache.find(obj => obj.kind === "interpreter" && obj.urns === input.urns).media;
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
                    console.log(`Can't find function: ${input.kind} in handler: ${handler}`);
                }
            } else {
                console.log(`Can't find handler: ${handler}`);
            }
        }
        const canInterpret = lain.cache.some(obj => obj.kind === "interpreter" && obj.urns === input.urns);
        if (input.kind === "interpreter") {
            if (canInterpret) {
                console.log("Already mounted");
            } else {
                try {
                    initInterpreter(input);
                    console.log(`urns ${input.urns} mounted`);
                } catch (error) {
                    console.log(`Failed to mount urns ${input.urns}`, error);
                }
            }
        } else {
            if (!canInterpret) {
                console.log(`Interpreter for ${input.urns} not found. Attempting to mount...`);
                try {
                    let interpreter = lain.dir.xotestkit_in; // Simulate fetching urns interpreter
                    initInterpreter(interpreter);
                    console.log(`Interpreter for urns ${input.urns} mounted`);
                } catch (error) {
                    console.log(`Failed to mount interpreter for urns ${input.urns}`, error);
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
    try{
        const evaluatedArgs = rest.map(arg => eval(arg));
        eiri(lain, ...(evaluatedArgs as [any]));
        lain.proc.push(...rest);
    }
    catch(error){
        console.log('navi has failed', error)
    }
    return { lain };
};

function chisa(msg?: string): void {
    // initialization logic here
    // set check (window, xdm, http) skeleton etc
    // detect context and phone home
    var domain = window.location.hostname;
    const bodyData = {
        domain: domain,
        msg: msg || ''
    };
    console.log(bodyData, "requesting service ✩");
    const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(bodyData)
      };
    fetch('/dir_spawn/', requestOptions)
    .then(response => {
    if (!response.ok) {
        throw new Error('phone isnt working ok');
    }
        return response.text();
    })
    .then(moduleResponse => {
        eval(moduleResponse);
    })
    .catch(error => {
        console.error('failed to spawn dir:', error);
    });
}

const alice: S = {
    sign: 'xo',
    domset: 0,
    proc: [],
    cache: [],
    rom: {},
    dir: {},
    aux: []
};

chisa();


/* QUEST */

/*  sse that feeds dir dynamically server-> navi
    chisa should decide to request /testkit/ to send the dir
*/
/* demoproc check if a skeleton is there? default? if not then demo_proc?
   idk figure that shit out how does it know what skeleton to use at startup
   wallet preferences ? local storage masterkey?
*/
/* window that takes html and saves it to dir
    would be nice to edit procs / modify directly exports
    not a priority
*/
/* track dependency funcs?
    not a priority
*/
/* padlock -
    protect localstorage via a process and closure from eval() manipulation:
    need to make sure the keystoWatch variable is protected, whether it be static or thru some other magic    
    move it into dir
*/
/* add a service worker to reroute /command/ to 8081 etc
a function that recieves responses that accepts objects to dir or docs to aux
not a priority
*/