document.addEventListener('DOMContentLoaded', () => {
    dream(); cli_init(); drag_init(); 
});

/* PENDING QUESTS: */

/* DEEP REWRITE
    {
        domain - contract/policy
        +
    }
*/

/* DRAGGABLE        resource - XML config (drm policies) {object namespace}
        +
        hyper - custom rom config (handler policies/xslt, userscripts, css, import map for modules/dom scripting)
        +
        agent - custom rom config (handler policies/xslt, userscripts, css, import map for modules/dom scripting)

        htmx is dropping swoops if the server cant keep up. only reset stick on arrival
        find an alternative to timeout() for discoveing 1 ping of a request<?>
*/

///////////////////////////////

/*  BLUEPRINT

    policy pecking order ascending=
    browser user-agent defaults
    server side render policy
    user defined render policy
    resource defined render policy

<script> userscript manager [observer]
    localstorage
    cache storage
    uri db
*/
/* THIS IS STORAGE SOLUTIONS:

    the first key in local storage will be an import map which keeps track of the following keys
    directly inject to dom to prevent parse step of strings.
    following keys may include
        css
        xslt preferences
        case preferences
        userscripts
        corpus
        misc

    service worker may extend a cache for general resource/request files temporarily.

    third option is persistent alternate storage (chain/providers/cloud/export/download/upload)

*/





/* THIS IS THE OUTDATED DATA-IMPORT MODEL OF JUDGEMENT

// EXAMPLE HYPERTEXT: <div data-import="htmx:path/to/htmx.js|window.htmx.process"></div>
                //    <div data-import="htmx from 'path/to/htmx.js' with window.htmx.process">
                //    <div data-import="htmx from 'path/to/htmx.js'" data-init="window.htmx.process">

const dream = () => {

// NEW ROM :
    const rom = new Map(); 

// ROM -> DOM :
    const burn = (key, element = null) => {
        if (rom.has(key) && rom.get(key).src) {
            var script = document.createElement('script');
            script.src = rom[key].src;
            script.defer = true;
                script.onload = function () { //append callback to initialize element scripting
                    const initFunction = rom.get(key).init;
                    if (element && initFunction && typeof initFunction === 'function') { // ADD SOME PROVENANCE
                        initFunction(rom.get(key).element);
                    }
                };
            document.head.appendChild(script);
        }
        else {
            console.log('failed to burn with ' + key)
        }
    }
// DOM -> ROM :
    const collect = (element) => {
        var [libraryName, libraryDetails] = element.getAttribute('data-import').split(':');
        var [srcAddress, initFunction] = libraryDetails.split('|');
        const libObject = {src: srcAddress, init: initFunction};
        rom.set(libraryName, libObject);
    }
    const detect = () => {
        const improgger = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-import') {
                collect(mutation.target);
                }
            }
        }
        var elementsToInitialize = document.querySelectorAll('[data-import]');
        elementsToInitialize.forEach(collect);
        const observer = new MutationObserver(improgger);
        const targetNode = document.body;
        const config = { attributes: true, subtree: true };
        observer.observe(targetNode, config);
    }
// RETURN
    return { rom , detect, collect, burn }
}
*/

////////////////// COMMAND LINE INTERFACE HANDLING

const swoop = () => {
    const scrollCli = document.getElementById('cli');
    scrollCli.scrollTop = scrollCli.scrollHeight;
    document.getElementById('embediframe').src = document.getElementById('entry-message').value;
    setTimeout(() => { document.getElementById('entry-message').value = 'https://'; }, 0);
};

const cli_init = () => {
    var command = document.getElementById("command-feed");
    const stringArray = ["this is the default cli log", "overlay cache and all that", "i forgot the old log", "this uses http requests and responses"];
    stringArray.forEach(item => {
        command.insertAdjacentHTML('beforeend', `<li>${item}</li>`);
    });
}

////////////////// DRAGGABLE FRAMES HANDLING

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

const drag_init = () => {
const draggableElements = Array.from(document.getElementsByClassName('draggable'));
draggableElements.forEach(element => {
    element.addEventListener('mousedown', draggin);
});
}
