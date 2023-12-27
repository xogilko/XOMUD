document.addEventListener('DOMContentLoaded', () => {
    improg_init(); cli_init(); drag_init(); 
});

///////////////////PENDING NOTES:
// it looks like after the script tag is appended to the dom for the relevant data-import , there should be a script that takes the tag,
// and then replaces the tag with itself (or something else based on the context) so that the functionality is initialized properly
// ACTUALLY they're telling me that i don't need to initialize explicitly and the import tags will work after append on their own
// need to create ways for the user to control what happens here , using the guide var
//  look at unpoly compiler
// iwth unpoly we could use classes and up-data to achieve the functionality of data-import
// htmx is dropping swoops if the server cant keep up. only reset stick on arrival
/*
    standard js with a loadjs for handling  up-data='{"library": "address.js"}' attribute
    // Load the library if not already loaded
  if (!window[data.library]) {
    loadJS(data.library);
  }
  // Initialize the div with the library
  window[data.library](element);
  // Return a destructor function to clean up[^5^][5]
  return function() {
    // Remove any global effects or memory leaks
    window[data.library].destroy(element);

*/
///////////////// IMPORT MAP HANDLING

const getImportMap = () => { //need to have two import maps, one for session and one in local storage to dispose of unwanted keys automatically
//Attempt to retrieve the import map string from local storage
let importMapString = localStorage.getItem('importMap');
// initialize new empty import map (incase this fails somewhere)
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
