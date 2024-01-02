document.addEventListener('DOMContentLoaded', () => {
    improg_init(); cli_init(); drag_init(); 
});

///////////////////PENDING NOTES:
/*

htmx is dropping swoops if the server cant keep up. only reset stick on arrival
find an alternative to timeout() for discovering 1 ping of a request<?>

trying virtual map as a global map for loadscript and majestic

*/

///////////////// JSON MAP HANDLING

const getNativeMap = () => {
let nativeMap = {};
let nativeMapString = localStorage.getItem('nativeMap');
if (!nativeMapString) {//if doesn't exist
    console.log('native map from local storage not found');
}
else {// if it does exist then try to parse it
    try { nativeMap = JSON.parse(nativeMapString);} 
    catch (error) { console.error('Error parsing native map from local storage:', error);}
    
return nativeMap;
}
}

const setNativeMap = (virtualMap) => { //save/replace local map
localStorage.setItem('nativeMap', JSON.stringify(virtualMap));
}

const virtualMap = new Map(); //GLOBAL VIRTUAL MAP ((( <native> <virtual> <hyper> )))

////////////////// DATA-IMPORT ATTRIBUTE HANDLING

/* PROG-

improg vs scrape
    improg is not prepared to initialize scripts for elements only append them and observe further
    keep improg's key value pair, split the value with source and init via |
    need a map to keep track of what scripts/dep are live to understand which scripts to load (keys)

//guide variable is not global

improg init

@render (render and create observer)

    get import map as guide
    check page for data import
    for each element w data import
        get the key(libName)
        get the value for key from guide
        create script tag
            tag source is value from guide
        append to <head>
        log the libName
    create an improgger observer
        observes <body>
        attributes + tree changes
    activates improgger observer

improgger (observer callback function)

@live

    recieves list of notifications for observer
        for each mutation
            if its an attribute mutation and its an data import
                then get the name of the key
                get the value for the key from the import map
                    create script tag
                        script src from value
                        defer true
                    append to <head>
                log the libName

improgload (initialize for the element dynamically)

@load <?>
if window doesn't have library
    loadJS library
window[library][initialization]();

*/
const loadScript = (key, element) => {
  /*
    <div data-import="htmx:path/to/htmx.js|window.htmx.process"></div>
    */
    var script = document.createElement('script');
    script.src = virtualMap[key].src;
    script.defer = true;
    script.onload = function () {
        if (initFunction) {
            window.eval(virtualMap[key],init)(element);
        }
    };
    document.head.appendChild(script);
}
// mutations arent yet wired up with adding to virtual map and instead going straight to load
// virtualMap/native is not set up to allow user guided loading/priority
const hyperMap = () => {
    var elementsToInitialize = document.querySelectorAll('[data-import]');
        elementsToInitialize.forEach(function (element) {
            var libraryData = element.getAttribute('data-import').split(':');
                var libraryName = libraryData[0];
                var libraryDetails = libraryData[1].split('|');
                    var srcAddress = libraryDetails[0];
                    var initFunction = libraryDetails[1] || '';
            const libObject = {src: srcAddress, init: initFunction};
            virtualMap.set(libraryName, libObject);
        });
}
const liveRenderScript = () => {
    const improgger = (mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-import') {
                loadScript(mutation.target.getAttribute('data-import'), mutation.target)
            }
        }
    }
const observer = new MutationObserver(improgger);
const targetNode = document.body;
const config = { attributes: true, subtree: true };
observer.observe(targetNode, config);
}

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
