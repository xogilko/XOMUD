document.addEventListener('DOMContentLoaded', () => { /* phone home */ });
/*

man = alice
bios = navi
navi = lain

send box to localstorage externally

transforming cache / updates
exporting to/from cache

build a proc for navi that logs relevant events

recreation parts:
navi commands
dom contents
stylesheets
misc files

specs:

    automatic navi(alice, x)
    automatic alice.rom.(x) for live functions

stages:


*/

const his = () => {
    let rom = {};
    let cache = [];
    let proc = {};
    let box = {
        "xotestkit_in":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "interpreter",
            "name": "'xotestkit' urns interpreter",
            "media": `
            lain.rom.xotestkit_handler= {
                js: (input) => {
                    if (lain.cache.find(obj => {return Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key]);}) === undefined){
                        try {eval(input.media); lain.cache.push(input);}
                        catch (error) {console.log('failed to evaluate function(s)', input.name, 'due to error:', error)}
                    } else {console.log('function(s) already cached')}
                },
                html: (input, target) => {
                    var container = document.createElement("div");
                    container.innerHTML = input.media;
                    while (container.firstChild){target.appendChild(container.firstChild);
                    lain.cache.push(input);
                    }
                }
            };`
        },
        "htmx_observe":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "dynamic htmx observer",
            "media": `
                console.log("htmx will observe");
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1 && node.querySelectorAll('[hx-trigger]') !== null) {
                                htmx.process(node);
                            }
                        });
                    });
                });
                observer.observe(document.body, { childList: true, subtree: true });
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
        "testkit_dragtest":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "html",
            "name": "testkit_dragtest",
            "media": `
            <div class="draggable">Drag me 1</div>
            <div class="draggable">Drag me 2</div>
            <div class="draggable">Drag me 3</div>
            <div class="draggable"><div class="dragged_content"><i>boom</i></div></div>`
        },
        "testkit_cli":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "html",
            "name": "testkit cli widget",
            "media": `
            <div id="cli" style="width:500px;height:150px;line-height:1em;overflow-y:scroll;padding-bottom:5px;">
            <ul id="command-feed">
            </ul>
            </div>				
            <form onsubmit="alice.rom.swoop()" hx-post="/command/" hx-trigger="submit" hx-target="#command-feed" hx-swap="beforeend">
            <input type = "text" name = "set-message" id = "entry-message">
            <input type = "submit" value = "send">
            </form>`
        },
        "testkit_cli_func":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "testkit cli handler",
            "media": `
            lain.rom.swoop = () => {
                const scrollCli = document.getElementById('cli');
                scrollCli.scrollTop = scrollCli.scrollHeight;
                setTimeout(() => { document.getElementById('entry-message').value = 'https://'; }, 0);
            };
            
            lain.rom.cli_init = () => {
                var command = document.getElementById("command-feed");
                const stringArray = ["xomud test area", "alice = present state", "navi(alice, proc, ...rest)", "(っ◔◡◔)っ✩"];
                stringArray.forEach(item => {
                    command.insertAdjacentHTML('beforeend', '<li>' + item + '</li>');
                });
            }`
        },
        "drag_functions":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "draggable divs controller",
            "media": `
            lain.rom.drag_init = () => {
                const draggin = (e) => {
                    const element = e.target;
            
                    if (element.closest('.dragged_content')) return;
                    document.body.append(element);
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
                    element.addEventListener('mousedown', draggin);
                };
            
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1 && node.classList.contains('draggable')) {
                                addDragEventListener(node);
                            }
                        });
                    });
                });
            
                observer.observe(document.body, { childList: true, subtree: true });
            
                const draggableElements = document.querySelectorAll('.draggable');
                draggableElements.forEach(addDragEventListener);
            }`
        },
        "manager_html":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "html",
            "name": "process manager widget",
            "media": `
            <select id="xo_managerSelect">
            <option value = "cache">cache</option>
            <option value = "rom">rom</option>
            <option value = "box">box</option>
            </select>
            <button id="xo_managerButton">refresh</button>
            <br><p id="xo_managerSelectDesc"></p><hr>
            <div id="xo_manager"></div>
            
            `
        },
        "manager_func":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "process manager applet (cache/rom)",
            "media": `
            lain.rom.manager = () => {
                const targetElement = document.getElementById("xo_manager");
                if (!targetElement) {
                    console.error('Target element not found');
                    return;
                }
                const manager_select = document.getElementById('xo_managerSelect');
                const reset = () => {
                    if (manager_select.value === "cache"){
                        targetElement.innerHTML = '';
                        document.getElementById('xo_managerSelectDesc').innerHTML = '<i>the following are cached as staged in the lain!</i>';
                        for (const key in alice.cache) {
                            if (alice.cache.hasOwnProperty(key)) {
                                const value = alice.cache[key];
                                const listItem = document.createElement('p');
                                listItem.textContent = value.urns + '-' + value.kind + ' : ' + value.name;
                                targetElement.appendChild(listItem);
                            };
                        };
                    }
                    else if (manager_select.value === "rom") {
                        targetElement.innerHTML = '';
                        document.getElementById('xo_managerSelectDesc').innerHTML = '<i>the following are activated functions/components!</i>';
                        for (const key in alice.rom) {
                            if (alice.rom.hasOwnProperty(key)) {
                                const value = alice.rom[key];
                                if (typeof value === 'function') {
                                    const listItem = document.createElement('p');
                                    listItem.textContent = key + '()';
                                    targetElement.appendChild(listItem);
                                } else if (typeof value === 'object') {
                                    for (let item in value) {
                                        if (typeof value[item] === 'function') {
                                            const listItem = document.createElement('p');
                                            listItem.textContent = key + '.' + item + '()' ;
                                            targetElement.appendChild(listItem);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else if (manager_select.value === "box") {
                        targetElement.innerHTML = '';
                        document.getElementById('xo_managerSelectDesc').innerHTML = '<i>the following are activated functions/components!</i>';
                        for (const key in alice.box) {
                            if (alice.box.hasOwnProperty(key)) {
                                const value = alice.box[key];
                                if (typeof value === 'function') {
                                    const listItem = document.createElement('p');
                                    listItem.textContent = key + '()';
                                    targetElement.appendChild(listItem);
                                } else if (typeof value === 'object') {
                                    for (let item in value) {
                                        if (typeof value[item] === 'function') {
                                            const listItem = document.createElement('p');
                                            listItem.textContent = key + '.' + item + '()' ;
                                            targetElement.appendChild(listItem);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                reset();
                document.getElementById('xo_managerButton').addEventListener('click', function() {reset();});
            }        
            `
        },
        "enclose_draggable":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "enclose x in draggable div",
            "media": `
            lain.rom.enclose_draggable = (originalObject) => {
                newMedia = '<div class="draggable"><div class="dragged_content">' + originalObject.media + '</div></div>';
                newName = 'draggable enclosure of ' + originalObject.name;
                const modifiedObject = { ...originalObject, media: newMedia, name: newName };
                return modifiedObject;
            }
            `  
        },
        "demo_proc":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "testkit demo setup",
            "media": `
            navi(alice, alice.box.drag_functions);
            navi(alice, alice.box.enclose_draggable);
            alice.rom.drag_init();
            navi(alice, alice.box.htmx_observe);
            navi(alice, alice.rom.enclose_draggable(alice.box.testkit_cli), document.body);
            navi(alice, alice.box.testkit_cli_func);
            alice.rom.cli_init();
            alice.rom.swoop();
            navi(alice, alice.rom.enclose_draggable(alice.box.manager_html), document.body);
            navi(alice, alice.box.manager_func);
            alice.rom.manager();
            navi(alice, alice.box.class_collect);
            navi(alice, alice.rom.enclose_draggable(alice.box.test_cssmod_html), document.body);
            navi(alice, alice.box.test_cssmod_func);
            `
        },
        "class_collect":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "generate array of css classes",
            "media": `
            lain.rom.manageCSS = () => {
                let customStyleSheet = null;
            
                const getOrCreateCustomStyleSheet = () => {
                    if (!customStyleSheet) {
                        const styleElement = document.createElement('style');
                        document.head.appendChild(styleElement);
                        customStyleSheet = styleElement.sheet;
                    }
                    return customStyleSheet;
                };
    
                const getCSSProperties = () => {
                    var styleProperties = {};
                    var styleSheets = document.styleSheets;
                    for (var i = 0; i < styleSheets.length; i++) {
                        var styleSheet = styleSheets[i];
                        try {
                            var cssRules = styleSheet.cssRules || styleSheet.rules;
                            for (var j = 0; j < cssRules.length; j++) {
                                var rule = cssRules[j];
                                if (rule instanceof CSSStyleRule) {
                                    var selectors = rule.selectorText.split(/\s*,\s*/);
                                    selectors.forEach(function(selector) {
                                        if (!styleProperties[selector]) {
                                            styleProperties[selector] = {};
                                        }
                                        var styleDeclaration = rule.style;
                                        for (var k = 0; k < styleDeclaration.length; k++) {
                                            var property = styleDeclaration[k];
                                            styleProperties[selector][property] = styleDeclaration.getPropertyValue(property);
                                        }
                                    });
                                }
                            }
                        } catch (error) {
                            console.error('Access to stylesheet ' + styleSheet.href + ' is denied.');
                        }
                    }
                    return styleProperties;
                }
            
                const modifyCSSProperty = (selector, property, value) => {
                    let ruleFound = false;
            
                    // Attempt to modify an existing rule in any stylesheet
                    for (let i = 0; i < document.styleSheets.length; i++) {
                        const styleSheet = document.styleSheets[i];
                        try {
                            const cssRules = styleSheet.cssRules || styleSheet.rules;
                            for (let j = 0; j < cssRules.length; j++) {
                                const rule = cssRules[j];
                                if (rule.selectorText === selector) {
                                    rule.style[property] = value;
                                    ruleFound = true;
                                    break;
                                }
                            }
                        } catch (error) {
                            console.warn('Could not access rules of stylesheet: ' + styleSheet.href, error);
                        }
                        if (ruleFound) break;
                    }
            
                    // If the rule was not found in existing stylesheets, add it to the custom stylesheet
                    if (!ruleFound) {
                        const customSheet = getOrCreateCustomStyleSheet();
                        customSheet.insertRule(selector + ' { ' + property + ': ' + value + '; }', customSheet.cssRules.length);
                    }
                };
            
                return {
                    modifyCSSProperty,
                    getCSSProperties
                };
            };
            `
        },
        "test_cssmod_html":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "html",
            "name": "css manager widget",
            "media": `
            <div id="xo_retouch">
            <input type = "text" id = "retouchClass" value = ".draggable">
            <input type = "text" id = "retouchProperty" value = "background-color">
            <input type = "text" id = "retouchValue" value = "red">
            <button id="xo_retouchButton">retouch</button>
            <br><p></p><hr>
            </div>
            
            `
        },
        "test_cssmod_func":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "demo css modify",
            "media": `
            const targetElement = document.getElementById("xo_retouch");
                if (!targetElement) {
                    console.error('Target element not found');
                }
            const retouch = () => {
                console.log('retouch');
                let retouch_class = document.getElementById("retouchClass").value;
                let retouch_property = document.getElementById("retouchProperty").value;
                let retouch_value = document.getElementById("retouchValue").value;
            alice.rom.manageCSS().modifyCSSProperty(retouch_class, retouch_property, retouch_value);
            }
            document.getElementById('xo_retouchButton').addEventListener('click', function() {retouch();});
            `
        },
    }
    return{
        rom: rom,
        cache: cache,
        proc: proc,
        box: box
    }
}

const navi = (lain, input, ...rest) => {
    console.log("✩ navi called ✩");
    const initInterpreter = (interpreter) => {
        try {
            eval(interpreter.media);
            lain.cache.push(interpreter);
            console.log(`${interpreter.urns} initialized`);
        } catch (error) {
            console.log(`Failed to initialize: ${interpreter.urns}`, error);
        }
    };
    const interprate = (input) => {
        console.log("Interpreting", input.name);

        let handler_origin = lain.cache.find(obj => obj.kind === "interpreter" && obj.urns === input.urns).media;
        handler_match = handler_origin.match(/(\S+?)\s*=\s*{/);
        if (!handler_match) { console.log(`Can't find handler obj name`); return; }
        const handler = eval(handler_match[1]);
        if (handler && typeof [handler] === "object" && [handler] != null) {
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
                let interpreter = alice.box.xotestkit_in; // Simulate fetching urns interpreter
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
    return { lain };
};



let alice = his();
console.log(alice);
