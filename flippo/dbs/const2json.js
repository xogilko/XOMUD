const fs = require('fs');
const content = {
    "testkit_in":{
        "uri": "xo.05919057190759",
        "aux": "testkit",
        "kind": "interpreter",
        "name": "'testkit' aux interpreter",
        "media": "\nlain.rom.testkit_handler = {\n    pendingAsyncOps: 0,\n    allAsyncOpsResolvedCallback: null,\n    js: (input) => {\n        if (lain.cache.find(obj => { return Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key]); }) === undefined) {\n            try { eval(input.media); input.step = lain.proc.length; lain.cache.push(input); }\n            catch (error) { console.log('failed to evaluate function(s)', input.name, 'due to error:', error) }\n        } else { console.log('function(s) already cached') }\n    },\n    jsmod: (input) => {\n        if (lain.cache.find(obj => Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key])) === undefined) {\n            try {\n                const fetchmod = async (modURL) => {\n                    const headers = new Headers();\n                    const httxid = input.httxid || lain.subs[modURL];\n                    if (httxid) {\n                        headers.append('httx', httxid);\n                    }\n                    try {\n                        const response = await fetch(lain.portal + modURL, { headers });\n                        if (!response.ok) {\n                            throw new Error('HTTP error! status: ' + response.status);\n                        }\n                        const blob = await response.blob();\n                        const objectURL = URL.createObjectURL(blob);\n                        try {\n                            const mod = await import(objectURL);\n                            URL.revokeObjectURL(objectURL);\n                            if (mod && mod.activate_module) {\n                                mod.activate_module(lain);\n                                console.log('mod imported with activation:', input.name);\n                            } else {\n                                console.log('mod imported without activation:', input.name);\n                            }\n                        } catch (importErr) {\n                            console.error('Error during mod import:', importErr);\n                        }\n                    } catch (error) {\n                        console.error('Error importing mod:', error);\n                    } finally {\n                        lain.rom.testkit_handler.pendingAsyncOps--;\n                        if (lain.rom.testkit_handler.pendingAsyncOps === 0 && lain.rom.testkit_handler.allAsyncOpsResolvedCallback) {\n                            lain.rom.testkit_handler.allAsyncOpsResolvedCallback();\n                        }\n                    }\n                };\n                const modURL = input.media;\n                console.log('importing async:', input.name);\n                lain.rom.testkit_handler.pendingAsyncOps++;\n                fetchmod(modURL);\n                input.step = lain.proc.length;\n                lain.cache.push(input);\n            } catch (error) {\n                console.log('failed to evaluate function(s)', input.name, 'due to error:', error);\n            }\n        } else {\n            console.log('function(s) already cached');\n        }\n    },\n    html: (input, target) => {\n        if (input.hasOwnProperty('count')) {\n            const matches = lain.cache.filter(obj => {\n                return Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key]);\n            });\n            if (matches.length >= input.count) {\n                console.log('item has met cache limit:', matches.length);\n                return;\n            }\n        }\n        var container = document.createElement('div');\n        container.innerHTML = input.media;\n        input.step = lain.proc.length;\n        Array.from(container.childNodes).forEach(node => {\n            if (node.nodeType === 1) {\n                input.domset = lain.domset++;\n                node.setAttribute('data-set', input.domset);\n                node.setAttribute('data-step', input.step);\n                const assignDataSetsToChildren = (childNode) => {\n                    if (childNode.nodeType === 1) {\n                        childNode.setAttribute('data-set', lain.domset++);\n                        Array.from(childNode.children).forEach(assignDataSetsToChildren);\n                    }\n                };\n                Array.from(node.children).forEach(assignDataSetsToChildren);\n            }\n        });\n        while (container.firstChild) {\n            target.insertBefore(container.firstChild, target.firstChild);\n        }\n        const stamp = JSON.parse(JSON.stringify(input));\n        lain.cache.push(stamp);\n        let kidfunc = lain.dvr[input.child];\n        if (kidfunc !== undefined) {\n            if (kidfunc) { eiri(lain, kidfunc); }\n            else { console.log('child func of', input.name, 'not found'); }\n        }\n    }\n};\nwindow.MySecureElement = class extends HTMLElement {\n    constructor() {\n        super();\n        const shadowRoot = this.attachShadow({ mode: 'closed' });\n        const wrapper = document.createElement('div');\n        shadowRoot.appendChild(wrapper);\n        this.wrapper = wrapper;\n    }\n    secure(child) {\n        this.wrapper.appendChild(child);\n    }\n};\nif (!customElements.get('testkit-shadow')) {\n    customElements.define('testkit-shadow', MySecureElement);\n}\nconsole.log('testkit-shadow element:', MySecureElement);\nconsole.log('interpreter registered with callback:', lain.portal);\n"
    },
    "navi_splash":{
        "uri": "xo.5906239056059015",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "navi splash",
        "media": "/quest/mod/splash.js"
    },
    "testkit_style_html":{
        "uri": "xo.764906239052624667",
        "aux": "testkit",
        "kind": "html",
        "name": "testkit styles :)",
        "media": `
        <style>
            .resizable {
                overflow: auto;
                resize: both; /* Allow both horizontal and vertical resizing */
                box-sizing: border-box; /* Include padding and border in element's total width and height */
            }
            .draggable {
            padding: 2px;
            background-color: gold;
            line-height: normal;
            position: absolute;
            cursor: move;
            }
            .dragged_content {
            padding: 10px;
            background-color: silver;
            cursor: auto;
            user-select: text;
            }
            .fineprint {
                font-size: 13px;
                font-weight: 300;
                text-shadow: 0px 0px 2px SteelBlue;
                letter-spacing: -1px;
            }
        </style>
        `
    },
    "drag_functions":{
        "uri": "xo.1346901349050946",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "draggable divs controller",
        "media": "/quest/mod/testkit_dir/drag_functions.js"
    },
    "enclose_draggable":{
        "uri": "xo.9076309520571515566",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "enclose x in draggable div",
        "media": "/quest/mod/testkit_dir/enclose_draggable.js"  
    },
    "fishtext":{
        "uri": "xo.1358356737564645646",
        "aux": "testkit",
        "kind": "html",
        "name": "fishtext",
        "child": "testkit_maritime",
        "media": "<div class='hyperfish'></div>"
    },
    "testkit_maritime":{
        "uri": "xo.10597953363777764",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "testkit maritime",
        "media": "/quest/mod/fish.js"
    },
    "test_name_replace":{
        "uri": "xo.2346903701358935",
        "aux": "testkit",
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
    "testkit_menu_html":{
        "uri": "xo.10357109570198666",
        "aux": "testkit",
        "kind": "html",
        "name": "testkit menu widget",
        "child": "testkit_menu_func",
        "count": 1,
        "media": `
        <span>
        <div id="testkit_menu">
        <i>testing remote</i><hr>
        <span id="currentChannel"></span><br>
        <form id="setchannel_form">
            <input style="max-width: 66px" id="setchannel" type="text" placeholder="channel"><br>
        </form>
        <select id="testkit_menuSelect" size="8">
        <option value = "testkit_atc_html">atc</option>
        <option value = "testkit_clerk_html">clerk</option>
        <option value = "testkit_kiosk_html">kiosk</option>
        <option value = "testkit_csspaint_html">csspaint</option>
        <option value = "testkit_regen_html">regen</option>
        <option value = "testkit_shop_html">shop</option>
        <option value = "testkit_store_gate_html">storegate</option>
        <option value = "testkit_keychain_html">keychain</option>
        </select><br>
        <button id="testkit_menuStart">start</button>
        <span id= 'testkit_blinker'></span><hr>
        <button id="testkit_menuClear">clear navi</button><br>
        <button id="testkit_menuSave">save navi</button><br>
        <span id= 'testkit_hiddenlist'></span>
        </span>
        `
    },
    "testkit_menu_func":{
        "uri": "xo.1591340569834601786",
        "aux": "testkit",
        "kind": "js",
        "name": "testkit menu applet",
        "media": `
        lain.rom.testkit_menu = (() => {
            // Blinkenlights
            let console_count = [];
            let isBlinkerRunning = false;
            const blinker = document.getElementById('testkit_blinker');
            //protect menu from idiots
            const testkitMenuDiv = document.getElementById('testkit_menu');
            if (testkitMenuDiv && testkitMenuDiv.parentElement && testkitMenuDiv.parentElement.parentElement && testkitMenuDiv.parentElement.parentElement.parentElement) {
                const parentParentParent = testkitMenuDiv.parentElement.parentElement.parentElement;
                const buttonsToRemove = parentParentParent.querySelectorAll('button[onclick="alice.rom.hideDraggable(this);"]');
                buttonsToRemove.forEach(button => {
                    button.remove();
                });
            }
            const flickerBlinker = () => {
                if (console_count.length > 0) {
                    isBlinkerRunning = true;
                    const { color } = console_count.shift();
                    blinker.style.color = color;
                    blinker.innerHTML = '';
                    setTimeout(() => {
                        blinker.innerHTML = '●';
                        if (console_count.length > 0) {
                            setTimeout(flickerBlinker, 30);
                        } else {
                            isBlinkerRunning = false;
                            blinker.style.color = 'grey';
                        }
                    }, 60);
                }
            };

            document.addEventListener('consolelogged', (event) => {
                if (console_count.length > 0 && !isBlinkerRunning) {
                    flickerBlinker();
                }
            });

            const originalLog = console.log;
            console.log = function(...args) {
                console_count.push({ color: 'lime' });
                originalLog.apply(console, args);
                document.dispatchEvent(new CustomEvent('consolelogged', { detail: { error: false } }));
            };

            const originalError = console.error;
            console.error = function(...args) {
                console_count.push({ color: 'red' });
                originalError.apply(console, args);
                document.dispatchEvent(new CustomEvent('consolelogged', { detail: { error: true } }));
            };

            console.log('Hello, world!');

            const updateHiddenList = () => {
                const hiddenListSpan = document.getElementById('testkit_hiddenlist');
                hiddenListSpan.innerHTML = ''; // Clear existing content

                const hiddenItems = lain.cache.filter(item => item.hidden);

                if (hiddenItems.length > 0) {
                    const select = document.createElement('select');
                    select.id = 'hiddenItemsSelect';
                    select.style.maxWidth = '64px';

                    hiddenItems.forEach((item) => {
                        const index = lain.cache.indexOf(item);
                        const option = document.createElement('option');
                        option.value = index;
                        option.text = item.name;
                        select.appendChild(option);
                    });

                    const hr = document.createElement('hr');
                    hiddenListSpan.appendChild(hr);
                    hiddenListSpan.appendChild(select);
                    const br = document.createElement('br');
                    hiddenListSpan.appendChild(br);
                    const unhideButton = document.createElement('button');
                    unhideButton.textContent = 'expand';
                    unhideButton.addEventListener('click', () => {
                        const selectedIndex = select.value;
                        if (selectedIndex !== '') {
                            const cacheItem = lain.cache[selectedIndex];
                            delete cacheItem.hidden;
        
                            const element = document.querySelector('[data-set="' + cacheItem.domset + '"]');
                            if (element) {
                                element.style.display = '';
                                element.style.pointerEvents = '';
                            }
                            else {
                                console.log('cant find element')
                            }
                            updateHiddenList(); // Refresh the hidden list
                        }
                    });

                    hiddenListSpan.appendChild(unhideButton);

                }
            };
                        setTimeout(() => {
                updateHiddenList();
            }, 500);
            // channel surfing
            currentChannel.innerText = alice.chan;
            
            document.getElementById('setchannel_form').addEventListener('submit', function(event) {
                event.preventDefault();
                let channelValue = setchannel.value.toLowerCase();
                if (channelValue.startsWith('/')) {
                    channelValue = channelValue.substring(1);
                }
                if (channelValue.endsWith('/')) {
                    channelValue = channelValue.slice(0, -1);
                }
                alice.chan = "/" + channelValue + "/";
                if (alice.chan == "/" + channelValue + "/"){
                    window.location.href = window.location.origin;
                }
            });
            // Testkit Apps
            document.getElementById('testkit_menuStart').addEventListener('click', function() {
                navi(alice, 'lain.rom.enclose_draggable(alice.dvr.' + testkit_menuSelect.value + ')', 'document.body');
            });
            document.getElementById('testkit_menuSave').addEventListener('click', function() {
                alice.rom.memory();
            });
            document.getElementById('testkit_menuClear').addEventListener('click', function() {
                if (confirm("clearing navi to default!!")){
                    if ('serviceWorker' in navigator) {
                        // Get all service worker registrations
                        navigator.serviceWorker.getRegistrations().then(function(registrations) {
                            for (let registration of registrations) {
                                // Unregister each service worker
                                registration.unregister().then(function(success) {
                                    if (success) {
                                        console.log('Service worker unregistered successfully.');
                                    } else {
                                        console.log('Service worker unregistration failed.');
                                    }
                                });
                            }
                        }).catch(function(error) {
                            console.error('Error getting service worker registrations:', error);
                        });
                    } else {
                        console.log('Service workers are not supported in this browser.');
                    }
                    
                    const request = indexedDB.open('realworld', 2);
                    request.onsuccess = function(event) {
                        const db = event.target.result;
                        const transaction = db.transaction(['upperlayer'], 'readwrite');
                        const upperlayer = transaction.objectStore('upperlayer');
                        const deleteRequest = upperlayer.delete('1');
                        deleteRequest.onsuccess = function() {
                            for (let i = lain.cache.length - 1; i >= 0; i--) {
                                const cacheItem = lain.cache[i];
                                if (cacheItem && cacheItem.uri === "xo.15901360516061") {
                                    continue; // Skip this iteration
                                }
                                lain.rom.removeCacheItem({index: i});
                            }
                            location.reload();
                            navi(alice, 'alice.dvr.demo_proc')
                        };
                        deleteRequest.onerror = function() {
                            console.error("Error deleting datastore");
                        };
                    };
                }
            });
            updateHiddenList();
            return {
                updateHiddenList
            };
        })();
        `
    },
    "testkit_atc_html":{
        "uri": "xo.9672303456646593015",
        "aux": "testkit",
        "kind": "html",
        "name": "testkit atc widget via quest",
        "child": "testkit_atc_func",
        "count": 1,
        "media": `
        <div>
        <div id="testkit_atc" style="max-width:666px;min-height:150px;line-height:1em;overflow-y:scroll;padding-bottom:5px;">
        <ul id="qomms">
        </ul>
        </div>
        <select id="testkit_atc_mode">
        <option value = "server">server</option>
        <option value = "client">client</option>
        </select>
        <span id="atc_inputarea">
        <form onsubmit="alice.rom.testkit_atc('callback')" hx-post="https://star.xomud.quest/quest/command/" hx-trigger="submit" hx-target="#qomms" hx-swap="beforeend">
        <input type = "text" name = "set-message" id = "qomms_entry" placeholder = "/quest/...">
        <input type = "submit" value = "send">
        </form>
        </span>
        </div>
        `
    },
    "testkit_atc_func":{
        "uri": "xo.13905760624562462",
        "aux": "testkit",
        "kind": "js",
        "name": "testkit atc applet",
        "media": `
        lain.rom.testkit_atc = (action = 'init_and_callback') => {
            if (action === 'init_and_callback' || action === 'init') {
                const stringArray = ["/quest/ testkit cli (type & send 'help')", "(っ◔◡◔)っ✩･ﾟ✧*･ﾟ･✶･ﾟ･ﾟ*･ﾟ･✶･ﾟ"];
                stringArray.forEach(item => {
                    commandFeed.insertAdjacentHTML('beforeend', '<li>' + item + '</li>');
                });
            }
            if (action === 'callback') {
                commandFeed.insertAdjacentHTML('beforeend', '<li><b><i>' + lain.sign + '></i></b> ' + qomms_entry.value + '</li>');
                scrollCli.scrollTop = scrollCli.scrollHeight;
                setTimeout(() => { qomms_entry.value = ''; }, 0);
            }
        };

            const commandFeed = document.getElementById("qomms");
            const scrollCli = document.getElementById('testkit_atc');
        lain.rom.testkit_atc('init_and_callback');

       
        testkit_atc_mode.addEventListener('change', function() {
            if (this.value === 'server') {
                atc_inputarea.innerHTML = '<form onsubmit="alice.rom.testkit_atc(\\'callback\\')" hx-post="https://star.xomud.quest/quest/command/" hx-trigger="submit" hx-target="#qomms" hx-swap="beforeend"><input type = "text" name = "set-message" id = "qomms_entry" placeholder = "/quest/..."><input type = "submit" value = "send"></form>';
                htmx.process(atc_inputarea);
            }
            if (this.value === 'client') {
                atc_inputarea.innerHTML = '<form id="testkit_atc_client" ><input type = "text" id="qomms_entry" placeholder = ">..."><input type="submit" value="eval"></form>';
                testkit_atc_client.addEventListener('submit', function() {
                    event.preventDefault();
                    if (confirm("ATC requests permission to execute a command!")){
                        commandFeed.insertAdjacentHTML('beforeend', '<li>' + qomms_entry.value + '</li>');
                        try {
                            const result = eval(qomms_entry.value);
                            const resultString = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;
                            commandFeed.insertAdjacentHTML('beforeend', '<li><i>' + resultString + '</i></li>');
                        } catch (error) {
                            commandFeed.insertAdjacentHTML('beforeend', '<li><i>' + error + '</i></li>');
                        }
                        qomms_entry.value = '';
                    }
                })
            }

        });
        testkit_atc_mode.dispatchEvent(new Event('change'));
        // client side template handling

        const atc_templates = {
            'atc_temp_channel': (element) => {
                element.innerHTML = lain.chan;
            },
            'atc_temp_portal': (element) => {
                element.innerHTML = lain.portal;
            },
            'atc_temp_aux': (element) => {
                element.innerHTML = document.querySelector('meta[portal][aux]').getAttribute('aux');
            },
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check the last list item in the <ul>
                    scrollCli.scrollTop = scrollCli.scrollHeight;
                    const lastListItem = commandFeed.lastElementChild;
                    if (lastListItem) {
                        Object.keys(atc_templates).forEach((templateId) => {
                            const templateElement = lastListItem.querySelector('#' + templateId);
                            if (templateElement) {
                                atc_templates[templateId](templateElement);
                    }
                });
                };
            };
            });
        });
        observer.observe(commandFeed, { childList: true, });
        `
    },
    "testkit_clerk_html":{
        "uri": "xo.13904517903346136136",
        "aux": "testkit",
        "kind": "html",
        "name": "testkit clerk widget",
        "child": "testkit_clerk_func",
        "count": 1,
        "media": `
        <div>
        <select id="testkit_clerkSelect">
        <option value = "cache">cache</option>
        <option value = "rom">rom</option>
        <option value = "dvr">dvr</option>
        <option value = "ls">ls</option>
        <option value = "db">db</option>
        </select>
        <button id="testkit_clerkButton">refresh</button>
        <input type = "text" id = "testkit_clerk_rqinput" placeholder = 'request mod via path'>
        <button id="testkit_clerk_rqButton">request</button>
        <br><span id="testkit_clerkSelectDesc"></span><hr>
        <div id="testkit_clerk" style="max-height: 400px; overflow-y: auto;"></div>
        </div>
        `
    },
    "testkit_clerk_func": {
        "uri": "xo.575692746724068956",
        "aux": "testkit",
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
                        htmlString += '<a href="#" id="removeCache_' + index + '">X</a> ' + item.name + '<br>';
                    });
                } else if (clerk_select.value === "rom") {
                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>da following are activated functions!</i>';
                    Object.entries(lain.rom).filter(function([key, value]) { return value !== null; })
                        .forEach(function([key, value]) {
                            htmlString += key + '()<br>';
                        });
                } else if (clerk_select.value === "dvr") {
                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>heres what dvr has indexed! (X to attempt build)</i>';
                    Object.entries(lain.dvr).forEach(function([key, value]) {
                        if (value !== undefined) {
                            htmlString += '<a href="#" id="dvr_' + key + '">X</a> ' + key + ' <i> - ' + value.name + '</i><br>';
                        }
                    });
                } else if (clerk_select.value === "ls") {
                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>keys placed in local storage:</i>';
                    Object.keys(localStorage).forEach(function(key) {
                        htmlString += + key + '<br>';
                    });
                } else if (clerk_select.value === "db") {
                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>here are objects in IndexedDB: (X to attempt dvr)</i>';
                    lain.rom.dbModule.openDB().then(function() {
                        lain.db.forEach(function(id) {
                            lain.rom.dbModule.getData(id).then(function(data) {
                                if (typeof data === 'object' && data !== null) {
                                    htmlString += '<a href="#" id="moveTodvr_' + id + '">X</a>' + ' id(' + id + '): ' + ( (data.file + ' ' + data.name) || 'data.name' || 'unnamed') + '<br>';
                                    targetElement.innerHTML = htmlString;
                                    document.getElementById('moveTodvr_' + id).onclick = function() {
                                        alice.dvr[data.file] = data;
                                        console.log('Moved ' + data.name + ' to dvr under key ' + data.file);
                                        lain.rom.dbModule.deleteData(id);
                                        reset();
                                        return false;
                                    };
                                }
                            });
                        });
                    });
                }
                targetElement.innerHTML = htmlString;

                // Attach event listeners after elements are added to the DOM
                if (clerk_select.value === "cache") {
                    lain.cache.forEach(function(item, index) {
                        document.getElementById('removeCache_' + index).onclick = function() {
                            console.log(item)
                            lain.rom.removeCacheItem({index: index});
                            reset();
                            return false;
                        };
                    });
                } else if (clerk_select.value === "dvr") {
                    Object.keys(lain.dvr).forEach(function(key) {
                        var element = document.getElementById('dvr_' + key);
                        if (element) {
                            element.onclick = function() {
                                navi(alice, "alice.dvr." + key, "document.body");
                                return false;
                            };
                        }
                    });
                }
                
            };
            reset();
            document.getElementById('testkit_clerkButton').addEventListener('click', reset);
            document.getElementById('testkit_clerk_rqButton').addEventListener('click', function() {
                let rq = testkit_clerk_rqinput.value;
                testkit_clerk_rqinput.value = '';
                navi(lain, JSON.parse(JSON.stringify({aux: 'testkit', kind: 'jsmod', name: rq, media: '/flippo/mod/' + rq})));
                lain.rom.testkit_handler.jsmod({kind: "jsmod", name: "rqmod: "+ rq, media: "/quest/mod/" + rq});
            });
        }
        lain.rom.testkit_clerk();
        `
    },
    "testkit_csspaint_html":{
        "uri": "xo.96290760257023536",
        "aux": "testkit",
        "kind": "html",
        "name": "testkit csspaint widget",
        "child": "testkit_csspaint_func",
        "media": `
        <div id="testkit_csspaint">
        <table>
            <tr><td>class:</td><td><select id="retouchClass"></select>
            <button id="testkit_csspaint_refresh">refresh</button></td></tr>
            <tr><td>property:</td><td><input type="text" id="retouchProperty" value="background-color"></td></tr>
            <tr><td>value:</td><td><input type="text" id="retouchValue" value="cyan"></td></tr>
        </table>
        <button id="testkit_csspaint_retouch">retouch</button>
        </div>
        `
    },
    "testkit_csspaint_func":{
        "uri": "xo.8957893475923050246",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "testkit csspaint applet",
        "media": "/quest/mod/testkit_dir/testkit_csspaint_func.js"
    },
    "testkit_shop_html":{
        "uri": "xo.1294189056906",
        "aux": "testkit",
        "kind": "html",
        "name": "testkit shop widget",
        "child": "testkit_shop_func",
        "count": 1,
        "media": `
        <div>
        <div id="testkit_shop">
        <b>department:</b>
        <input type = "text" id="testkit_shop_depart" placeholder="department" value="Bob's Shop">
        <button id="testkit_shop_refresh">refresh</button>
        <br><i>receipts must have offer hash in memo</i>
        <hr>
        <div id="testkit_shop_list"></div>
        </div>
        </div>
        `
    },
    "testkit_shop_func":{
        "uri": "xo.1051901904694690906",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "testkit shop applet",
        "media": "/quest/mod/testkit_dir/testkit_shop.js"
    },
    "testkit_kiosk_html":{
        "uri": "xo.1294189056906",
        "aux": "testkit",
        "kind": "html",
        "name": "testkit kiosk widget",
        "child": "testkit_kiosk_func",
        "count": 1,
        "media": `
        <div>
        <div id="testkit_kiosk">
        <input type = "text" id = "testkit_kiosk_keygen_derive" placeholder = "optional hd key">
        <input type = "checkbox" id = "testkit_kiosk_keygen_hdcheck" name="confirm"/>hd
        <button id="testkit_kiosk_keygen_button">generate keys</button>
        <span id="testkit_kiosk_keygen_privKey"></span>
        <span id="testkit_kiosk_keygen_pubKey"></span>
        <span id="testkit_kiosk_keygen_pubAddr"></span>
        <hr>
        <input type = "text" id = "testkit_kiosk_inputKeyForUTXO" placeholder = "insert an address">
        <input type = "checkbox" id = "testkit_kiosk_confirmForUTXO" name="confirm"/>confirmed
        <button id="testkit_kiosk_getUTXO_button">get utxo</button>
        <span id="testkit_kiosk_UTXO_total"></span>
        <hr>
        <input type = "text" id = "testkit_kiosk_inputForTX_utxo" placeholder = "UTXO address">
        <input type = "text" id = "testkit_kiosk_inputForTX_pubkey" placeholder = "UTXO public key">
        <input type = "checkbox" id = "testkit_kiosk_inputForTX_confirm" name="confirm"/>confirmed
        <br><input type = "text" id = "testkit_kiosk_inputForTX_change" placeholder = "change address">
        <input type = "text" id = "testkit_kiosk_inputForTX_amount" placeholder = "spend amount">
        <br><select id="testkit_inputForTX_lock_select">
        <option value = "satalite">Satalite Ordinal</option>
        <option value = "ordtxtpkh">Text Ordinal(P2PKH)</option>
        <option value = "ordtxtcustom">Text Ordinal(custom)</option>
        <option value = "asm">Custom ASM</option>
        </select>
        
        <span id="testkit_lock_inputfield">
        <br><textarea id="testkit_kiosk_inputForTX_lock" name="lockvalue" rows="1" cols="44" placeholder="memo"></textarea>
        </span>
        <br><input type = "text" id = "testkit_kiosk_inputForTX_sign" placeholder = "signing private key"><button id="testkit_kiosk_fireTX_button">fire tx</button>
        <p><span id="testkit_kiosk_TX_ID"></span></p>
        </div>
        </div>
        `
    },
    "testkit_kiosk_func":{
        "uri": "xo.1051901904694690906",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "testkit kiosk applet",
        "media": "/quest/mod/testkit_dir/testkit_kiosk.js"
    },
    "testkit_store_gate_html":{
        "uri": "xo.346975705910570175",
        "aux": "testkit",
        "kind": "html",
        "name": "testkit move! widget",
        "child": "testkit_store_gate_func",
        "media": `
        <div id="testkit_store_gate">
        <input type = "text" id = "testkit_store_gate_Entry" placeholder = "index / key">
        <select id="testkit_store_gate_mode">
        <option value = "cut"> cut </option>
        <option value = "copy"> copy </option>
        </select>
        <select id="testkit_store_gate_select">
        <option value = "b2ls">dvr -> ls</option>
        <option value = "ls2b">ls -> dvr</option>
        <option value = "b2db">dvr -> db</option>
        <option value = "db2b">db -> dvr</option>
        </select>
        <button id="testkit_store_gate_Button">move!</button>
        </div>
        `
    },
    "testkit_store_gate_func":{
        "uri": "xo.6767690457739309523",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "testkit move! applet",
        "media": "/quest/mod/testkit_dir/testkit_store_gate_func.js" 
    },
    "testkit_regen_html":{
        "uri": "xo.7685575453425453742122",
        "aux": "testkit",
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
        "uri": "xo.1321346875468776",
        "aux": "testkit",
        "kind": "js",
        "name": "testkit regen applet",
        "media": `
        document.getElementById('testkit_exportButton').addEventListener('click', function() {lain.rom.testkit_grave().skellygen(testkit_exportName.value); 
            testkit_exportName.value = '';});
        document.getElementById('testkit_regenButton').addEventListener('click', function() {console.log('LETS REGEN'); lain.rom.testkit_grave().deadgen(testkit_regenImport.value);});
        `
    },
    "testkit_mount_html":{
        "uri": "xo.56498453388979456",
        "aux": "testkit",
        "kind": "html",
        "name": "satalite mounting widget",
        "child": "testkit_mount_func",
        "media": `
        <div id="testkit_mounting_station">
        INPUT:<hr>
        <input type = "text" id = "testkt_mount_input_txid" placeholder = "satalite txid"><br>
        <textarea = "text" id = "testkit_mount_input_script" placeholder = "lock assembly"></textarea><br>
        <button id="testkit_mount_button">mount</button><hr>
        OUTPUT<br>
        <span id="testkit_mount_output"></span>
        </div>
        `
    },
    "testkit_mount_func":{
        "uri": "xo.13213488956468776",
        "aux": "testkit",
        "kind": "js",
        "name": "satalite mounting applet",
        "media": `
        `
    },
    "testkit_keychain_html":{
        "uri": "xo.9090876265572",
        "aux": "testkit",
        "kind": "html",
        "name": "shadow keychain widget",
        "child": "testkit_keychain_func",
        "media": `
        <testkit-shadow id="testkit_keychain">
        </testkit-shadow>
        `
    },
    "testkit_keychain_func":{
        "uri": "xo.90390009377332",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "shadow keychain applet",
        "media": "/quest/mod/testkit_dir/testkit_keychain.js"
    },
    "testkit_indexedDB":{
        "uri": "xo.098067293572359340",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "indexedDB functions",
        "media": "/quest/mod/testkit_dir/indexeddb.js"  
    },
    "bsv_script":{
        "uri": "xo.12591903790136",
        "aux": "testkit",
        "kind": "js",
        "name": "bsv library 1.5.6",
        "media": `
        new Promise((resolve, reject) => {
            var src = lain.portal + "/quest/lib/bsv.min.js";
            // Check if the script already exists
            if (!document.querySelector('script[src="' + src + '"]')) {
                var script = document.createElement('script');
                script.src = src;
                script.onload = function() { resolve(window.bsv); };
                script.onerror = reject;
                document.head.appendChild(script);
            } else {
                // Resolve with the existing script
                resolve(window.bsv);
            }
        });`
    },
    "htmx_script":{
        "uri": "xo.103901390590134576",
        "aux": "testkit",
        "kind": "js",
        "name": "htmx library 1.9.11",
        "media": `
            new Promise((resolve, reject) => {
                var src = "https://unpkg.com/htmx.org@1.9.11";
                // Check if the script already exists
                if (!document.querySelector('script[src="' + src + '"]')) {
                    var script = document.createElement('script');
                    script.src = src;
                    script.onload = function() { 
                        resolve(window.htmx); 
                        console.log('htmx is from https://unpkg.com/htmx.org@1.9.11');
                    };
                    script.onerror = reject;
                    document.head.appendChild(script);
                } else {
                    // Resolve with the existing script
                    resolve(window.htmx);
                    console.log('htmx is from https://unpkg.com/htmx.org@1.9.11');
                }
            })
            console.log('htmx imported');`
    },
    "htmx_observe":{
        "uri": "xo.12985719056914601",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "dynamic htmx observer",
        "media": "/quest/mod/testkit_dir/htmx_observe.js"
    },
    "testkit_destroy":{
        "uri": "xo.15901360516061",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "destroy via cache",
        "media": "/quest/mod/testkit_dir/testkit_destroy.js"
    },
    "css_manager":{
        "uri": "xo.87468435648701234",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "edit/create css manager",
        "media": "/quest/mod/testkit_dir/css_manager.js"
    },
    "dom_reporter":{
        "uri": "xo.5475837342346844768768",
        "aux": "testkit",
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
                        attributes: {},
                        misc: {}
                    };
                    for (let i = 0; i < attributes.length; i++) {
                        const attr = attributes[i];
                        elementInfo.attributes[attr.nodeName] = attr.nodeValue;
                    }
                    let parentElement = element;
                    let allParentsVisible = true;
                    while (parentElement) {
                        if (parentElement.style.display === 'none' || parentElement.style.pointerEvents === 'none') {
                            allParentsVisible = false;
                            break;
                        }
                        parentElement = parentElement.parentElement;
                    }

                    if (allParentsVisible) {
                        elementInfo.misc['width'] = element.offsetWidth;
                        elementInfo.misc['height'] = element.offsetHeight;
                    }
                    domReport.push(elementInfo);
                }
            });
            return domReport;
        }
        `
    },
    "navi_exporter":{
        "uri": "xo.73687385434867682",
        "aux": "testkit",
        "kind": "js",
        "name": "exporter of navi",
        "media": `
        lain.rom.exporter = () => {
            //this requires css_manager + dom_reporter
            let navi_export = {};
            if (typeof lain.rom.reportDOM === 'function' && typeof lain.rom.manageCSS === 'function'){
                navi_export.proc = structuredClone(lain.proc);
                navi_export.dom = lain.rom.reportDOM();
                navi_export.css = lain.rom.manageCSS().getCSSProperties();
                navi_export.proc.forEach((procEntry, index) => {
                    const stepIndex = index.toString();
                    const matchingDomEntry = navi_export.dom.find(domEntry => 
                        domEntry.attributes && domEntry.attributes['data-step'] === stepIndex
                    );
                    if (!matchingDomEntry) {
                        // Update proc entry if no matching dom entry is found
                        if (procEntry.length > 1){
                            navi_export.proc.splice(index, 1);
                        } else if (!lain.cache.some(item => item.step === index) && index !== 1) {
                            navi_export.proc.splice(index, 1);
                        }
                    } else {
                        delete matchingDomEntry.attributes['data-step'];   
                    }
                });
            }
            return {
                navi_export
            };
        }
        `
    },
    "dom_reassignment":{
        "uri": "xo.58753544223475875324",
        "aux": "testkit",
        "kind": "js",
        "name": "reassign elements to export",
        "media": `
        lain.rom.testkit_reassign = (dom_new) => {

            const dom_current_map = new Map();       
            // Populate the map and check for duplicates
            document.querySelectorAll('[data-set]').forEach(element => {
                const dataSetValue = element.getAttribute('data-set');
                if (dom_current_map.has(dataSetValue)) {
                    // If duplicate, remove the existing element from the DOM
                    const existingElement = dom_current_map.get(dataSetValue);
                    existingElement.parentElement.removeChild(existingElement);
                }
                dom_current_map.set(dataSetValue, element);
            });
            console.log("reassigning... to:", dom_new, "from:", dom_current_map); 
            // Set to track data-set values in dom_new for comparison
            const newDataSets = new Set(dom_new.map(elementInfo => elementInfo.attributes['data-set']));
        
            // Proceed with the comparison and reassignment
            dom_new.forEach(elementInfo => {
                const entry_domset_value = elementInfo.attributes['data-set'];
                const element = dom_current_map.get(entry_domset_value); //element is live match
                if (element) {
                    // Update the attributes of the matched element to match those in dom_new
                    Object.entries(elementInfo.attributes).forEach(([attrName, attrValue]) => {
                        if (attrName !== 'data-step') {
                            element.setAttribute(attrName, attrValue);
                        }
                    });
                    
                    Object.entries(elementInfo.misc).forEach(([attrName, attrValue]) => {
                        element.style[attrName] = attrValue;
                    });
                    if (element.style.display === 'none' && element.style.pointerEvents === 'none') {
                        const dataSet = parseInt(entry_domset_value, 10);
                        const cacheIndex = lain.cache.findIndex(item => item.domset === dataSet);
                        if (cacheIndex !== -1) {
                            lain.cache[cacheIndex].hidden = true;
                        }
                    }
                    // Clear processed entries from current map
                    dom_current_map.delete(entry_domset_value);
        
                    const parentElement = element.parentElement;
        
                    if (parentElement.tagName.toLowerCase() === 'body') {
                        // Check if the body has any child elements
                        if (parentElement.firstChild) {
                            parentElement.insertBefore(element, parentElement.firstChild);
                        } else {
                            parentElement.appendChild(element);
                        }
                    } else {
                        parentElement.appendChild(element);
                    }
                }
            });
        
            // Destroy elements not present in dom_new
            dom_current_map.forEach((element, domset) => {
                if (!newDataSets.has(domset)) {
                    console.log(newDataSets, domset, element)
                    //element.parentElement.removeChild(element);
                    var dataSet = parseInt(domset, 10);
                    var cacheIndex = lain.cache.findIndex(function(item) { return item.domset === dataSet; });
                    if (cacheIndex !== -1) {   
                        lain.rom.removeCacheItem({ index: cacheIndex });
                    } else if (element.parentElement) {
                        element.parentElement.removeChild(element);
                    }

                    // remove cache item but what is the index?
                }
            });
        
            console.log("dom reassigned");
        };
        `
    },
    "testkit_grave":{
        "uri": "xo.166536379998776",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "grave matters",
        "media": "/quest/mod/testkit_dir/testkit_grave.js"
    },
    "testkit_memory":{
        "uri": "xo.987349053796",
        "aux": "testkit",
        "kind": "jsmod",
        "name": "testkit memory",
        "media": "/quest/mod/testkit_dir/memory.js" 
    },
    "skelly_proc":{
        "uri": "xo.981896021340505556",
        "aux": "testkit",
        "kind": "js",
        "name": "testkit skelly setup!",
        "media": `
        lain.rom.skelly_proc = () => {
            eiri(lain, lain.dvr.testkit_destroy);
            eiri(lain, lain.dvr.css_manager);
            eiri(lain, lain.dvr.dom_reassignment);
            eiri(lain, lain.dvr.testkit_grave);
            const wake = () => {
                if (typeof lain.rom.removeCacheItem === 'function' && typeof lain.rom.removeCacheItem === 'function' && typeof lain.rom.manageCSS === 'function' && typeof lain.rom.testkit_grave === 'function') {
                    console.log('...reborn!');
                    lain.rom.testkit_grave().deadgen('memory');
                } else {
                    setTimeout(wake, 200); // Check again after 200ms if functions are not available
                }
            };
            wake();
        }
        lain.rom.skelly_proc();
        `
    },
    "demo_proc":{
        "uri": "xo.190571057013560106038",
        "aux": "testkit",
        "kind": "js",
        "name": "testkit demo setup!",
        "media": `
        lain.rom.demo_proc = () => {
            //if (localStorage.getItem('default_navi')
            eiri(lain, lain.dvr.navi_splash);
            eiri(lain, lain.dvr.testkit_style_html, document.head);  
            eiri(lain, lain.dvr.drag_functions);
            eiri(lain, lain.dvr.enclose_draggable);
            eiri(lain, lain.dvr.testkit_indexedDB);
            eiri(lain, lain.dvr.bsv_script);
            eiri(lain, lain.dvr.htmx_script);
            eiri(lain, lain.dvr.css_manager);
            eiri(lain, lain.dvr.dom_reporter);
            eiri(lain, lain.dvr.dom_reassignment);
            eiri(lain, lain.dvr.navi_exporter);
            eiri(lain, lain.dvr.testkit_grave);
            eiri(lain, lain.dvr.htmx_observe);
            eiri(lain, lain.dvr.testkit_destroy);
            eiri(lain, lain.dvr.testkit_memory);
           // eiri(lain, lain.rom.enclose_draggable(lain.dvr.testkit_regen_html), document.body);  
           // eiri(lain, lain.rom.enclose_draggable(lain.dvr.testkit_csspaint_html), document.body);
           //eiri(lain, lain.rom.enclose_draggable(lain.dvr.testkit_atc_html), document.body);
           // eiri(lain, lain.rom.enclose_draggable(lain.dvr.testkit_clerk_html), document.body);
           // eiri(lain, lain.rom.enclose_draggable(lain.dvr.testkit_kiosk_html), document.body);
        }
        lain.rom.demo_proc();
        `
    },
}
Object.keys(content).forEach(key => {
    const jsonString = JSON.stringify(content[key], null, 2);
    fs.writeFile(`json_output/${key}.json`, jsonString, (err) => {
        if (err) {
            console.error(`Error writing to file ${key}.json`, err);
        } else {
            console.log(`JSON string has been written to ${key}.json`);
        }
    });
});