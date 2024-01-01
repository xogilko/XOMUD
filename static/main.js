document.addEventListener('DOMContentLoaded', () => {
    improg_init(); cli_init(); drag_init(); 
});

///////////////////PENDING NOTES:
/*

make getimportmap a global var?

the data-import tag will have an optional key value pair for initializing the element once the script is secured

htmx is dropping swoops if the server cant keep up. only reset stick on arrival
find an alternative to timeout() for discovering 1 ping of a request<?>

pull improgging formula out into its own function

the virtual world is a double cup

no more getnativemap auto creation

write a map handler for getting the src or method off of a attribute

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
const loadscript = (virtualMap, ) => {

}
const majestic = () => {
    const virtualMap = new Map();
    var elementsToInitialize = document.querySelectorAll('[data-import]');
        elementsToInitialize.forEach(function (element) {
            var libraryData = element.getAttribute('data-import').split(':');
                var libraryName = libraryData[0];
                var libraryDetails = libraryData[1].split('|');
                    var srcAddress = libraryDetails[0];
                    var initFunction = libraryDetails[1] || '';
            const libObject = {src: srcAddress, init: initFunction};
            virtualMap.set(libraryName, libObject);
            var script = document.createElement('script');
            script.src = srcAddress;
            script.onload = function () {
                if (initFunction) {
                    window.eval(initFunction)(element);
                }
            };
            document.head.appendChild(script);
        });
}

const scrape = () => {
    /*
    <div data-import="htmx:path/to/htmx.js|window.htmx.process"></div>
    */
    
        // Find all elements with the data-import attribute
        var elementsToInitialize = document.querySelectorAll('[data-import]');
    
        // Loop through each element and perform the initialization
        elementsToInitialize.forEach(function (element) {
            var libraryInfoData = element.getAttribute('data-import').split(':');
            var libraryName = libraryInfoData[0];
            var libraryDetails = libraryInfoData[1].split('|');
            var srcAddress = libraryDetails[0];
            var initFunction = libraryDetails[1] || ''; // Optional initialization function
    
            // Create a script element and set its source attribute
            var script = document.createElement('script');
            script.src = srcAddress;
    
            // Dynamically load the script and perform the initialization
            script.onload = function () {
                if (initFunction) {
                    window.eval(initFunction)(element);
                }
            };
    
            // Append the script to the document
            document.head.appendChild(script);
        });
}

const improgload = () => {
    /*
demo:
<div class="enhanced" data-library="htmx.js" data-method="window.htmx.process(element)">...</div>
improgload is for figuring out how to initialize based on the div
needs loadJS
*/
    // Select the div
var element = document.querySelector('.enhanced');

// Get the library name and method from the data attributes
var library = element.getAttribute('data-library');
var method = element.getAttribute('data-method');

// Load the library if not already loaded
if (!window[library]) {
  loadJS(library);
}

// Initialize the div with the library
window[library][method]();

}

const improgger = (mutationsList) => { //needs compatibility with guide concept
    for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-import') {
            const scriptKey = mutation.target.getAttribute('data-import');
            const scriptPath = getNativeMap()[scriptKey];
            const script = document.createElement('script');
            script.src = scriptPath;
            script.defer = true;
            document.head.appendChild(script);
            console.log(scriptKey);
        }
    }
}

const improg_init = () => {

const guide = getNativeMap(); // implement: if data-import key not in guide, option to add to guide, option to http request key pair, write manually etc.
const elementsWithDataImport = document.querySelectorAll('[data-import]');
    elementsWithDataImport.forEach(element => {
        const scriptKey = element.getAttribute('data-import');
        const scriptPath = guide[scriptKey];
        const script = document.createElement('script');
        script.src = scriptPath;
        document.head.appendChild(script);
        console.log(scriptKey);
    });
// Create a MutationObserver instance
const observer = new MutationObserver(improgger);

// Define the target node and options for the observer
const targetNode = document.body; // You can adjust this to observe a specific element or subtree
const config = { attributes: true, subtree: true }; //still dont quite get this

// Start observing the target node for attribute changes
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
