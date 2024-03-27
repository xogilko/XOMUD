document.addEventListener('DOMContentLoaded', () => {
    cli_init(); drag_init(); 
});

//////* PENDING QUESTS *///////

/*

*/

/* LEGACY

    CONCEPT
        man/outline/manager
            import library vs place in dom
        dynamic identification based on origin
            if i swap in from a particular source it encloses programatically
    DRAGGABLE REPL
        htmx is dropping swoops if the server cant keep up. only reset stick on arrival
        find an alternative to timeout() for discoveing 1 ping of a request<?>
    DYNAMIC SCRIPT INIT
        make userscript manager observer
        dynamic element init
        syntax for script indexing
*/

/*//////   BLUEPRINT   ///////

<< RESOURCE >>        (( POLICY ))        [[ TARGET ]]

uniform interface   system that emerges from constraint where state 
                    is transfigured through the representation of hypermedia
hypermedia          media that produces intersecting patterns w/ explicit controls
hypermedia client   general interface that can interpret any hypermedia without context
                    the web browser is a hypermedia client that interprets via HTML

a schema-agnostic client may be extended out by proxy 
the web browser (DOM, XML) may be used as a temporary footstool

cascading selection constraints:
    domain (proxy policy/technical conditions)
    resource (digital rights management)
    client (user defined preferences)
    native (hardware/user-agent defaults)

SYNOPTIC WEB: mattdown, markup, lukewrite;
    ordinal inscriptions attest bits of data and notation
    bytes are addressed as index.utxo on the public ledger
    parallel controls point to address spans
    user queries overlay network with constraints
    proxy transfigures output using content-negotiation algorithms

Go4 STRATEGY + Fowler TRANSFORM VIEW
scripts may be cached and initialized in the browser real-time by proxy;
fetched http responses may be intercepted and dependencies pre-injected into the dom.

the market may be permitted to specialize:
    1) interface: userscripts, style, structures and applications
    2) daemon: compute, storage, middleware, constraints, and other faculties
    3) representor: interpretable namespaces and transformations for rendering

//////////HYPERMEDIA EXAMPLE CASE

    SYNOPTIC PRINCIPLE
    an ideal uniform distributed information system is agnostic towards its elements
    it uses abstraction and extensibility to pursue an unopinionated generic interface

    HYPERMEDIATRIX INTERCESSION
    by negotiating the mediation of a session against the state of a trusted proxy, latency is made equitable

    SURFER PARADOX
    in reality only movement is real and state is an illusion
    in virtuality only state is real and movement is an illusion

    RESTFUL POSTULATE
    its impossible to know where on the web anyone is
    we can only infer based on the actions that are made

    ALICE ZERO SUM{
        overlay network simpage
            for a grid of a room via scrypt
                then arrays of objects in simpage
                    passing around tx vs trust
                    u pass a tx to the overlay which inits a websocket

    }
    base content + 2 markup options
    overlay network + query
        user preferences
        custom schema
        representor
            ordfs
        custom css   
    put draggables in context
        wiki
            a series of pages
            text would be marked up with hyperlinks to other pages
        dropdown - based on inputs and events
            requires tom-select.js + plugins OR select2 based on user preference
                import a script and css
                generating unique IDs for element ids? vs classes?

*/

///// COMMAND LINE INTERFACE HANDLING

const swoop = () => {
    const scrollCli = document.getElementById('cli');
    scrollCli.scrollTop = scrollCli.scrollHeight;
    let cli_msg = document.getElementById('entry-message').value;
    bios(man, eval(cli_msg));
    setTimeout(() => { document.getElementById('entry-message').value = 'https://'; }, 0);
};

const cli_init = () => {
    var command = document.getElementById("command-feed");
    const stringArray = ["xotestkit_in = activate interpreter", "htmx_import = turn on htmx in js", "currently this immediately evals bios(man, input)", "ooo watch out"];
    stringArray.forEach(item => {
        command.insertAdjacentHTML('beforeend', `<li>${item}</li>`);
    });
}

///// DRAGGABLE FRAMES HANDLING

const drag_init = () => {
    
    const draggin = (e) => {
        const element = e.target;
        if (element.closest('.dragged_content')) return;

        e.preventDefault();
        const offsetX = e.clientX - element.getBoundingClientRect().left;
        const offsetY = e.clientY - element.getBoundingClientRect().top;

        const dragMove = (moveEvent) => {
            element.style.left = moveEvent.clientX - offsetX + 'px';
            element.style.top = moveEvent.clientY - offsetY + 'px';
        };

        const dragEnd = () => {
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
        };

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    };

    const draggableElements = Array.from(document.getElementsByClassName('draggable'));
    draggableElements.forEach(element => {
        element.addEventListener('mousedown', draggin);
    });
}

////////////////

const his = () => {
    let rom = {};
    let cache = [];
    
    return{
        rom: rom,
        cache: cache
    }
}

const bios = (navi, input) => {
    console.log("bios called");

    const initInterpreter = (interpreter) => {
        try {
            eval(interpreter.media);
            navi.cache.push(interpreter);
            console.log(`${interpreter.urns} initialized`);
        } catch (error) {
            console.log(`Failed to initialize: ${interpreter.urns}`, error);
        }
    };

    const interprate = (input) => {
        console.log("Interpreting", input.name);
        let handler = navi.cache.find(obj => obj.kind === "interpreter" && obj.urns === input.urns).name;
        if (handler && typeof navi.rom[handler] === "object" && navi.rom[handler] != null) {
            const functionHandler = navi.rom[handler][input.kind];
            if (typeof functionHandler === "function") {
                try {
                    functionHandler(input);
                    navi.cache.push(input);
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

    const canInterpret = navi.cache.some(obj => obj.kind === "interpreter" && obj.urns === input.urns);
    
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
                let interpreter = xotestkit_in; // Simulate fetching urns interpreter
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

    return { navi };
};

let htmx_import =
{
    "uri": "xo:hash",
    "urns": "xotestkit",
    "kind": "import",
    "name": "htmx 1.9.11",
    "media": `
        import('https://unpkg.com/htmx.org@1.9.11')
        .then(htmx => {
            // Now the htmx library is available, and you can use it
            console.log('htmx imported');
        })
        .catch(error => {
            // Handle error
            console.error('Failed to load htmx library:', error);
        });`
}
let xotestkit_in =
{
    "uri": "xo:hash",
    "urns": "xotestkit",
    "kind": "interpreter",
    "name": "xotestkit_handler",
    "media": `
    navi.rom.xotestkit_handler= {
        import: (input) => {
            if (navi.cache.find(obj => {return Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key]);}) === undefined){
                try{    
                    eval(input.media);
                }
                catch (error) {
                    console.log('failed to evaluate import', input.name, 'due to error:', error)
                }
            }
            else {
                console.log('this import is already cached!!')
            }
        },
        function: (input) => {
            eval(input.media);
        },
        script: () => {
            console.log("Function 3");
        }
    };`
}

let man = his();
console.log(man);


