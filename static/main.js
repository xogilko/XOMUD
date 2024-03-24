document.addEventListener('DOMContentLoaded', () => {
    cli_init(); drag_init(); 
});

//index.html is importing this in the head

//////* PENDING QUESTS *///////
/* CONCEPT
        man/outline/manager
            import library vs place in dom
        dynamic identification based on origin
            if i swap in from a particular source it encloses programatically
*/
/* HYPERMEDIA EXAMPLE CASE

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
/* DYNAMIC SCRIPT INIT
        make userscript manager observer
        dynamic element init
        syntax for script indexing
*/
/* DRAGGABLE REPL
        htmx is dropping swoops if the server cant keep up. only reset stick on arrival
        find an alternative to timeout() for discoveing 1 ping of a request<?>
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

*/

///// COMMAND LINE INTERFACE HANDLING

const swoop = () => {
    const scrollCli = document.getElementById('cli');
    scrollCli.scrollTop = scrollCli.scrollHeight;
    bios(man, document.getElementById('entry-message').value);
    //document.getElementById('embediframe').src = document.getElementById('entry-message').value; OLD IFRAME TEST
    setTimeout(() => { document.getElementById('entry-message').value = 'https://'; }, 0);
};
const cli_init = () => {
    var command = document.getElementById("command-feed");
    const stringArray = ["xotestkit_in = activate interpreter", "htmx_import = turn on htmx in js", "i forgot the old log", "this uses http requests and responses"];
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

// dyanamic scripting
/*
navi.js
    imports
    functions
scripts
hypermedia

inbox , register, deploy
*/

const his = () => {
    let urn = [];
    let imports = ["htmx"];
    let functions = ["cli", "swoop", "drag"]
    let scripts = [];
    let media = [];
    
    return{
        imports: imports,
        functions: functions,
        scripts: scripts,
        media: media,
        urn: urn
    }
}



const bios = (navi, input) => {

    const interpretor_init = (input) => {
        if (input.kind === "interpreter") {
            try{
                eval(input.media);
                console.log(input.urn, "interpreter live");
            }
            catch(error){console.log("failed to initialize interpretor:", input.urn)}
        }
    }

    if (navi.urn.indexOf(input.urn) == -1){
        console.log("mounting urn", input.urn);
        try {
            //it should try to fetch urn interpretor
                let response = xotestkit_in;
            interpretor_init(response);
            navi.urn.push({[input.urn]:input.name}); 
            console.log("urn", input.urn , "mounted")
        }
        catch (error) {console.log("failed to mount")};
    }
    else {
        console.log("tf??"); // interpret input
    }
    return {
        navi: navi
    } 
}

let xotestkit_in =
{
    "uri": "xo:hash",
    "urn": "xotestkit",
    "kind": "interpreter",
    "name": "xotestkit_handler",
    "media": `
    const xotestkit_handler= {
        import: (media) => {
            eval(media);
        },
        script: () => {
            console.log("Function 2");
        },
        function3: () => {
            console.log("Function 3");
        }
    };`
}
let htmx_import =
{
    "uri": "xo:hash",
    "urn": "xotestkit",
    "kind": "import",
    "name": "htmx",
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
let man = his();

console.log(man.imports);
man.imports.push("test5");
console.log(man);

bios(man, xotestkit_in);
