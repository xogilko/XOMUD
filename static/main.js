document.addEventListener('DOMContentLoaded', () => {
//    cli_init(); drag_init(); 
});
/*

cache view
box view
bios button + 3rd arg

*/

const his = () => {
    let rom = {};
    let cache = [];  
    return{
        rom: rom,
        cache: cache
    }
}

const bios = (navi, input, context) => {
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
                    functionHandler(input, context);
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
                let interpreter = box.xotestkit_in; // Simulate fetching urns interpreter
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

let box = {
    "xotestkit_in":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "interpreter",
        "name": "xotestkit_handler",
        "media": `
        navi.rom.xotestkit_handler= {
            js: (input) => {
                if (navi.cache.find(obj => {return Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key]);}) === undefined){
                    try {eval(input.media);}
                    catch (error) {console.log('failed to evaluate function(s)', input.name, 'due to error:', error)}
                } else {console.log('function(s) already cached')}
            },
            html: (input, target) => {
                var container = document.createElement("div");
                container.innerHTML = input.media;
                while (container.firstChild){target.appendChild(container.firstChild);}
            }
        };`
    },
    "htmx_observe":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "js",
        "name": "htmx dynamic processor",
        "media": `
        navi.rom.htmx_processor = () => {
            console.log("live processor");
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    console.log("mutation detected")
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.querySelectorAll('[hx-trigger]') !== null) {
                            console.log(node, "processing");
                            htmx.process(node);
                        }
                    });
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
        `
    },
    "htmx_import":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "js",
        "name": "htmx import 1.9.11",
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
    },
    "htmx_script":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "html",
        "name": "htmx script 1.9.11",
        "media": `
        <script src="https://unpkg.com/htmx.org@1.9.11"></script>`
    },
    "xomud_dragtest":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "html",
        "name": "xomud_dragtest",
        "media": `
        <div class="draggable">Drag me 1</div>
	    <div class="draggable">Drag me 2</div>
	    <div class="draggable">Drag me 3</div>
        <div class="draggable"><div class="dragged_content"><i>boom</i></div></div>`
    },
    "xomud_cmd":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "html",
        "name": "xomud_cmd",
        "media": `
        <div id="cli" style="width:500px;height:150px;line-height:1em;overflow-y:scroll;padding-bottom:5px;">
        <ul id="command-feed">
        </ul>
        </div>				
        <form onsubmit="man.rom.swoop()" hx-post="/command/" hx-trigger="submit" hx-target="#command-feed" hx-swap="beforeend">
        <input type = "text" name = "set-message" id = "entry-message">
        <input type = "submit" value = "send">
        </form>`
    },
    "xomud_cmd_func":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "js",
        "name": "xomud_cmd_func w/ bios call",
        "media": `
        navi.rom.swoop = () => {
            console.log("swoop activated");
            const scrollCli = document.getElementById('cli');
            scrollCli.scrollTop = scrollCli.scrollHeight;
            setTimeout(() => { document.getElementById('entry-message').value = 'https://'; }, 0);
        };
        
        navi.rom.cli_init = () => {
            var command = document.getElementById("command-feed");
            const stringArray = ["xotestkit_in = activate interpreter", "htmx_import = turn on htmx in js", "currently this immediately evals bios(man, input)", "ooo watch out"];
            stringArray.forEach(item => {
                command.insertAdjacentHTML('beforeend', '<li>' + item + '</li>');
            });
        }`
    },
    "drag_functions":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "js",
        "name": "drag init",
        "media": `
        console.log("is anyone out there?")
        navi.rom.drag_init = () => {
            console.log("init dragification")
            const draggin = (e) => {
                console.log("init draggin", e)
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
        
            const addDragEventListener = (element) => {
                console.log("dragginating", element)
                element.addEventListener('mousedown', draggin);
            };
        
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    console.log("mutation detected")
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList.contains('draggable')) {
                            addDragEventListener(node);
                        }
                    });
                });
            });
        
            observer.observe(document.body, { childList: true, subtree: true });
        
            const draggableElements = document.querySelectorAll('.draggable');
            console.log("did we find any?", draggableElements)
            draggableElements.forEach(addDragEventListener);
        }`
    },
    "manager_html":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "html",
        "name": "manager_html",
        "media": `
        <div id="manager"></div><button id="managerButton">refresh</button>
        <script>
        document.getElementById('managerButton').addEventListener('click', function() {
            navi.rom.manager(box, 'manager');
        }
        </script>`
    },
    "manager":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "js",
        "name": "process manager",
        "media": `
        navi.rom.manager = (obj, targetElementId) => {
            const targetElement = document.getElementById(targetElementId);
            if (!targetElement) {
                console.error('Target element not found');
                return;
            }
            targetElement.innerHTML = '';
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                const listItem = document.createElement('p');
                listItem.textContent = key + ', Name: ' + value.name + ', kind: ' + value.kind;
                targetElement.appendChild(listItem);
                };
            };
        }
        `
    },
    "encloseDrag":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "js",
        "name": "insert in draggable",
        "media": `
        navi.rom.encloseDrag = (originalObject) => {
            newMedia = '<div class="draggable"><div class="dragged_content">' + originalObject.media + '</div></div>';
            newName = 'draggable transform of ' + originalObject.name;
            const modifiedObject = { ...originalObject, media: newMedia, name: newName };
            return modifiedObject;
        }
        `  
    },
    "startupdragcli":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "js",
        "name": "cli setup statements",
        "media": `
        bios(man, box.drag_functions);
        bios(man, box.encloseDrag);
        man.rom.drag_init();
        bios(man, box.htmx_observe);
        man.rom.htmx_processor();
        bios(man, man.rom.encloseDrag(box.xomud_cmd), document.body);
        bios(man, box.xomud_cmd_func);
        man.rom.cli_init();
        man.rom.swoop();
        `
    },
}

let man = his();
console.log(man);