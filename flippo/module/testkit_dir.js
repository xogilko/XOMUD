const testkit_dir = {
    "xotestkit_in":{
        "uri": "xo.05919057190759",
        "urns": "xotestkit",
        "kind": "interpreter",
        "name": "'xotestkit' urns interpreter",
        "media": `
        lain.rom.xotestkit_handler = {
            pendingAsyncOps: 0,
            allAsyncOpsResolvedCallback: null,
        
            js: (input) => {
                if (lain.cache.find(obj => { return Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key]); }) === undefined) {
                    try { eval(input.media); input.step = lain.proc.length; lain.cache.push(input); }
                    catch (error) { console.log('failed to evaluate function(s)', input.name, 'due to error:', error) }
                } else { console.log('function(s) already cached') }
            },
        
            jsmod: (input) => {
                if (lain.cache.find(obj => { return Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key]); }) === undefined) {
                    try {
                        const fetchModuleAndImport = async (moduleURL) => {
                            try {
                                const module = await import(moduleURL);
                                if (module.activate_module) {
                                    module.activate_module(lain);
                                    console.log('Module imported with activation:', input.name);
                                } else {
                                    console.log('Module imported without activation:', input.name);
                                }
                            } catch (error) {
                                console.error('Error importing module:', error);
                            } finally {
                                lain.rom.xotestkit_handler.pendingAsyncOps--;
                                if (lain.rom.xotestkit_handler.pendingAsyncOps === 0 && lain.rom.xotestkit_handler.allAsyncOpsResolvedCallback) {
                                    lain.rom.xotestkit_handler.allAsyncOpsResolvedCallback();
                                }
                            }
                        };
                        const moduleURL = input.media;
                        const directURL = lain.portal + moduleURL;
                        console.log('importing async:', input.name);
                        lain.rom.xotestkit_handler.pendingAsyncOps++;
                        fetchModuleAndImport(directURL);
                        input.step = lain.proc.length;
                        lain.cache.push(input);
                    } catch (error) { console.log('failed to evaluate function(s)', input.name, 'due to error:', error) }
                } else { console.log('function(s) already cached') }
            },
        
            html: (input, target) => {
                if (input.hasOwnProperty('count')) {
                    const matches = lain.cache.filter(obj => {
                        return Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key]);
                    });
                    if (matches.length >= input.count) {
                        console.log('item has met cache limit:', matches.length);
                        return;
                    }
                }
                var container = document.createElement("div");
                container.innerHTML = input.media;
                input.step = lain.proc.length;
                Array.from(container.childNodes).forEach(node => {
                    if (node.nodeType === 1) {
                        input.domset = lain.domset++;
                        node.setAttribute("data-set", input.domset);
                        node.setAttribute("data-step", input.step);
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
                    target.insertBefore(container.firstChild, target.firstChild);
                }
                lain.cache.push(input);
                let kidfunc = lain.dir[input.child];
                if (kidfunc !== undefined) {
                    if (kidfunc) { eiri(lain, kidfunc); }
                    else { console.log("child func of", input.name, "not found"); }
                }
            }
        };

        class MySecureElement extends HTMLElement {
            constructor() {
                super();
                const shadowRoot = this.attachShadow({ mode: 'closed' });
            
                const wrapper = document.createElement('div');
                
                shadowRoot.appendChild(wrapper);
                this.wrapper = wrapper;
            }
            secure(child) {
                this.wrapper.appendChild(child);
            }
        }
        if (!customElements.get('testkit-shadow')) {
            customElements.define('testkit-shadow', MySecureElement);
        }

        console.log('interpreter registered with callback:', lain.portal);`
    },
    "testkit_style_html":{
        "uri": "xo.764906239052624667",
        "urns": "xotestkit",
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
        </style>
        `
    },
    "htmx_observe":{
        "uri": "xo.12985719056914601",
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "dynamic htmx observer",
        "media": "/flippo/dirmod/testkit_dir/htmx_observe.js"
    },
    "bsv_script":{
        "uri": "xo.12591903790136",
        "urns": "xotestkit",
        "kind": "js",
        "name": "bsv library 1.5.6",
        "media": `
        new Promise((resolve, reject) => {
            var src = "https://star.xomud.quest/quest/dirmod/lib/bsv.min.js";
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
    "testkit_shop_html":{
        "uri": "xo.1294189056906",
        "urns": "xotestkit",
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
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "testkit shop applet",
        "media": "/flippo/dirmod/testkit_dir/testkit_shop.js"
    },
    "fishtext":{
        "uri": "xo.1358356737564645646",
        "urns": "xotestkit",
        "kind": "html",
        "name": "fishtext",
        "child": "testkit_maritime",
        "media": '<div id="fishtext"></div>'
    },
    "testkit_maritime":{
        "uri": "xo.10597953363777764",
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "testkit maritime",
        "media": "/flippo/dirmod/fish.js"
    },
    "navi_splash":{
        "uri": "xo.5906239056059015",
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "navi splash",
        "media": "/quest/dirmod/splash.js"
    },
    "testkit_kiosk_html":{
        "uri": "xo.1294189056906",
        "urns": "xotestkit",
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
        <!--
        <br><input type = "text" id = "testkit_kiosk_inputForTX_script" placeholder = "memo">
        <select id="testkit_inputForTX_script_select">
        <option value = "data">memo</option>
        <option value = "asm">asm</option>
        </select>
        -->
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
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "testkit kiosk applet",
        "media": "/flippo/dirmod/testkit_dir/testkit_kiosk.js"
    },
    "htmx_import":{
        "uri": "xo.103901390590134576",
        "urns": "xotestkit",
        "kind": "js",
        "name": "htmx library 1.9.11",
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
    "htmx_script":{
        "uri": "xo.5906239056059015",
        "urns": "xotestkit",
        "kind": "html",
        "name": "htmx script 1.9.11",
        "media": `
        <script src="https://unpkg.com/htmx.org@1.9.11"></script>`
    },
    "testkit_dragtest":{
        "uri": "xo.307902690246343334",
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
        "uri": "xo.9672303456646593015",
        "urns": "xotestkit",
        "kind": "html",
        "name": "testkit atc widget via quest",
        "child": "testkit_atc_func",
        "count": 1,
        "media": `
        <div>
        <div id="testkit_atc" style="width:555px;height:150px;line-height:1em;overflow-y:scroll;padding-bottom:5px;">
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
        "urns": "xotestkit",
        "kind": "js",
        "name": "testkit atc applet",
        "media": `
        lain.rom.testkit_atc = (action = 'init_and_callback') => {
            if (action === 'init_and_callback' || action === 'init') {
                const stringArray = ["/quest/ testkit cli (type & send 'help')", "(っ◔◡◔)っ✩"];
                stringArray.forEach(item => {
                    commandFeed.insertAdjacentHTML('beforeend', '<li>' + item + '</li>');
                });
            }
            if (action === 'callback') {
                commandFeed.insertAdjacentHTML('beforeend', '<li><b><i>' + lain.sign + '></i></b> ' + qomms_entry_value + '</li>');
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
                atc_inputarea.innerHTML = '<br><input type = "text" id="qomms_entry" placeholder = ">..."><button id="testkit_atc_client_submit">eval</button>';
                testkit_atc_client_submit.addEventListener('click', function() {
                    if (confirm("ATC requests permission to execute a command!")){
                        commandFeed.insertAdjacentHTML('beforeend', '<li>' + qomms_entry.value + '</li>');
                        try {
                            const result = eval(qomms_entry.value);
                            commandFeed.insertAdjacentHTML('beforeend', '<li><i>' + result + '</i></li>');
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
            'atc_temp_domain': (element) => {
                element.innerHTML = lain.domain;
            },
            'atc_temp_portal': (element) => {
                element.innerHTML = lain.portal;
            },
            'atc_temp_uri': (element) => {
                element.innerHTML = document.querySelector('meta[portal][uri]').getAttribute('uri');
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
    "testkit_menu_html":{
        "uri": "xo.10357109570198666",
        "urns": "xotestkit",
        "kind": "html",
        "name": "testkit menu widget",
        "child": "testkit_menu_func",
        "count": 1,
        "media": `
        <span>
        <div id="testkit_menu">
        <i>testkit tools</i><hr>
        <select id="testkit_menuSelect" size="8">
        <option value = "testkit_atc_html">atc</option>
        <option value = "testkit_clerk_html">clerk</option>
        <option value = "testkit_kiosk_html">kiosk</option>
        <option value = "testkit_csspaint_html">csspaint</option>
        <option value = "testkit_regen_html">regen</option>
        <option value = "testkit_shop_html">shop</option>
        <option value = "testkit_store_gate_html">storegate</option>
        <option value = "testkit_mount_html">satamount</option>
        </select><br>
        <button id="testkit_menuStart">start</button>
        <span id= 'testkit_blinker'></span><hr>
        <button id="testkit_menuClear">clear navi</button>
        </span>
        `
    },
    "testkit_menu_func":{
        "uri": "xo.1591340569834601786",
        "urns": "xotestkit",
        "kind": "js",
        "name": "testkit menu applet",
        "media": `
        lain.rom.testkit_menu = (() => {
            // Blinkenlights
            let console_count = [];
            let isBlinkerRunning = false;
            const blinker = document.getElementById('testkit_blinker');

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
            // Testkit Apps
            document.getElementById('testkit_menuStart').addEventListener('click', function() {
                navi(alice, 'lain.rom.enclose_draggable(alice.dir.' + testkit_menuSelect.value + ')', 'document.body');
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
                    
                    const request = indexedDB.open('tomb', 2);
                    request.onsuccess = function(event) {
                        const db = event.target.result;
                        const transaction = db.transaction(['pyre'], 'readwrite');
                        const pyre = transaction.objectStore('pyre');
                        const deleteRequest = pyre.delete('1');
                        deleteRequest.onsuccess = function() {
                            location.reload();
                            console.log("Datastore deleted successfully");
                        };
                        deleteRequest.onerror = function() {
                            console.error("Error deleting datastore");
                        };
                    };
                }
            });
        })();
        `
    },
    "testkit_destroy":{
        "uri": "xo.15901360516061",
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "destroy via cache",
        "media": "/flippo/dirmod/testkit_dir/testkit_destroy.js"
    },
    "drag_functions":{
        "uri": "xo.1346901349050946",
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "draggable divs controller",
        "media": "/flippo/dirmod/testkit_dir/drag_functions.js"
    },
    "testkit_clerk_html":{
        "uri": "xo.13904517903346136136",
        "urns": "xotestkit",
        "kind": "html",
        "name": "testkit clerk widget",
        "child": "testkit_clerk_func",
        "count": 1,
        "media": `
        <div>
        <select id="testkit_clerkSelect">
        <option value = "cache">cache</option>
        <option value = "rom">rom</option>
        <option value = "dir">dir</option>
        <option value = "ls">ls</option>
        <option value = "db">db</option>
        </select>
        <button id="testkit_clerkButton">refresh</button>
        <input type = "text" id = "testkit_clerk_rqinput" placeholder = 'request module via path'>
        <button id="testkit_clerk_rqButton">request</button>
        <br><span id="testkit_clerkSelectDesc"></span><hr>
        <div id="testkit_clerk" style="max-height: 400px; overflow-y: auto;"></div>
        </div>
        `
    },
    "testkit_clerk_func": {
        "uri": "xo.575692746724068956",
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
                        htmlString += '<a href="#" id="removeCache_' + index + '">X</a> ' + item.name + '<br>';
                    });
                } else if (clerk_select.value === "rom") {
                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>da following are activated functions!</i>';
                    Object.entries(lain.rom).filter(function([key, value]) { return value !== null; })
                        .forEach(function([key, value]) {
                            htmlString += key + '()<br>';
                        });
                } else if (clerk_select.value === "dir") {
                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>heres what directory has indexed! (X to attempt build)</i>';
                    Object.entries(lain.dir).forEach(function([key, value]) {
                        if (value !== undefined) {
                            htmlString += '<a href="#" id="dir_' + key + '">X</a> ' + key + ' <i> - ' + value.name + '</i><br>';
                        }
                    });
                } else if (clerk_select.value === "ls") {
                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>keys placed in local storage:</i>';
                    Object.keys(localStorage).forEach(function(key) {
                        htmlString += + key + '<br>';
                    });
                } else if (clerk_select.value === "db") {
                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>here are objects in IndexedDB: (X to attempt dir)</i>';
                    lain.rom.dbModule.openDB().then(function() {
                        lain.db.forEach(function(id) {
                            lain.rom.dbModule.getData(id).then(function(data) {
                                if (typeof data === 'object' && data !== null) {
                                    htmlString += '<a href="#" id="moveToDir_' + id + '">X</a>' + ' id(' + id + '): ' + ( (data.file + ' ' + data.name) || 'data.name' || 'unnamed') + '<br>';
                                    targetElement.innerHTML = htmlString;
                                    document.getElementById('moveToDir_' + id).onclick = function() {
                                        alice.dir[data.file] = data;
                                        console.log('Moved ' + data.name + ' to directory under key ' + data.file);
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
            document.getElementById('testkit_clerk_rqButton').addEventListener('click', function() {
                let calling = "/quest/dirmod/" + testkit_clerk_rqinput.value;
                testkit_clerk_rqinput.value = '';
                chisa({msg: calling});
            });
        }
        lain.rom.testkit_clerk();
        `
    },
    "testkit_csspaint_html":{
        "uri": "xo.96290760257023536",
        "urns": "xotestkit",
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
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "testkit csspaint applet",
        "media": "/flippo/dirmod/testkit_dir/testkit_csspaint_func.js"
    },
    "enclose_draggable":{
        "uri": "xo.9076309520571515566",
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "enclose x in draggable div",
        "media": "/flippo/dirmod/testkit_dir/enclose_draggable.js"  
    },
    "testkit_indexedDB":{
        "uri": "xo.098067293572359340",
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "indexedDB functions",
        "media": "/flippo/dirmod/testkit_dir/indexeddb.js"  
    },
    "testkit_store_gate_html":{
        "uri": "xo.346975705910570175",
        "urns": "xotestkit",
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
        <option value = "b2ls">dir -> ls</option>
        <option value = "ls2b">ls -> dir</option>
        <option value = "b2db">dir -> db</option>
        <option value = "db2b">db -> dir</option>
        </select>
        <button id="testkit_store_gate_Button">move!</button>
        </div>
        `
    },
    "testkit_store_gate_func":{
        "uri": "xo.6767690457739309523",
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "testkit move! applet",
        "media": "/flippo/dirmod/testkit_dir/testkit_store_gate_func.js" 
    },
    "testkit_suddendeath":{
        "uri": "xo.987349053796",
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "testkit suddendeath",
        "media": "/flippo/dirmod/testkit_dir/suddendeath.js" 
    },
    "demo_proc":{
        "uri": "xo.190571057013560106038",
        "urns": "xotestkit",
        "kind": "js",
        "name": "testkit demo setup!",
        "media": `
        lain.rom.demo_proc = () => {
            //if (localStorage.getItem('default_navi')
            eiri(lain, lain.dir.navi_splash);
            eiri(lain, lain.dir.testkit_style_html, document.head);  
            eiri(lain, lain.dir.drag_functions);
            eiri(lain, lain.dir.enclose_draggable);
            eiri(lain, lain.dir.testkit_indexedDB);
            eiri(lain, lain.dir.bsv_script);
            eiri(lain, lain.dir.htmx_import);
            eiri(lain, lain.dir.css_manager);
            eiri(lain, lain.dir.dom_reporter);
            eiri(lain, lain.dir.dom_reassignment);
            eiri(lain, lain.dir.navi_exporter);
            eiri(lain, lain.dir.testkit_grave);
            eiri(lain, lain.dir.htmx_observe);
            eiri(lain, lain.dir.testkit_destroy);
            eiri(lain, lain.dir.testkit_suddendeath);
           // eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_regen_html), document.body);  
           // eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_csspaint_html), document.body);
           //eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_atc_html), document.body);
           // eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_clerk_html), document.body);
           // eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_kiosk_html), document.body);
        }
        lain.rom.demo_proc();
        `
    },
    "skelly_proc":{
        "uri": "xo.981896021340505556",
        "urns": "xotestkit",
        "kind": "js",
        "name": "testkit skelly setup!",
        "media": `
        lain.rom.skelly_proc = () => {
            //if (localStorage.getItem('default_navi')
            eiri(lain, lain.dir.testkit_destroy);
            eiri(lain, lain.dir.css_manager);
            eiri(lain, lain.dir.dom_reassignment);
            eiri(lain, lain.dir.testkit_grave);
            const wake = () => {
                if (typeof lain.rom.removeCacheItem === 'function' && typeof lain.rom.manageCSS === 'function' && typeof lain.rom.testkit_grave === 'function') {
                    console.log('...mourning!');
                    lain.rom.testkit_grave().deadgen('suddendeath');
                } else {
                    setTimeout(wake, 200); // Check again after 200ms if functions are not available
                }
            };
            wake();
        }
        lain.rom.skelly_proc();
        `
    },
    "test_name_reproc":{
        "uri": "xo.2346903701358935",
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
        "uri": "xo.87468435648701234",
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "edit/create css manager",
        "media": "/flippo/dirmod/testkit_dir/css_manager.js"
    },
    "dom_reporter":{
        "uri": "xo.5475837342346844768768",
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
                        attributes: {},
                        misc: {}
                    };
                    for (let i = 0; i < attributes.length; i++) {
                        const attr = attributes[i];
                        elementInfo.attributes[attr.nodeName] = attr.nodeValue;
                    }
                    elementInfo.misc['width'] = element.offsetWidth;
                    elementInfo.misc['height'] = element.offsetHeight;
                    domReport.push(elementInfo);
                }
            });
            return domReport;
        }
        `
    },
    "navi_exporter":{
        "uri": "xo.73687385434867682",
        "urns": "xotestkit",
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
                
                /* trimmer breaks domset atm

                navi_export.proc.forEach((procEntry, index) => {
                    const stepIndex = index.toString();
                    const matchingDomEntry = navi_export.dom.find(domEntry => 
                        domEntry.attributes && domEntry.attributes['data-step'] === stepIndex
                    );
        
                    if (!matchingDomEntry) {
                        // Update proc entry if no matching dom entry is found
                        navi_export.proc[index] = ["specialCondition", "document.body"];
                    }
                });
                */
            }
            return {
                navi_export
            };
        }
        `
    },
    "dom_reassignment":{
        "uri": "xo.58753544223475875324",
        "urns": "xotestkit",
        "kind": "js",
        "name": "reassign elements to export",
        "media": `
        lain.rom.testkit_reassign = (dom_new) => {
            console.log("reassigning dom based on:", dom_new);
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
        
            // Set to track data-set values in dom_new for comparison
            const newDataSets = new Set(dom_new.map(elementInfo => elementInfo.attributes['data-set']));
        
            // Proceed with the comparison and reassignment
            dom_new.forEach(elementInfo => {
                const entry_domset_value = elementInfo.attributes['data-set'];
                const element = dom_current_map.get(entry_domset_value); //element is live match
                if (element) {
                    // Update the attributes of the matched element to match those in dom_new
                    Object.entries(elementInfo.attributes).forEach(([attrName, attrValue]) => {
                        element.setAttribute(attrName, attrValue);
                    });
                    
                    Object.entries(elementInfo.misc).forEach(([attrName, attrValue]) => {
                        element.style[attrName] = attrValue;
                    });
        
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

                    //element.parentElement.removeChild(element);
                    var dataSet = parseInt(domset, 10);
                    var cacheIndex = lain.cache.findIndex(function(item) { return item.domset === dataSet; });
                    if (cacheIndex !== -1) {   
                        lain.rom.removeCacheItem({ index: cacheIndex });
                    } else {
                        console.log('couldnt find cache for destruction of:', element)
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
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "grave matters",
        "media": "/flippo/dirmod/testkit_dir/testkit_grave.js"
    },
    "testkit_regen_html":{
        "uri": "xo.7685575453425453742122",
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
        "uri": "xo.1321346875468776",
        "urns": "xotestkit",
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
        "urns": "xotestkit",
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
        "urns": "xotestkit",
        "kind": "js",
        "name": "satalite mounting applet",
        "media": `
        `
    },
    "testkit_keychain_html":{
        "uri": "xo.9090876265572",
        "urns": "xotestkit",
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
        "urns": "xotestkit",
        "kind": "jsmod",
        "name": "shadow keychain applet",
        "media": "/quest/dirmod/testkit_dir/testkit_keychain.js"
    },
}
try{
Object.keys(testkit_dir).forEach(key => {
    alice.dir[key] = testkit_dir[key];
});
console.log("xotestkit directory deployed")

//service worker

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
            console.log('service Worker registered with scope:', registration.scope);
            if (!navigator.serviceWorker.controller) {
                console.log('service Worker is not controlling the page. Reloading...');
                window.location.reload();
            }
        }).catch(function(error) {
            console.error('service Worker registration failed:', error);
        });
} else {
    console.log('no service worker for persistence :( ')
}

//state persistence logic

function checkIndexedDBAndExecute() {
    const request = indexedDB.open('tomb', 2);
    let upgradeNeeded = false;
    request.onerror = function(event) {
        console.error('Database error:', event.target.errorCode);
    };
    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('pyre')) {
            db.createObjectStore('pyre', { keyPath: 'id', autoIncrement: true });
            console.log('...out of nothing...');
            navi(alice, 'alice.dir.demo_proc');
            upgradeNeeded = true;
        }
    };
    request.onsuccess = function(event) {
        if (upgradeNeeded) return;
        const db = event.target.result;

        if (!db.objectStoreNames.contains('pyre')) {
            // Object store does not exist
            console.log('...out of oblivion!...');
            navi(alice, 'alice.dir.demo_proc');
            return;
        }

        const transaction = db.transaction(['pyre'], 'readonly');
        const pyre = transaction.objectStore('pyre');
        const exhume = pyre.count();

        exhume.onsuccess = function() {
            if (exhume.result === 0) {
                console.log('...tomb is empty...')
                navi(alice, 'alice.dir.demo_proc');
            } else {
                console.log('a skeleton remembers...');
                const getRequest = pyre.getAll();
                getRequest.onsuccess = function(event) {
                    const result = event.target.result[0].data; // Assuming only one object
                    if (result) {
                        // Move the object to alice.dir
                        alice.dir[result.file] = result;
                        
                        console.log('it turns...');
                        navi(alice, 'alice.dir.skelly_proc');
                        
                    }
                };

                getRequest.onerror = function(event) {
                    console.error('Get request error:', event.target.errorCode);
                };
            }
        };

        exhume.onerror = function(event) {
            console.error('exhumation failed:', event.target.errorCode);
        };
    };
}
checkIndexedDBAndExecute();
} catch (error) {
    console.log("failed to append testkit_dir to alice:", error);
}