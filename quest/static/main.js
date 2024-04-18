document.addEventListener('DOMContentLoaded', () => { /* phone home */ 
});

const his = () => {
    let sign = 'xo';
    let domset = 0;
    let proc = []; 
    let cache = []; 
    let rom = {};
    let dir = {
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
                    input.domset = [];
                    Array.from(container.childNodes).forEach(node => {
                        if (node.nodeType === 1) {
                            const currentDomSet = lain.domset++;
                            node.setAttribute("data-set", currentDomSet);
                            input.domset.push(currentDomSet);
                            const assignDataSetsToChildren = (childNode) => {
                                if (childNode.nodeType === 1) {
                                    childNode.setAttribute("data-set", lain.domset++);
                                    Array.from(childNode.children).forEach(assignDataSetsToChildren);
                                }
                            };
                            Array.from(node.children).forEach(assignDataSetsToChildren);
                        }
                    });
                    while (container.firstChild) {
                        target.appendChild(container.firstChild);
                    } 
                    lain.cache.push(input);
                    let kidfunc = lain.dir[input.child];
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
                document.addEventListener('htmx:loaded', function() {
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
            });
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
                    console.log('htmx is from https://unpkg.com/htmx.org@1.9.11');
                })
                .catch(error => {
                    // Handle error
                    console.error('Failed to load htmx library:', error);
                });
                console.log('htmx imported');`
        },
        "padlock":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "masterkey protection",
            "media": `
                
            var setupLocalStorage = (function() {

                // conditions met provides: ability to toggle lock, ability to bypass lock with prompting
                var keysToWatch = ["specificKey1", "specificKey2", "specificKey3"];
                // LOCKED
                var processCompleted = false;
                console.log("locked!");

                // ORIGINAL LOCAL STORAGE METHODS 
                var originalSetItem = localStorage.setItem;
                var originalRemoveItem = localStorage.removeItem;

                // BYPASS LOCK
                function confirmModification(key, value) {
                    // PROMPT TO BYPASS
                    var confirmation = confirm("Are you sure you want to modify?", key);
                    return confirmation; // Return true if confirmed, false otherwise
                }

                // UNLOCKING CONDITIONS
                function conditionsMet() {
                    
                    var aliceLoggedIn = true; // Placeholder value for demonstration

                    return aliceLoggedIn; // TRUE = CONDITIONS MET
                }

                // WRAPPER OF SET ITEM TO LOCAL STORAGE
                localStorage.setItem = function(key, value) {
                    // IF IN-SCOPE LOCK IS LOCKED
                    if (keysToWatch.includes(key) && !processCompleted) {
                        // IF CONDITIONS ARE NOT MET GTFO
                        if (!conditionsMet()) {
                            console.log("Conditions not met to unlock localStorage.");
                            return; // Exit without modifying localStorage
                        }

                        // GIVEN CONDITIONS ARE MET, CONFIRM A BYPASS OF LOCK
                        var confirmed = confirmModification(key, value);
                        if (!confirmed) {
                            console.log("Modification canceled."); // Log cancellation
                            return; // Exit without modifying localStorage
                        }
                    }
                    
                    // OUTSIDE OF SCOPE OR UNLOCKED, DEFAULT LOCAL STORAGE METHOD
                    originalSetItem.call(localStorage, key, value);
                }

                // WRAPPER OF REMOVE ITEM TO LOCAL STORAGE
                localStorage.removeItem = function(key) {
                    // IF IN-SCOPE LOCK IS LOCKED
                    if (keysToWatch.includes(key) && !processCompleted) {
                        // IF CONDITIONS ARE NOT MET GTFO
                        if (!conditionsMet()) {
                            console.log("Conditions not met to unlock localStorage.");
                            return; // Exit without modifying localStorage
                        }

                        // GIVEN CONDITIONS ARE MET, CONFIRM A BYPASS OF LOCK
                        var confirmed = confirmModification(key, "undefined");
                        if (!confirmed) {
                            console.log("Removal canceled."); // Log cancellation
                            return; // Exit without modifying localStorage
                        }
                    }
                    
                    // OUTSIDE OF SCOPE OR UNLOCKED, DEFAULT LOCAL STORAGE METHOD
                    originalRemoveItem.call(localStorage, key);
                }

                // EXPOSE THE TOGGLE LOCK
                return function() {
                    // CONDITIONS AINT MET THO? GTFO
                    if (!conditionsMet()) {
                        console.log("Conditions not met to unlock localStorage.");
                        return; // Exit without toggling completion state
                    }

                    // GIVEN CONDITIONS ARE MET, TOGGLE LOCK
                    processCompleted = !processCompleted;
                    console.log("Process completed:", processCompleted);
                };
            })();
            `
        },
        "testkit_register_sw":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "testkit transform content!",
            "media": `
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
                    // Registration was successful
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    // registration failed :(
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `
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
        "testkit_atc_html":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "html",
            "name": "testkit atc widget",
            "child": "testkit_atc_func",
            "media": `
            <span>
            <div id="testkit_atc" style="width:500px;height:150px;line-height:1em;overflow-y:scroll;padding-bottom:5px;">
            <ul id="qomms">
            </ul>
            </div>
            <form onsubmit="alice.rom.testkit_atc('callback')" hx-post="/command/" hx-trigger="submit" hx-target="#qomms" hx-swap="beforeend">
            <input type = "text" name = "set-message" id = "qomms-entry" placeholder = "contact server">
            <input type = "submit" value = "send">
            </form>
            </span>
            `
        },
        "testkit_atc_func":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "testkit atc applet",
            "media": `
            lain.rom.testkit_atc = (action = 'init_and_callback') => {
                const commandFeed = document.getElementById("qomms");
                const scrollCli = document.getElementById('testkit_atc');
                const entryMessage = document.getElementById('qomms-entry');
                if (action === 'init_and_callback' || action === 'init') {
                    const stringArray = ["xomud test area", "alice = present state", "navi(alice, 'proc', ...rest)", "or navi(alice, 'eval:alice.proc', ...rest)", "(っ◔◡◔)っ✩"];
                    stringArray.forEach(item => {
                        commandFeed.insertAdjacentHTML('beforeend', '<li>' + item + '</li>');
                    });
                }
                if (action === 'callback') {
                    commandFeed.insertAdjacentHTML('beforeend', '<li><i>' + lain.sign + '></i> ' + entryMessage.value + '</li>');
                    scrollCli.scrollTop = scrollCli.scrollHeight;
                    setTimeout(() => { entryMessage.value = ''; }, 0);
                }
            };
            lain.rom.testkit_atc('init_and_callback');
            `
        },
        "testkit_destroy":{
            "uri": "xo:01gh1085h01rij",
            "urns": "xotestkit",
            "kind": "js",
            "name": "destroy via cache",
            "media": `
            lain.rom.removeCacheItem = (item) => {
                try {
                    const cacheItem = lain.cache[item.index];
                    if (cacheItem) {
                        if (cacheItem.kind === 'html'){
                            cacheItem.domset.forEach(domset => {
                                const element = document.querySelector('[data-set="' + domset + '"]');
                                if (element) {
                                    element.remove();
                                    console.log('Element removed successfully');
                                } else {
                                    console.log('Element not found', element);
                                }
                            });
                        }
                        else if (cacheItem.kind === 'js' || cacheItem.kind === 'interpreter'){
                            handler_match = cacheItem.media.match(/lain\.rom\.[a-zA-Z0-9_]+/g);
                            if (handler_match) {
                                eval(handler_match[0] + ' = null;');
                                console.log(handler_match[0], eval(handler_match[0]));
                            } else {
                                console.log('no function to disable');
                            }
                        }
                        else {
                            console.log("cache type unrecognized? :O ", cacheItem);
                        }
                        lain.cache.splice(item.index, 1);
                    } else {
                        console.log('Cache item not found');
                    }
                } catch(error) {
                    console.log('Failed to destroy bc', error);
                }
            };
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
            <option value = "dir">dir</option>
            <option value = "local">local</option>
            </select>
            <button id="testkit_clerkButton">refresh</button>
            <br><p id="testkit_clerkSelectDesc"></p><hr>
            <div id="testkit_clerk"></div>
            
            `
        },
        "testkit_clerk_func": {
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
                    targetElement.innerHTML = ''; // Clear the current content
                    let htmlString = '';
                    if (clerk_select.value === "cache") {
                        document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>da following are cached as staged! (X to destroy)</i>';
                        lain.cache.forEach(function(item, index) {
                            htmlString += '<p><a href="#" id="removeCache_' + index + '">X</a> ' + item.name + '</p>';
                        });
                    } else if (clerk_select.value === "rom") {
                        document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>da following are activated functions!</i>';
                        Object.entries(lain.rom).filter(function([key, value]) { return value !== null; })
                            .forEach(function([key, value]) {
                                htmlString += '<p>' + key + '()</p>';
                            });
                    } else if (clerk_select.value === "dir") {
                        document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>heres what directory has indexed! (X to attempt build)</i>';
                        Object.entries(lain.dir).forEach(function([key, value]) {
                            if (value !== undefined) {
                                htmlString += '<p><a href="#" id="dir_' + key + '">X</a> ' + key + ' <i> - ' + value.name + '</i></p>';
                            }
                        });
                    } else if (clerk_select.value === "local") {
                        document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>keys placed in local storage:</i>';
                        Object.keys(localStorage).forEach(function(key) {
                            htmlString += '<p>' + key + '</p>';
                        });
                    }
                    targetElement.innerHTML = htmlString;

                    // Attach event listeners after elements are added to the DOM
                    if (clerk_select.value === "cache") {
                        lain.cache.forEach(function(item, index) {
                            document.getElementById('removeCache_' + index).onclick = function() {
                                lain.rom.removeCacheItem({index: index});
                                reset();
                                return false;
                            };
                        });
                    } else if (clerk_select.value === "dir") {
                        Object.keys(lain.dir).forEach(function(key) {
                            var element = document.getElementById('dir_' + key);
                            if (element) {
                                element.onclick = function() {
                                    navi(alice, "alice.dir." + key, "document.body");
                                    return false;
                                };
                            }
                        });
                    }
                };
                reset();
                document.getElementById('testkit_clerkButton').addEventListener('click', reset);
            }
            lain.rom.testkit_clerk();
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
        "testkit_store_gate_html":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "html",
            "name": "testkit move! widget",
            "child": "testkit_store_gate_func",
            "media": `
            <div id="testkit_store_gate">
            <input type = "text" id = "testkit_store_gate_Entry" placeholder = "dir index / storage key">
            <select id="testkit_store_gate_mode">
            <option value = "cut"> cut </option>
            <option value = "copy"> copy </option>
            </select>
            <select id="testkit_store_gate_select">
            <option value = "b2ls"> dir -> local storage </option>
            <option value = "ls2b"> local storage -> dir </option>
            </select>
            <button id="testkit_store_gate_Button">move!</button>
            </div>
            `
        },
        "testkit_store_gate_func":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "testkit move! applet",
            "media": `
            lain.rom.store_gate = () => {
                const gate = () => {
                    console.log('move!');
                    entryElement = document.getElementById("testkit_store_gate_Entry");
                    let entry = entryElement.value;
                    entryElement.value = '';
                    let direction = document.getElementById("testkit_store_gate_select").value;
                    if (direction === "b2ls" && lain.dir.hasOwnProperty(entry)) {
                        try {
                            localStorage.setItem(entry, JSON.stringify(lain.dir[entry]));
                            if (testkit_store_gate_mode.value === 'cut'){
                                delete lain.dir[entry];
                                lain.dir[entry] = undefined;
                            }
                        } catch (error) {
                            console.log("failed to send to local storage");
                        }
                    } else if (direction === "ls2b") {
                        let storedItem = localStorage.getItem(entry);
                        if (storedItem) {
                            try {
                                lain.dir[entry] = JSON.parse(storedItem);
                                if (testkit_store_gate_mode.value === 'cut'){
                                    localStorage.removeItem(entry);
                                }
                            } catch (error) {
                                console.log("failed to parse from local storage, maybe its not json");
                                console.log("putting a string in dir ig :/");
                                try {
                                    lain.dir[entry] = storedItem;
                                    if (testkit_store_gate_mode.value === 'cut'){
                                        localStorage.removeItem(entry);
                                    }
                                } catch (error) {
                                    console.log("that didn't work either so giving up");
                                }
                            }
                        } else {
                            console.log("item not found in local storage");
                        }
                    } else {
                        console.log("something went wrong idk maybe its not in dir");
                    }
                }
                console.log("movement armed");   
                document.getElementById('testkit_store_gate_Button').addEventListener('click', function() {gate();});
            }
            lain.rom.store_gate();
            `  
        },
        "demo_proc":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "testkit demo setup!",
            "media": `
            lain.rom.demo_proc = () => {
                //if (localStorage.getItem('default_navi')
                eiri(lain, lain.dir.drag_functions);
                eiri(lain, lain.dir.enclose_draggable);
                lain.rom.drag_init();
                eiri(lain, lain.dir.htmx_import);
                eiri(lain, lain.dir.css_manager);
                eiri(lain, lain.dir.dom_reporter);
                eiri(lain, lain.dir.dom_reassignment);
                eiri(lain, lain.dir.navi_exporter);
                eiri(lain, lain.dir.htmx_observe);
                eiri(lain, lain.dir.testkit_destroy);
                eiri(lain, lain.dir.testkit_regen_html, document.body);
                eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_cssmod_html), document.body);
                eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_clerk_html), document.body);
                eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_atc_html), document.body);
            }
            lain.rom.demo_proc();
            `
        },
        "test_name_reproc":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "testkit transform content!",
            "media": `
                // DRY style -> list spitter interpreter future
                console.log('transform?');
                document.querySelectorAll('*').forEach((element) => {
                    if (element.childNodes.length === 1 && element.textContent.trim() === 'URLMUD') {
                        const text = element.textContent;
                        const index = text.indexOf('LM');
                        if (index !== -1) {
                            const link = document.createElement('a');
                            link.href = 'https://wikipedia.org';
                            link.textContent = 'LM'; // Text to be wrapped in the hyperlink
                            const newText = text.substring(0, index) + '<a>' + link.outerHTML + '</a>' + text.substring(index + 2);
                            element.innerHTML = newText; // Update the element with the new HTML
                        }
                    }
                });
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
                            // Accessing cssRules might throw a SecurityError on cross-origin stylesheets
                            var cssRules = styleSheet.cssRules || styleSheet.rules;
                            for (var j = 0; j < cssRules.length; j++) {
                                var rule = cssRules[j];
                                if (rule instanceof CSSStyleRule) {
                                    var selectors = rule.selectorText.split(/\s*,\s*/);
                                    selectors.forEach(function(selector) {
                                        // Initialize the selector's property object if it doesn't exist
                                        if (!styleProperties[selector]) {
                                            styleProperties[selector] = {};
                                        }
                                        var styleDeclaration = rule.style;
                                        for (var k = 0; k < styleDeclaration.length; k++) {
                                            var property = styleDeclaration[k];
                                            // Store property values, overriding any previously stored value
                                            // This mimics the cascade where the last rule wins
                                            styleProperties[selector][property] = styleDeclaration.getPropertyValue(property);
                                        }
                                    });
                                }
                            }
                        } catch (error) {
                            console.error('Access to stylesheet ' + styleSheet.href + ' is denied.', error);
                        }
                    }
            
                    // Attempt to capture inline styles and styles applied directly via JS
                    // This is especially useful for elements like 'body' or those manipulated with JS
                    document.querySelectorAll('*').forEach(element => {
                        const selector = element.tagName.toLowerCase() + (element.id ? '#' + element.id : '') + (element.className ? '.' + element.className.split(/\s+/).join('.') : '');
                        if (!styleProperties[selector]) {
                            styleProperties[selector] = {};
                        }
                        var style = element.style;
                        for (var i = 0; i < style.length; i++) {
                            var property = style[i];
                            styleProperties[selector][property] = style.getPropertyValue(property);
                        }
                    });
            
                    return styleProperties;
                };
            
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

                const applyStylesheet = (stylesheetObject) => {
                    Object.entries(stylesheetObject).forEach(([selector, styles]) => {
                        Object.entries(styles).forEach(([property, value]) => {
                            modifyCSSProperty(selector, property, value);
                        });
                    });
                };

                return {
                    applyStylesheet,
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
            "name": "exporter of navi",
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
                console.log("reassigning dom based on:", dom_new);
                const dom_current_map = new Map();
                document.querySelectorAll('[data-set]').forEach(element => {
                    dom_current_map.set(element.getAttribute('data-set'), element);
                });            
                dom_new.forEach(elementInfo => { 
                    const entry_domset_value = elementInfo.attributes['data-set'];
                    const element = dom_current_map.get(entry_domset_value); //element is live match
                    if (element) {
                        // Update the attributes of the matched element to match those in dom_new
                        Object.entries(elementInfo.attributes).forEach(([attrName, attrValue]) => {
                            element.setAttribute(attrName, attrValue);
                        });

                        //clear processed entries from current map
                        dom_current_map.delete(entry_domset_value);
            
                        // Append the element to the end of its parent to reorder it
                        const parentElement = element.parentElement;
                        parentElement.appendChild(element); // Append the element to the end of its parent
                    }
                });
                dom_current_map.forEach((element, domset) => {
                    const cacheItemIndex = lain.cache.findIndex(item => item.domset && item.domset.includes(parseInt(domset)));
                    if (cacheItemIndex !== -1) {
                        lain.rom.removeCacheItem({index: cacheItemIndex});
                    }
                });
                console.log("dom reassigned");
            };
            `
        },
        "testkit_regen_html":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "html",
            "name": "testkit regen widget",
            "child": "testkit_regen_func",
            "media": `
            <div id="testkit_regenerator">
            <input type = "text" id = "testkit_exportName" placeholder = "new skeleton label">
            <button id="testkit_exportButton">export skeleton</button>
            <br>
            <input type = "text" id = "testkit_regenImport" placeholder = "skeleton label">
            <button id="testkit_regenButton">regen navi</button>
            </div>
            `
        },
        "testkit_regen_func":{
            "uri": "xo:hash",
            "urns": "xotestkit",
            "kind": "js",
            "name": "regenerate navi w/ proc",
            "media": `
            lain.rom.testkit_regen = () => {
                const removeAllStylesheets = () => {
                    const linkStylesheets = document.querySelectorAll('link[rel="stylesheet"]');
                    linkStylesheets.forEach(link => link.parentNode.removeChild(link));
    
                    const styleElements = document.querySelectorAll('style');
                    styleElements.forEach(style => style.parentNode.removeChild(style));
                };
                skellygen = () => {
                    try {
                        console.log("spooky");
                        let label = testkit_exportName.value;
                        let skeleton = lain.rom.exporter();
                        skeleton.name = "skeleton export";
                        lain.dir[label] = skeleton;
                        testkit_exportName.value = '';
                    } catch (error) {
                        console.log("failed to generate skeleton", error);
                    }
                }
                deadgen = () => {
                    try {
                        let label = testkit_regenImport.value;
                        let skeleton = lain.dir[label];
                        if (!skeleton) {
                            console.log("skeleton not found bro");
                        }
                        // the real magic
                        // first clean up
                        for (let i = lain.cache.length - 1; i >= 0; i--) {
                            const cacheItem = lain.cache[i];
                            if (cacheItem && cacheItem.uri === "xo:01gh1085h01rij") {continue;}
                            lain.rom.removeCacheItem({index: i});
                        }
                        const removeCacheItemIndex = lain.cache.findIndex(item => item && item.uri === "xo:01gh1085h01rij");
                        if (removeCacheItemIndex !== -1) {
                            console.log("manual removal");
                            lain.rom.removeCacheItem({index: removeCacheItemIndex});
                            
                        }
                        console.log('cache is..');
                        console.log(lain.cache);
                        console.log("echo");
                        removeAllStylesheets();
                        lain.domset= 0; // dom is cleared
                        //run proc, then dom_reassignment, then style
                        
                        console.log(skeleton.navi_export.proc);
                        skeleton.navi_export.proc.forEach(args => {
                            let rest = args.map(arg => eval(arg));
                            eiri(lain, ...rest);
                        });
                        lain.rom.testkit_reassign(skeleton.navi_export.dom.domReport);                
                        lain.rom.manageCSS().applyStylesheet(skeleton.navi_export.css);
                        console.log("aaaaand we're back");
                        
                        
                    } catch (error) {
                        console.log("failed to regenerate", error);
                    }
                }
                
                document.getElementById('testkit_exportButton').addEventListener('click', function() {skellygen();});
                document.getElementById('testkit_regenButton').addEventListener('click', function() {console.log('LETS REGEN'); deadgen();});
            }
            lain.rom.testkit_regen();
            `
        },
    }
    let aux = [];
    return{
        sign: sign,
        domset: domset, //dom element counter
        proc: proc,     //navi session call log
        cache: cache,   //active state index
        rom: rom,       //activated functions
        dir: dir,       //local repository
        aux: aux        //supplementary doc index
    }
}

const navi = function(lain, ...rest) {
    console.log("✩ navi called ✩", arguments);   
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
            let handler_match = handler_origin.match(/(\S+?)\s*=\s*{/);
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
                    let interpreter = lain.dir.xotestkit_in; // Simulate fetching urns interpreter
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
    try{
        const evaluatedArgs = rest.map(arg => eval(arg));
        eiri(lain, ...evaluatedArgs);
        lain.proc.push(rest);
    }
    catch(error){
        console.log('navi has failed', error)
    }
    return { lain };
};

let alice = his();


/* QUEST */


// sse that feeds dir dynamically server-> navi

/* demoproc check if a skeleton is there? default? if not then demo_proc?
   idk figure that shit out how does it know what skeleton to use at startup
   wallet preferences ? local storage masterkey?
*/
/* window that takes html and saves it to dir
    would be nice to edit procs / modify directly exports
    not a priority
*/
/* track dependency funcs?
    not a priority
*/
/* padlock -
    protect localstorage via a process and closure from eval() manipulation:
    need to make sure the keystoWatch variable is protected, whether it be static or thru some other magic    
    move it into dir
*/
/* add a service worker to reroute /command/ to 8081 etc
a function that recieves responses that accepts objects to dir or docs to aux
not a priority
*/