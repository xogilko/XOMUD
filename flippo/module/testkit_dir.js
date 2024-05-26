const testkit_dir = {
    "xotestkit_in":{
        "uri": "xo.05919057190759",
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
            jsmod: (input) => {
                if (lain.cache.find(obj => {return Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key]);}) === undefined){
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
                            }
                        };
                        const moduleURL = input.media;
                        const directURL = lain.portal + moduleURL;
                        console.log('importing async:', input.name);
                        fetchModuleAndImport(directURL);
                        lain.cache.push(input);}
                    catch (error) {console.log('failed to evaluate function(s)', input.name, 'due to error:', error)}
                } else {console.log('function(s) already cached')}
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
                    target.insertBefore(container.firstChild, target.firstChild);
                } 
                lain.cache.push(input);
                let kidfunc = lain.dir[input.child];
                if (kidfunc !== undefined){
                    if (kidfunc){eiri(lain, kidfunc);}
                    else {console.log("child func of", input.name, "not found");}
                }
            }
        };
        console.log('interpreter registered with callback:', lain.portal);
        `
    },
    "testkit_style_html":{
        "uri": "xo.764906239052624667",
        "urns": "xotestkit",
        "kind": "html",
        "name": "testkit styles :)",
        "media": `
        <style>
            body {
            background-color: cyan;
            }
            .draggable {
            padding: 2px;
            background-color: silver;
            line-height: normal;
            position: absolute;
            cursor: move;
            }
            .dragged_content {
            padding: 10px;
            background-color: #fafafa;
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
            const script = document.createElement('script');
            script.src = "https://unpkg.com/bsv@1.5.6/bsv.min.js";
            script.onload = () => resolve(window.bsv);
            script.onerror = reject;
            document.head.appendChild(script);
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
        <span>
        <div id="testkit_shop">
        <b>department:</b>
        <input type = "text" id="testkit_shop_depart" placeholder="department" value="Bob's Shop">
        <button id="testkit_shop_refresh">refresh</button>
        <br><i>receipts must have offer hash in memo</i>
        <hr>
        <div id="testkit_shop_list"></div>
        </div>
        </span>
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
    "testkit_kiosk_html":{
        "uri": "xo.1294189056906",
        "urns": "xotestkit",
        "kind": "html",
        "name": "testkit kiosk widget",
        "child": "testkit_kiosk_func",
        "count": 1,
        "media": `
        <span>
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
        <br><input type = "text" id = "testkit_kiosk_inputForTX_utxo" placeholder = "UTXO address">
        <input type = "text" id = "testkit_kiosk_inputForTX_pubkey" placeholder = "UTXO public key">
        <input type = "checkbox" id = "testkit_kiosk_inputForTX_confirm" name="confirm"/>confirmed
        <br><input type = "text" id = "testkit_kiosk_inputForTX_change" placeholder = "change address">
        <input type = "text" id = "testkit_kiosk_inputForTX_amount" placeholder = "spend amount">
        <br><input type = "text" id = "testkit_kiosk_inputForTX_target" placeholder = "target address">
        <input type = "text" id = "testkit_kiosk_inputForTX_sign" placeholder = "signing private key">
        <br><input type = "text" id = "testkit_kiosk_inputForTX_script" placeholder = "memo">
        <select id="testkit_inputForTX_script_select">
        <option value = "data">memo</option>
        <option value = "asm">asm</option>
        </select>
        <button id="testkit_kiosk_makeTX_button">make tx</button>
        <p><span id="testkit_kiosk_TX_ID"></span></p>
        </div>
        </span>
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
        <span>
        <div id="testkit_atc" style="width:500px;height:150px;line-height:1em;overflow-y:scroll;padding-bottom:5px;">
        <ul id="qomms">
        </ul>
        </div>
        <form onsubmit="alice.rom.testkit_atc('callback')" hx-post="http://localhost:8080/flippo/command/" hx-trigger="submit" hx-target="#qomms" hx-swap="beforeend">
        <input type = "text" name = "set-message" id = "qomms-entry" placeholder = "contact server">
        <input type = "submit" value = "send">
        </form>
        </span>
        `
    },
    "testkit_atc_func":{
        "uri": "xo.13905760624562462",
        "urns": "xotestkit",
        "kind": "js",
        "name": "testkit atc applet",
        "media": `
        lain.rom.testkit_atc = (action = 'init_and_callback') => {
            const commandFeed = document.getElementById("qomms");
            const scrollCli = document.getElementById('testkit_atc');
            const entryMessage = document.getElementById('qomms-entry');
            if (action === 'init_and_callback' || action === 'init') {
                const stringArray = ["xomud test area", "alice = present state", "navi(alice, 'proc', ...rest)", "(っ◔◡◔)っ✩"];
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
        <select id="testkit_menuSelect" multiple size="7">
        <option value = "testkit_atc_html">atc</option>
        <option value = "testkit_clerk_html">clerk</option>
        <option value = "testkit_kiosk_html">kiosk</option>
        <option value = "testkit_csspaint_html">csspaint</option>
        <option value = "testkit_regen_html">regen</option>
        <option value = "testkit_shop_html">shop</option>
        <option value = "testkit_store_gate_html">storegate</option>
        </select><br>
        <button id="testkit_menuStart">start</button>
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
            alice['launch'] = [];
            let launch = alice.launch;
            function launchMethod(select) {
                console.log('select:', select)
                eiri(lain, lain.rom.enclose_draggable(select), document.body);
                const lastCacheItem = lain.cache[lain.cache.length - 2].domset;
                console.log(lastCacheItem)
                launch.push({ key: select, domset: lastCacheItem });
                console.log('Launched:', launch[launch.length - 1]);
            }
            document.getElementById('testkit_menuStart').addEventListener('click', function() {
                navi(alice, 'specialCondition', 'alice.rom.testkit_menu.launchMethod(alice.dir.' + testkit_menuSelect.value + ')');
            });
            return {
                launchMethod
            };
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
        <div id="testkit_retouch">
        <input type = "text" id = "retouchClass" value = "body">
        <input type = "text" id = "retouchProperty" value = "background-color">
        <input type = "text" id = "retouchValue" value = "cyan">
        <button id="testkit_retouchButton">retouch</button>
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
    "demo_proc":{
        "uri": "xo.190571057013560106038",
        "urns": "xotestkit",
        "kind": "js",
        "name": "testkit demo setup!",
        "media": `
        lain.rom.demo_proc = () => {
            //if (localStorage.getItem('default_navi')
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
            eiri(lain, lain.dir.htmx_observe);
            eiri(lain, lain.dir.testkit_destroy);
            const checkAndExecute = () => {
                if (typeof lain.rom.enclose_draggable === 'function' && typeof lain.rom.drag_init === 'function') {
                    eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_menu_html), document.body);
                } else {
                    setTimeout(checkAndExecute, 100);
                }
            };
           checkAndExecute();
            
           // eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_regen_html), document.body);  
           // eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_csspaint_html), document.body);
           //eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_atc_html), document.body);
           // eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_clerk_html), document.body);
           // eiri(lain, lain.rom.enclose_draggable(lain.dir.testkit_kiosk_html), document.body);
        }
        lain.rom.demo_proc();
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
        "uri": "xo.73687385434867682",
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
        "uri": "xo.58753544223475875324",
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
        lain.rom.testkit_regen = () => {
            const removeAllStylesheets = () => {
                //const linkStylesheets = document.querySelectorAll('link[rel="stylesheet"]');
                //linkStylesheets.forEach(link => link.parentNode.removeChild(link));

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
                    lain.dir[label].file = label;
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
                        if (cacheItem && cacheItem.uri === "xo.15901360516061") {continue;}
                        lain.rom.removeCacheItem({index: i});
                    }
                    const removeCacheItemIndex = lain.cache.findIndex(item => item && item.uri === "xo.15901360516061");
                    if (removeCacheItemIndex !== -1) {
                        console.log("manual removal");
                        lain.rom.removeCacheItem({index: removeCacheItemIndex});  
                    }
                    console.log('cache is..');
                    console.log(lain.cache);
                    lain.cache = [];
                    console.log('tossed', lain.cache)
                    removeAllStylesheets();
                    lain.domset= 0; // dom is cleared
                    //run proc, then dom_reassignment, then style
                    lain.proc = [];
                    console.log(skeleton.navi_export.proc, 'old proc:', lain.proc);
                    skeleton.navi_export.proc.forEach(args => {
                        let specialCondition = "specialCondition";
                        let rest = args.map(arg => eval(arg));
                        navi(lain, ...rest);
                    });
                    lain.rom.testkit_reassign(skeleton.navi_export.dom.domReport);                
                    lain.rom.manageCSS().applyStylesheet(skeleton.navi_export.css);
                    console.log("and we're back");

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
try{
Object.keys(testkit_dir).forEach(key => {
    alice.dir[key] = testkit_dir[key];
});
console.log("xotestkit directory deployed")
navi(alice, 'alice.dir.demo_proc');
} catch (error) {
    console.log("failed to append testkit_dir to alice:", error);
}