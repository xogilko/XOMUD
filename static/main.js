document.addEventListener('DOMContentLoaded', () => {
    improg_init(); cli_init(); drag_init(); 
});

///////////////////PENDING NOTES:
/*

the data-import tag will have an optional key value pair for initializing the element once the script is secured

is it possile that the initialization statement is unique for each library, if so, then we can replace the name of the package
with the initialization step and keep one value pair/name of package is sufficient to know initialization

htmx is dropping swoops if the server cant keep up. only reset stick on arrival
find an alternative to timeout() for discovering 1 ping of a request<?>

pull improgging formula out into its own function

*/

///////////////// IMPORT MAP HANDLING

const getImportMap = () => { 
// <local map> <---> <session map> <--- <hyper map>

let sessionImportMap = {};

//local

let localImportMapString = localStorage.getItem('localImportMap'); //get native local map as string

let localImportMap = {}; //virtual local map

    //if there is no NATIVE local map stringify VIRTUAL local map and SURFACE it
    if (!localImportMapString){ localImportMapString = JSON.stringify(localImportMap)} //stringify VIRTUAL local map
    localStorage.setItem('localImportMap', localImportMapString); //SURFACE it
let importMap = {};
//if doesn't exist in local storage then:
if (!importMapString) {
    // Step 2b: Convert the import map to a JSON string
    importMapString = JSON.stringify(importMap);
    // Step 2c: Store the empty import map string in local storage
    localStorage.setItem('importMap', importMapString);
}
// if it does exist then try to parse it , if that works, then return it
else {
    try {
    importMap = JSON.parse(importMapString);
    } catch (error) {
    console.error('Error parsing import map from local storage:', error);
    // if it fails to parse then return the empty import map
    }
}
return importMap; // one way or another we return an import map to use
}

////////////////// DATA-IMPORT ATTRIBUTE HANDLING


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
            const scriptPath = getImportMap()[scriptKey];
            const script = document.createElement('script');
            script.src = scriptPath;
            script.defer = true;
            document.head.appendChild(script);
            console.log(scriptKey);
        }
    }
}

const improg_init = () => {

const guide = getImportMap(); // implement: if data-import key not in guide, option to add to guide, option to http request key pair, write manually etc.
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
