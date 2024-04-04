document.addEventListener('DOMContentLoaded', () => { /* phone home */ });

const his = () => {
    let domset = 0;
    let rom = {}; 
    let cache = []; 
    let proc = [];
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
                    input.domset = lain.domset;
                    const processNode = (node) => {
                        if (node.nodeType === 1) {
                            node.setAttribute("data-set", lain.domset++);
                            Array.from(node.children).forEach(processNode);
                        }
                    };
                    Array.from(container.childNodes).forEach(processNode);
                    while (container.firstChild) {
                        target.appendChild(container.firstChild);
                    }
                    lain.cache.push(input);
                    let kidfunc = lain.box[input.child];
                    if (kidfunc !== undefined){
                        if (kidfunc){eiri(lain, kidfunc);}
                        else {console.log("child func of", input.name, "not found");}
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
                    // Now htmx library is available, and you can use it
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
        "testkit_cli_html":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "html",
            "name": "testkit cli widget",
            "child": "testkit_cli_func",
            "media": `
            <span>
            <div id="testkit_cli" style="width:500px;height:150px;line-height:1em;overflow-y:scroll;padding-bottom:5px;">
            <ul id="command-feed">
            </ul>
            </div>				
            <form onsubmit="alice.rom.testkit_cli('callback')" hx-post="/command/" hx-trigger="submit" hx-target="#command-feed" hx-swap="beforeend">
            <input type = "text" name = "set-message" id = "entry-message">
            <input type = "submit" value = "send">
            </form>
            </span>
            `
        },
        "testkit_cli_func":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "testkit cli applet",
            "media": `
            lain.rom.testkit_cli = (action = 'init_and_callback') => {
                const commandFeed = document.getElementById("command-feed");
                const scrollCli = document.getElementById('testkit_cli');
                const entryMessage = document.getElementById('entry-message');
                if (action === 'init_and_callback' || action === 'init') {
                    const stringArray = ["xomud test area", "alice = present state", "navi(alice, proc, ...rest)", "(っ◔◡◔)っ✩"];
                    stringArray.forEach(item => {
                        commandFeed.insertAdjacentHTML('beforeend', '<li>' + item + '</li>');
                    });
                }
                if (action === 'init_and_callback' || action === 'callback') {
                    scrollCli.scrollTop = scrollCli.scrollHeight;
                    setTimeout(() => { entryMessage.value = 'https://'; }, 0);
                }
            };
            lain.rom.testkit_cli('init_and_callback');
            `
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
                    e.preventDefault();
                    const rect = element.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;
                    const leftInPx = rect.left + window.scrollX;
                    const topInPx = rect.top + window.scrollY;
                
                    element.style.position = 'absolute';
                    element.style.left = leftInPx + 'px';
                    element.style.top = topInPx + 'px';
                
                    document.body.append(element);
                
                    const dragMove = (moveEvent) => {
                        const newLeft = moveEvent.pageX - offsetX;
                        const newTop = moveEvent.pageY - offsetY;
                        element.style.left = newLeft + 'px';
                        element.style.top = newTop + 'px';
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
        "testkit_clerk_html":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "html",
            "name": "testkit clerk widget",
            "child": "testkit_clerk_func",
            "media": `
            <select id="testkit_clerkSelect">
            <option value = "cache">cache</option>
            <option value = "rom">rom</option>
            <option value = "box">box</option>
            </select>
            <button id="testkit_clerkButton">refresh</button>
            <br><p id="testkit_clerkSelectDesc"></p><hr>
            <div id="testkit_clerk"></div>
            
            `
        },
        "testkit_clerk_func":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "testkit clerk applet",
            "media": `
            lain.rom.testkit_clerk = () => {
                const targetElement = document.getElementById("testkit_clerk");
                if (!targetElement) {
                    console.error('Target element not found');
                    return;
                }
                const clerk_select = document.getElementById('testkit_clerkSelect');
                const reset = () => {
                    targetElement.innerHTML = '';
                    let itemsToDisplay = [];
                    if (clerk_select.value === "cache") {
                        document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>deez are cached as staged! (press X to destroy)</i>';
                        itemsToDisplay = lain.cache.map((item, index) => ({ name: item.name, index }));
                    } else if (clerk_select.value === "rom") {
                        document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>da following are activated functions!</i>';
                        itemsToDisplay = Object.entries(lain.rom)
                        .filter(([key, value]) => value !== null)
                        .map(([key, value]) => ({ name: key + '()', ...value }));
                    } else if (clerk_select.value === "box") {
                        document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>here are da available local components!</i>';
                        itemsToDisplay = Object.entries(lain.box).flatMap(([key, value]) => {
                            if (value) {
                                const summary = value.name + ' : ' + key;
                                return [{ name: summary }];
                            }
                            return [];
                        });
                    }
                    itemsToDisplay.forEach(item => {
                        const listItem = document.createElement('p');
                        if (item.hasOwnProperty('index')) {
                            const removeLink = document.createElement('a');
                            removeLink.href = "#";
                            removeLink.textContent = 'X';
                            removeLink.style.marginRight = '5px';
                            removeLink.onclick = (event) => {
                                event.preventDefault(); // Prevent the default anchor action
                                try {
                                    const cacheItem = lain.cache[item.index];
                                    if (cacheItem) {
                                        if (cacheItem.kind === 'html'){
                                            const element = document.querySelector('[data-set="' + cacheItem.domset + '"]');
                                            if (element) {
                                                element.remove();
                                                console.log('Element removed successfully');
                                            } else {
                                                console.log('Element not found');
                                            } 
                                        }
                                        else if (cacheItem.kind === 'js'){
                                            handler_match = cacheItem.media.match(/lain\.rom\.[a-zA-Z0-9_]+/g);
                                            if (handler_match) {
                                                eval(handler_match[0] + ' = null;');
                                                console.log(handler_match[0], eval(handler_match[0]));
                                            } else {
                                                console.log('no function to disable');
                                            }
                                        }
                                        else {
                                            console.log("cache type unrecognized? :O ");
                                        }
                                        lain.cache.splice(item.index, 1);
                                    } else {
                                        console.log('Cache item not found');
                                    }
                                } catch(error) {
                                    console.log('Failed to destroy bc', error);
                                }
                                reset();
                            };
                            listItem.appendChild(removeLink);
                        }
                        const textNode = document.createTextNode(" " + item.name);
                        listItem.appendChild(textNode);
                        targetElement.appendChild(listItem);
                    });
                };
                reset();
                document.getElementById('testkit_clerkButton').addEventListener('click', function() {reset();});
            }
            lain.rom.testkit_clerk();
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
            lain.rom.demo_proc = () => {
                eiri(lain, lain.box.drag_functions);
                eiri(lain, lain.box.enclose_draggable);
                lain.rom.drag_init();
                eiri(lain, lain.box.css_manager);
                eiri(lain, lain.box.dom_reporter);
                eiri(lain, lain.box.htmx_observe);
                eiri(lain, lain.rom.enclose_draggable(lain.box.testkit_cli_html), document.body);
                eiri(lain, lain.rom.enclose_draggable(lain.box.testkit_cssmod_html), document.body);
                eiri(lain, lain.rom.enclose_draggable(lain.box.testkit_clerk_html), document.body);
            }
            lain.rom.demo_proc();
            `
        },
        "css_manager":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "edit/create css manager",
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
        "dom_reporter":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "data-set tree reporter",
            "media": `
            lain.rom.reportDOM = () => {
                const allElements = document.querySelectorAll('*');
                const domReport = [];
                allElements.forEach(element => {
                    if (element.hasAttribute("data-set")) {
                        const tagName = element.tagName.toLowerCase();
                        const attributes = element.attributes;
                        const elementInfo = {
                            tagName: tagName,
                            attributes: {}
                        };
                        for (let i = 0; i < attributes.length; i++) {
                            const attr = attributes[i];
                            elementInfo.attributes[attr.nodeName] = attr.nodeValue;
                        }
                        domReport.push(elementInfo);
                    }
                });
                return {
                    domReport
                };
            }
            `
        },
        "navi_exporter":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "exporter of da navi (experiment)",
            "media": `
            lain.rom.exporter = () => {
                //this requires css_manager + dom_reporter
                let navi_export = {};
                if (typeof lain.rom.reportDOM === 'function' && typeof lain.rom.manageCSS === 'function'){
                    navi_export.proc = lain.proc;
                    navi_export.dom = lain.rom.reportDOM();
                    navi_export.css = lain.rom.manageCSS().getCSSProperties();
                }
                // could trim out useless procs but we arent
                // could also add misc items/files
                return {
                    navi_export
                };
            }
            `
        },
        "dom_reassignment":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "reassign elements to export",
            "media": `
            lain.rom.testkit_reassign = (dom_new) => {
                //this requires a dom report
                let dom_old = lain.rom.reportDOM().domReport;
                
            }
            `
        },
        "testkit_cssmod_html":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "html",
            "name": "testkit cssmod widget",
            "child": "testkit_cssmod_func",
            "media": `
            <div id="testkit_retouch">
            <input type = "text" id = "retouchClass" value = ".draggable">
            <input type = "text" id = "retouchProperty" value = "background-color">
            <input type = "text" id = "retouchValue" value = "red">
            <button id="testkit_retouchButton">retouch</button>
            </div>
            `
        },
        "testkit_cssmod_func":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "testkit cssmod applet",
            "media": `
            lain.rom.testkit_cssmod = () => {
                const targetElement = document.getElementById("testkit_retouch");
                    if (!targetElement) {
                        console.error('Target element not found');
                    }
                const retouch = () => {
                    console.log('retouch');
                    let retouch_class = document.getElementById("retouchClass").value;
                    let retouch_property = document.getElementById("retouchProperty").value;
                    let retouch_value = document.getElementById("retouchValue").value;
                lain.rom.manageCSS().modifyCSSProperty(retouch_class, retouch_property, retouch_value);
                }
                document.getElementById('testkit_retouchButton').addEventListener('click', function() {retouch();});
            }
            lain.rom.testkit_cssmod();
            `
        },
        "testkit_regen_html":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "html",
            "name": "testkit cssmod widget",
            "media": `
            <div id="testkit_regenerator">
            <input type = "text" id = "IDKWHATGOESHEREFUCKU" value = "red">
            <button id="testkit_regenButton">regen navi</button>
            <br><p></p><hr>
            </div>
            `
        },
        "teskit_regen_func":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "regenerate navi w/ proc",
            "media": `
            lain.rom.testkit_regen = () => {
                //this requires navi_exporter, testkit_reassign
                    //run proc, then reassign tree, then add sheets;
            }
            `
        },
    }
    return{
        domset: domset, //dom counter
        rom: rom,       //active functions
        cache: cache,   //active state pop
        proc: proc,     //navi calls for state log
        box: box        //temp potential pop
    }
}

const navi = function(lain, input, ...rest) {
    console.log("✩ navi called ✩", arguments);
    lain.proc.push(arguments);
    const eiri = (lain, input, ...rest) => {
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
                    let interpreter = lain.box.xotestkit_in; // Simulate fetching urns interpreter
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
    eiri(lain, input, ...rest);
    return { lain };
};

let alice = his();

/*
quests:

    figure out local storage
    place an export there
    seed the export access? or run a func that crosses death

*/