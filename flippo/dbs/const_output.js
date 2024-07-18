const content = {
  "bsv_script": {
    "uri": "xo.12591903790136",
    "aux": "testkit",
    "kind": "js",
    "name": "bsv library 1.5.6",
    "media": "\n        new Promise((resolve, reject) => {\n            var src = lain.portal + \"/quest/lib/bsv.min.js\";\n            // Check if the script already exists\n            if (!document.querySelector('script[src=\"' + src + '\"]')) {\n                var script = document.createElement('script');\n                script.src = src;\n                script.onload = function() { resolve(window.bsv); };\n                script.onerror = reject;\n                document.head.appendChild(script);\n            } else {\n                // Resolve with the existing script\n                resolve(window.bsv);\n            }\n        });"
  },
  "css_manager": {
    "uri": "xo.87468435648701234",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "edit/create css manager",
    "media": "/quest/mod/testkit_dir/css_manager.js"
  },
  "demo_proc": {
    "uri": "xo.190571057013560106038",
    "aux": "testkit",
    "kind": "js",
    "name": "testkit demo setup!",
    "media": "\n        lain.rom.demo_proc = () => {\n            //if (localStorage.getItem('default_navi')\n            eiri(lain, lain.dvr.navi_splash);\n            eiri(lain, lain.dvr.testkit_style_html, document.head);  \n            eiri(lain, lain.dvr.drag_functions);\n            eiri(lain, lain.dvr.enclose_draggable);\n            eiri(lain, lain.dvr.testkit_indexedDB);\n            eiri(lain, lain.dvr.bsv_script);\n            eiri(lain, lain.dvr.htmx_script);\n            eiri(lain, lain.dvr.css_manager);\n            eiri(lain, lain.dvr.dom_reporter);\n            eiri(lain, lain.dvr.dom_reassignment);\n            eiri(lain, lain.dvr.navi_exporter);\n            eiri(lain, lain.dvr.testkit_grave);\n            eiri(lain, lain.dvr.htmx_observe);\n            eiri(lain, lain.dvr.testkit_destroy);\n            eiri(lain, lain.dvr.testkit_memory);\n           // eiri(lain, lain.rom.enclose_draggable(lain.dvr.testkit_regen_html), document.body);  \n           // eiri(lain, lain.rom.enclose_draggable(lain.dvr.testkit_csspaint_html), document.body);\n           //eiri(lain, lain.rom.enclose_draggable(lain.dvr.testkit_atc_html), document.body);\n           // eiri(lain, lain.rom.enclose_draggable(lain.dvr.testkit_clerk_html), document.body);\n           // eiri(lain, lain.rom.enclose_draggable(lain.dvr.testkit_kiosk_html), document.body);\n        }\n        lain.rom.demo_proc();\n        "
  },
  "dom_reassignment": {
    "uri": "xo.58753544223475875324",
    "aux": "testkit",
    "kind": "js",
    "name": "reassign elements to export",
    "media": "\n        lain.rom.testkit_reassign = (dom_new) => {\n\n            const dom_current_map = new Map();       \n            // Populate the map and check for duplicates\n            document.querySelectorAll('[data-set]').forEach(element => {\n                const dataSetValue = element.getAttribute('data-set');\n                if (dom_current_map.has(dataSetValue)) {\n                    // If duplicate, remove the existing element from the DOM\n                    const existingElement = dom_current_map.get(dataSetValue);\n                    existingElement.parentElement.removeChild(existingElement);\n                }\n                dom_current_map.set(dataSetValue, element);\n            });\n            console.log(\"reassigning... to:\", dom_new, \"from:\", dom_current_map); \n            // Set to track data-set values in dom_new for comparison\n            const newDataSets = new Set(dom_new.map(elementInfo => elementInfo.attributes['data-set']));\n        \n            // Proceed with the comparison and reassignment\n            dom_new.forEach(elementInfo => {\n                const entry_domset_value = elementInfo.attributes['data-set'];\n                const element = dom_current_map.get(entry_domset_value); //element is live match\n                if (element) {\n                    // Update the attributes of the matched element to match those in dom_new\n                    Object.entries(elementInfo.attributes).forEach(([attrName, attrValue]) => {\n                        if (attrName !== 'data-step') {\n                            element.setAttribute(attrName, attrValue);\n                        }\n                    });\n                    \n                    Object.entries(elementInfo.misc).forEach(([attrName, attrValue]) => {\n                        element.style[attrName] = attrValue;\n                    });\n                    if (element.style.display === 'none' && element.style.pointerEvents === 'none') {\n                        const dataSet = parseInt(entry_domset_value, 10);\n                        const cacheIndex = lain.cache.findIndex(item => item.domset === dataSet);\n                        if (cacheIndex !== -1) {\n                            lain.cache[cacheIndex].hidden = true;\n                        }\n                    }\n                    // Clear processed entries from current map\n                    dom_current_map.delete(entry_domset_value);\n        \n                    const parentElement = element.parentElement;\n        \n                    if (parentElement.tagName.toLowerCase() === 'body') {\n                        // Check if the body has any child elements\n                        if (parentElement.firstChild) {\n                            parentElement.insertBefore(element, parentElement.firstChild);\n                        } else {\n                            parentElement.appendChild(element);\n                        }\n                    } else {\n                        parentElement.appendChild(element);\n                    }\n                }\n            });\n        \n            // Destroy elements not present in dom_new\n            dom_current_map.forEach((element, domset) => {\n                if (!newDataSets.has(domset)) {\n                    console.log(newDataSets, domset, element)\n                    //element.parentElement.removeChild(element);\n                    var dataSet = parseInt(domset, 10);\n                    var cacheIndex = lain.cache.findIndex(function(item) { return item.domset === dataSet; });\n                    if (cacheIndex !== -1) {   \n                        lain.rom.removeCacheItem({ index: cacheIndex });\n                    } else if (element.parentElement) {\n                        element.parentElement.removeChild(element);\n                    }\n\n                    // remove cache item but what is the index?\n                }\n            });\n        \n            console.log(\"dom reassigned\");\n        };\n        "
  },
  "dom_reporter": {
    "uri": "xo.5475837342346844768768",
    "aux": "testkit",
    "kind": "js",
    "name": "data-set tree reporter",
    "media": "\n        lain.rom.reportDOM = () => {\n            const allElements = document.querySelectorAll('*');\n            const domReport = [];\n            allElements.forEach(element => {\n                if (element.hasAttribute(\"data-set\")) {\n                    const tagName = element.tagName.toLowerCase();\n                    const attributes = element.attributes;\n                    const elementInfo = {\n                        tagName: tagName,\n                        attributes: {},\n                        misc: {}\n                    };\n                    for (let i = 0; i < attributes.length; i++) {\n                        const attr = attributes[i];\n                        elementInfo.attributes[attr.nodeName] = attr.nodeValue;\n                    }\n                    let parentElement = element;\n                    let allParentsVisible = true;\n                    while (parentElement) {\n                        if (parentElement.style.display === 'none' || parentElement.style.pointerEvents === 'none') {\n                            allParentsVisible = false;\n                            break;\n                        }\n                        parentElement = parentElement.parentElement;\n                    }\n\n                    if (allParentsVisible) {\n                        elementInfo.misc['width'] = element.offsetWidth;\n                        elementInfo.misc['height'] = element.offsetHeight;\n                    }\n                    domReport.push(elementInfo);\n                }\n            });\n            return domReport;\n        }\n        "
  },
  "drag_functions": {
    "uri": "xo.1346901349050946",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "draggable divs controller",
    "media": "/quest/mod/testkit_dir/drag_functions.js"
  },
  "enclose_draggable": {
    "uri": "xo.9076309520571515566",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "enclose x in draggable div",
    "media": "/quest/mod/testkit_dir/enclose_draggable.js"
  },
  "fishtext": {
    "uri": "xo.1358356737564645646",
    "aux": "testkit",
    "kind": "html",
    "name": "fishtext",
    "child": "testkit_maritime",
    "media": "<div class='hyperfish'></div>"
  },
  "htmx_observe": {
    "uri": "xo.12985719056914601",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "dynamic htmx observer",
    "media": "/quest/mod/testkit_dir/htmx_observe.js"
  },
  "htmx_script": {
    "uri": "xo.103901390590134576",
    "aux": "testkit",
    "kind": "js",
    "name": "htmx library 1.9.11",
    "media": "\n            new Promise((resolve, reject) => {\n                var src = \"https://unpkg.com/htmx.org@1.9.11\";\n                // Check if the script already exists\n                if (!document.querySelector('script[src=\"' + src + '\"]')) {\n                    var script = document.createElement('script');\n                    script.src = src;\n                    script.onload = function() { \n                        resolve(window.htmx); \n                        console.log('htmx is from https://unpkg.com/htmx.org@1.9.11');\n                    };\n                    script.onerror = reject;\n                    document.head.appendChild(script);\n                } else {\n                    // Resolve with the existing script\n                    resolve(window.htmx);\n                    console.log('htmx is from https://unpkg.com/htmx.org@1.9.11');\n                }\n            })\n            console.log('htmx imported');"
  },
  "navi_exporter": {
    "uri": "xo.73687385434867682",
    "aux": "testkit",
    "kind": "js",
    "name": "exporter of navi",
    "media": "\n        lain.rom.exporter = () => {\n            //this requires css_manager + dom_reporter\n            let navi_export = {};\n            if (typeof lain.rom.reportDOM === 'function' && typeof lain.rom.manageCSS === 'function'){\n                navi_export.proc = structuredClone(lain.proc);\n                navi_export.dom = lain.rom.reportDOM();\n                navi_export.css = lain.rom.manageCSS().getCSSProperties();\n                navi_export.proc.forEach((procEntry, index) => {\n                    const stepIndex = index.toString();\n                    const matchingDomEntry = navi_export.dom.find(domEntry => \n                        domEntry.attributes && domEntry.attributes['data-step'] === stepIndex\n                    );\n                    if (!matchingDomEntry) {\n                        // Update proc entry if no matching dom entry is found\n                        if (procEntry.length > 1){\n                            navi_export.proc.splice(index, 1);\n                        } else if (!lain.cache.some(item => item.step === index) && index !== 1) {\n                            navi_export.proc.splice(index, 1);\n                        }\n                    } else {\n                        delete matchingDomEntry.attributes['data-step'];   \n                    }\n                });\n            }\n            return {\n                navi_export\n            };\n        }\n        "
  },
  "navi_splash": {
    "uri": "xo.5906239056059015",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "navi splash",
    "media": "/quest/mod/splash.js"
  },
  "skelly_proc": {
    "uri": "xo.981896021340505556",
    "aux": "testkit",
    "kind": "js",
    "name": "testkit skelly setup!",
    "media": "\n        lain.rom.skelly_proc = () => {\n            eiri(lain, lain.dvr.testkit_destroy);\n            eiri(lain, lain.dvr.css_manager);\n            eiri(lain, lain.dvr.dom_reassignment);\n            eiri(lain, lain.dvr.testkit_grave);\n            const wake = () => {\n                if (typeof lain.rom.removeCacheItem === 'function' && typeof lain.rom.removeCacheItem === 'function' && typeof lain.rom.manageCSS === 'function' && typeof lain.rom.testkit_grave === 'function') {\n                    console.log('...reborn!');\n                    lain.rom.testkit_grave().deadgen('memory');\n                } else {\n                    setTimeout(wake, 200); // Check again after 200ms if functions are not available\n                }\n            };\n            wake();\n        }\n        lain.rom.skelly_proc();\n        "
  },
  "testkit_atc_func": {
    "uri": "xo.13905760624562462",
    "aux": "testkit",
    "kind": "js",
    "name": "testkit atc applet",
    "media": "\n        lain.rom.testkit_atc = (action = 'init_and_callback') => {\n            if (action === 'init_and_callback' || action === 'init') {\n                const stringArray = [\"/quest/ testkit cli (type & send 'help')\", \"(っ◔◡◔)っ✩･ﾟ✧*･ﾟ･✶･ﾟ･ﾟ*･ﾟ･✶･ﾟ\"];\n                stringArray.forEach(item => {\n                    commandFeed.insertAdjacentHTML('beforeend', '<li>' + item + '</li>');\n                });\n            }\n            if (action === 'callback') {\n                commandFeed.insertAdjacentHTML('beforeend', '<li><b><i>' + lain.sign + '></i></b> ' + qomms_entry.value + '</li>');\n                scrollCli.scrollTop = scrollCli.scrollHeight;\n                setTimeout(() => { qomms_entry.value = ''; }, 0);\n            }\n        };\n\n            const commandFeed = document.getElementById(\"qomms\");\n            const scrollCli = document.getElementById('testkit_atc');\n        lain.rom.testkit_atc('init_and_callback');\n\n       \n        testkit_atc_mode.addEventListener('change', function() {\n            if (this.value === 'server') {\n                atc_inputarea.innerHTML = '<form onsubmit=\"alice.rom.testkit_atc(\\'callback\\')\" hx-post=\"https://star.xomud.quest/quest/command/\" hx-trigger=\"submit\" hx-target=\"#qomms\" hx-swap=\"beforeend\"><input type = \"text\" name = \"set-message\" id = \"qomms_entry\" placeholder = \"/quest/...\"><input type = \"submit\" value = \"send\"></form>';\n                htmx.process(atc_inputarea);\n            }\n            if (this.value === 'client') {\n                atc_inputarea.innerHTML = '<form id=\"testkit_atc_client\" ><input type = \"text\" id=\"qomms_entry\" placeholder = \">...\"><input type=\"submit\" value=\"eval\"></form>';\n                testkit_atc_client.addEventListener('submit', function() {\n                    event.preventDefault();\n                    if (confirm(\"ATC requests permission to execute a command!\")){\n                        commandFeed.insertAdjacentHTML('beforeend', '<li>' + qomms_entry.value + '</li>');\n                        try {\n                            const result = eval(qomms_entry.value);\n                            const resultString = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;\n                            commandFeed.insertAdjacentHTML('beforeend', '<li><i>' + resultString + '</i></li>');\n                        } catch (error) {\n                            commandFeed.insertAdjacentHTML('beforeend', '<li><i>' + error + '</i></li>');\n                        }\n                        qomms_entry.value = '';\n                    }\n                })\n            }\n\n        });\n        testkit_atc_mode.dispatchEvent(new Event('change'));\n        // client side template handling\n\n        const atc_templates = {\n            'atc_temp_channel': (element) => {\n                element.innerHTML = lain.chan;\n            },\n            'atc_temp_portal': (element) => {\n                element.innerHTML = lain.portal;\n            },\n            'atc_temp_aux': (element) => {\n                element.innerHTML = document.querySelector('meta[portal][aux]').getAttribute('aux');\n            },\n        };\n\n        const observer = new MutationObserver((mutations) => {\n            mutations.forEach((mutation) => {\n                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {\n                    // Check the last list item in the <ul>\n                    scrollCli.scrollTop = scrollCli.scrollHeight;\n                    const lastListItem = commandFeed.lastElementChild;\n                    if (lastListItem) {\n                        Object.keys(atc_templates).forEach((templateId) => {\n                            const templateElement = lastListItem.querySelector('#' + templateId);\n                            if (templateElement) {\n                                atc_templates[templateId](templateElement);\n                    }\n                });\n                };\n            };\n            });\n        });\n        observer.observe(commandFeed, { childList: true, });\n        "
  },
  "testkit_atc_html": {
    "uri": "xo.9672303456646593015",
    "aux": "testkit",
    "kind": "html",
    "name": "testkit atc widget via quest",
    "child": "testkit_atc_func",
    "count": 1,
    "media": "\n        <div>\n        <div id=\"testkit_atc\" style=\"max-width:666px;min-height:150px;line-height:1em;overflow-y:scroll;padding-bottom:5px;\">\n        <ul id=\"qomms\">\n        </ul>\n        </div>\n        <select id=\"testkit_atc_mode\">\n        <option value = \"server\">server</option>\n        <option value = \"client\">client</option>\n        </select>\n        <span id=\"atc_inputarea\">\n        <form onsubmit=\"alice.rom.testkit_atc('callback')\" hx-post=\"https://star.xomud.quest/quest/command/\" hx-trigger=\"submit\" hx-target=\"#qomms\" hx-swap=\"beforeend\">\n        <input type = \"text\" name = \"set-message\" id = \"qomms_entry\" placeholder = \"/quest/...\">\n        <input type = \"submit\" value = \"send\">\n        </form>\n        </span>\n        </div>\n        "
  },
  "testkit_clerk_func": {
    "uri": "xo.575692746724068956",
    "aux": "testkit",
    "kind": "js",
    "name": "testkit clerk applet",
    "media": "\n        lain.rom.testkit_clerk = () => {\n            const targetElement = document.getElementById(\"testkit_clerk\");\n            if (!targetElement) {\n                console.error('Target element not found');\n                return;\n            }\n            const clerk_select = document.getElementById('testkit_clerkSelect');\n            const reset = () => {\n                targetElement.innerHTML = ''; // Clear the current content\n                let htmlString = '';\n                if (clerk_select.value === \"cache\") {\n                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>da following are cached as staged! (X to destroy)</i>';\n                    lain.cache.forEach(function(item, index) {\n                        htmlString += '<a href=\"#\" id=\"removeCache_' + index + '\">X</a> ' + item.name + '<br>';\n                    });\n                } else if (clerk_select.value === \"rom\") {\n                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>da following are activated functions!</i>';\n                    Object.entries(lain.rom).filter(function([key, value]) { return value !== null; })\n                        .forEach(function([key, value]) {\n                            htmlString += key + '()<br>';\n                        });\n                } else if (clerk_select.value === \"dvr\") {\n                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>heres what dvr has indexed! (X to attempt build)</i>';\n                    Object.entries(lain.dvr).forEach(function([key, value]) {\n                        if (value !== undefined) {\n                            htmlString += '<a href=\"#\" id=\"dvr_' + key + '\">X</a> ' + key + ' <i> - ' + value.name + '</i><br>';\n                        }\n                    });\n                } else if (clerk_select.value === \"ls\") {\n                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>keys placed in local storage:</i>';\n                    Object.keys(localStorage).forEach(function(key) {\n                        htmlString += + key + '<br>';\n                    });\n                } else if (clerk_select.value === \"db\") {\n                    document.getElementById('testkit_clerkSelectDesc').innerHTML = '<i>here are objects in IndexedDB: (X to attempt dvr)</i>';\n                    lain.rom.dbModule.openDB().then(function() {\n                        lain.db.forEach(function(id) {\n                            lain.rom.dbModule.getData(id).then(function(data) {\n                                if (typeof data === 'object' && data !== null) {\n                                    htmlString += '<a href=\"#\" id=\"moveTodvr_' + id + '\">X</a>' + ' id(' + id + '): ' + ( (data.file + ' ' + data.name) || 'data.name' || 'unnamed') + '<br>';\n                                    targetElement.innerHTML = htmlString;\n                                    document.getElementById('moveTodvr_' + id).onclick = function() {\n                                        alice.dvr[data.file] = data;\n                                        console.log('Moved ' + data.name + ' to dvr under key ' + data.file);\n                                        lain.rom.dbModule.deleteData(id);\n                                        reset();\n                                        return false;\n                                    };\n                                }\n                            });\n                        });\n                    });\n                }\n                targetElement.innerHTML = htmlString;\n\n                // Attach event listeners after elements are added to the DOM\n                if (clerk_select.value === \"cache\") {\n                    lain.cache.forEach(function(item, index) {\n                        document.getElementById('removeCache_' + index).onclick = function() {\n                            console.log(item)\n                            lain.rom.removeCacheItem({index: index});\n                            reset();\n                            return false;\n                        };\n                    });\n                } else if (clerk_select.value === \"dvr\") {\n                    Object.keys(lain.dvr).forEach(function(key) {\n                        var element = document.getElementById('dvr_' + key);\n                        if (element) {\n                            element.onclick = function() {\n                                navi(alice, \"alice.dvr.\" + key, \"document.body\");\n                                return false;\n                            };\n                        }\n                    });\n                }\n                \n            };\n            reset();\n            document.getElementById('testkit_clerkButton').addEventListener('click', reset);\n            document.getElementById('testkit_clerk_rqButton').addEventListener('click', function() {\n                let rq = testkit_clerk_rqinput.value;\n                testkit_clerk_rqinput.value = '';\n                navi(lain, JSON.parse(JSON.stringify({aux: 'testkit', kind: 'jsmod', name: rq, media: '/flippo/mod/' + rq})));\n                lain.rom.testkit_handler.jsmod({kind: \"jsmod\", name: \"rqmod: \"+ rq, media: \"/quest/mod/\" + rq});\n            });\n        }\n        lain.rom.testkit_clerk();\n        "
  },
  "testkit_clerk_html": {
    "uri": "xo.13904517903346136136",
    "aux": "testkit",
    "kind": "html",
    "name": "testkit clerk widget",
    "child": "testkit_clerk_func",
    "count": 1,
    "media": "\n        <div>\n        <select id=\"testkit_clerkSelect\">\n        <option value = \"cache\">cache</option>\n        <option value = \"rom\">rom</option>\n        <option value = \"dvr\">dvr</option>\n        <option value = \"ls\">ls</option>\n        <option value = \"db\">db</option>\n        </select>\n        <button id=\"testkit_clerkButton\">refresh</button>\n        <input type = \"text\" id = \"testkit_clerk_rqinput\" placeholder = 'request mod via path'>\n        <button id=\"testkit_clerk_rqButton\">request</button>\n        <br><span id=\"testkit_clerkSelectDesc\"></span><hr>\n        <div id=\"testkit_clerk\" style=\"max-height: 400px; overflow-y: auto;\"></div>\n        </div>\n        "
  },
  "testkit_csspaint_func": {
    "uri": "xo.8957893475923050246",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "testkit csspaint applet",
    "media": "/quest/mod/testkit_dir/testkit_csspaint_func.js"
  },
  "testkit_csspaint_html": {
    "uri": "xo.96290760257023536",
    "aux": "testkit",
    "kind": "html",
    "name": "testkit csspaint widget",
    "child": "testkit_csspaint_func",
    "media": "\n        <div id=\"testkit_csspaint\">\n        <table>\n            <tr><td>class:</td><td><select id=\"retouchClass\"></select>\n            <button id=\"testkit_csspaint_refresh\">refresh</button></td></tr>\n            <tr><td>property:</td><td><input type=\"text\" id=\"retouchProperty\" value=\"background-color\"></td></tr>\n            <tr><td>value:</td><td><input type=\"text\" id=\"retouchValue\" value=\"cyan\"></td></tr>\n        </table>\n        <button id=\"testkit_csspaint_retouch\">retouch</button>\n        </div>\n        "
  },
  "testkit_destroy": {
    "uri": "xo.15901360516061",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "destroy via cache",
    "media": "/quest/mod/testkit_dir/testkit_destroy.js"
  },
  "testkit_grave": {
    "uri": "xo.166536379998776",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "grave matters",
    "media": "/quest/mod/testkit_dir/testkit_grave.js"
  },
  "testkit_in": {
    "uri": "xo.05919057190759",
    "aux": "testkit",
    "kind": "interpreter",
    "name": "'testkit' aux interpreter",
    "media": "\nlain.rom.testkit_handler = {\n    pendingAsyncOps: 0,\n    allAsyncOpsResolvedCallback: null,\n    js: (input) => {\n        if (lain.cache.find(obj => { return Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key]); }) === undefined) {\n            try { eval(input.media); input.step = lain.proc.length; lain.cache.push(input); }\n            catch (error) { console.log('failed to evaluate function(s)', input.name, 'due to error:', error) }\n        } else { console.log('function(s) already cached') }\n    },\n    jsmod: (input) => {\n        if (lain.cache.find(obj => Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key])) === undefined) {\n            try {\n                const fetchmod = async (modURL) => {\n                    const headers = new Headers();\n                    const httxid = input.httxid || lain.subs[modURL];\n                    if (httxid) {\n                        headers.append('httx', httxid);\n                    }\n                    try {\n                        const response = await fetch(lain.portal + modURL, { headers });\n                        if (!response.ok) {\n                            throw new Error('HTTP error! status: ' + response.status);\n                        }\n                        const blob = await response.blob();\n                        const objectURL = URL.createObjectURL(blob);\n                        try {\n                            const mod = await import(objectURL);\n                            URL.revokeObjectURL(objectURL);\n                            if (mod && mod.activate_module) {\n                                mod.activate_module(lain);\n                                console.log('mod imported with activation:', input.name);\n                            } else {\n                                console.log('mod imported without activation:', input.name);\n                            }\n                        } catch (importErr) {\n                            console.error('Error during mod import:', importErr);\n                        }\n                    } catch (error) {\n                        console.error('Error importing mod:', error);\n                    } finally {\n                        lain.rom.testkit_handler.pendingAsyncOps--;\n                        if (lain.rom.testkit_handler.pendingAsyncOps === 0 && lain.rom.testkit_handler.allAsyncOpsResolvedCallback) {\n                            lain.rom.testkit_handler.allAsyncOpsResolvedCallback();\n                        }\n                    }\n                };\n                const modURL = input.media;\n                console.log('importing async:', input.name);\n                lain.rom.testkit_handler.pendingAsyncOps++;\n                fetchmod(modURL);\n                input.step = lain.proc.length;\n                lain.cache.push(input);\n            } catch (error) {\n                console.log('failed to evaluate function(s)', input.name, 'due to error:', error);\n            }\n        } else {\n            console.log('function(s) already cached');\n        }\n    },\n    html: (input, target) => {\n        if (input.hasOwnProperty('count')) {\n            const matches = lain.cache.filter(obj => {\n                return Object.keys(input).every(key => obj.hasOwnProperty(key) && obj[key] === input[key]);\n            });\n            if (matches.length >= input.count) {\n                console.log('item has met cache limit:', matches.length);\n                return;\n            }\n        }\n        var container = document.createElement('div');\n        container.innerHTML = input.media;\n        input.step = lain.proc.length;\n        Array.from(container.childNodes).forEach(node => {\n            if (node.nodeType === 1) {\n                input.domset = lain.domset++;\n                node.setAttribute('data-set', input.domset);\n                node.setAttribute('data-step', input.step);\n                const assignDataSetsToChildren = (childNode) => {\n                    if (childNode.nodeType === 1) {\n                        childNode.setAttribute('data-set', lain.domset++);\n                        Array.from(childNode.children).forEach(assignDataSetsToChildren);\n                    }\n                };\n                Array.from(node.children).forEach(assignDataSetsToChildren);\n            }\n        });\n        while (container.firstChild) {\n            target.insertBefore(container.firstChild, target.firstChild);\n        }\n        const stamp = JSON.parse(JSON.stringify(input));\n        lain.cache.push(stamp);\n        let kidfunc = lain.dvr[input.child];\n        if (kidfunc !== undefined) {\n            if (kidfunc) { eiri(lain, kidfunc); }\n            else { console.log('child func of', input.name, 'not found'); }\n        }\n    }\n};\nwindow.MySecureElement = class extends HTMLElement {\n    constructor() {\n        super();\n        const shadowRoot = this.attachShadow({ mode: 'closed' });\n        const wrapper = document.createElement('div');\n        shadowRoot.appendChild(wrapper);\n        this.wrapper = wrapper;\n    }\n    secure(child) {\n        this.wrapper.appendChild(child);\n    }\n};\nif (!customElements.get('testkit-shadow')) {\n    customElements.define('testkit-shadow', MySecureElement);\n}\nconsole.log('testkit-shadow element:', MySecureElement);\nconsole.log('interpreter registered with callback:', lain.portal);\n"
  },
  "testkit_indexedDB": {
    "uri": "xo.098067293572359340",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "indexedDB functions",
    "media": "/quest/mod/testkit_dir/indexeddb.js"
  },
  "testkit_keychain_func": {
    "uri": "xo.90390009377332",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "shadow keychain applet",
    "media": "/quest/mod/testkit_dir/testkit_keychain.js"
  },
  "testkit_keychain_html": {
    "uri": "xo.9090876265572",
    "aux": "testkit",
    "kind": "html",
    "name": "shadow keychain widget",
    "child": "testkit_keychain_func",
    "media": "\n        <testkit-shadow id=\"testkit_keychain\">\n        </testkit-shadow>\n        "
  },
  "testkit_kiosk_func": {
    "uri": "xo.1051901904694690906",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "testkit kiosk applet",
    "media": "/quest/mod/testkit_dir/testkit_kiosk.js"
  },
  "testkit_kiosk_html": {
    "uri": "xo.1294189056906",
    "aux": "testkit",
    "kind": "html",
    "name": "testkit kiosk widget",
    "child": "testkit_kiosk_func",
    "count": 1,
    "media": "\n        <div>\n        <div id=\"testkit_kiosk\">\n        <input type = \"text\" id = \"testkit_kiosk_keygen_derive\" placeholder = \"optional hd key\">\n        <input type = \"checkbox\" id = \"testkit_kiosk_keygen_hdcheck\" name=\"confirm\"/>hd\n        <button id=\"testkit_kiosk_keygen_button\">generate keys</button>\n        <span id=\"testkit_kiosk_keygen_privKey\"></span>\n        <span id=\"testkit_kiosk_keygen_pubKey\"></span>\n        <span id=\"testkit_kiosk_keygen_pubAddr\"></span>\n        <hr>\n        <input type = \"text\" id = \"testkit_kiosk_inputKeyForUTXO\" placeholder = \"insert an address\">\n        <input type = \"checkbox\" id = \"testkit_kiosk_confirmForUTXO\" name=\"confirm\"/>confirmed\n        <button id=\"testkit_kiosk_getUTXO_button\">get utxo</button>\n        <span id=\"testkit_kiosk_UTXO_total\"></span>\n        <hr>\n        <input type = \"text\" id = \"testkit_kiosk_inputForTX_utxo\" placeholder = \"UTXO address\">\n        <input type = \"text\" id = \"testkit_kiosk_inputForTX_pubkey\" placeholder = \"UTXO public key\">\n        <input type = \"checkbox\" id = \"testkit_kiosk_inputForTX_confirm\" name=\"confirm\"/>confirmed\n        <br><input type = \"text\" id = \"testkit_kiosk_inputForTX_change\" placeholder = \"change address\">\n        <input type = \"text\" id = \"testkit_kiosk_inputForTX_amount\" placeholder = \"spend amount\">\n        <br><select id=\"testkit_inputForTX_lock_select\">\n        <option value = \"satalite\">Satalite Ordinal</option>\n        <option value = \"ordtxtpkh\">Text Ordinal(P2PKH)</option>\n        <option value = \"ordtxtcustom\">Text Ordinal(custom)</option>\n        <option value = \"asm\">Custom ASM</option>\n        </select>\n        \n        <span id=\"testkit_lock_inputfield\">\n        <br><textarea id=\"testkit_kiosk_inputForTX_lock\" name=\"lockvalue\" rows=\"1\" cols=\"44\" placeholder=\"memo\"></textarea>\n        </span>\n        <br><input type = \"text\" id = \"testkit_kiosk_inputForTX_sign\" placeholder = \"signing private key\"><button id=\"testkit_kiosk_fireTX_button\">fire tx</button>\n        <p><span id=\"testkit_kiosk_TX_ID\"></span></p>\n        </div>\n        </div>\n        "
  },
  "testkit_maritime": {
    "uri": "xo.10597953363777764",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "testkit maritime",
    "media": "/quest/mod/fish.js"
  },
  "testkit_memory": {
    "uri": "xo.987349053796",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "testkit memory",
    "media": "/quest/mod/testkit_dir/memory.js"
  },
  "testkit_menu_func": {
    "uri": "xo.1591340569834601786",
    "aux": "testkit",
    "kind": "js",
    "name": "testkit menu applet",
    "media": "\n        lain.rom.testkit_menu = (() => {\n            // Blinkenlights\n            let console_count = [];\n            let isBlinkerRunning = false;\n            const blinker = document.getElementById('testkit_blinker');\n            //protect menu from idiots\n            const testkitMenuDiv = document.getElementById('testkit_menu');\n            if (testkitMenuDiv && testkitMenuDiv.parentElement && testkitMenuDiv.parentElement.parentElement && testkitMenuDiv.parentElement.parentElement.parentElement) {\n                const parentParentParent = testkitMenuDiv.parentElement.parentElement.parentElement;\n                const buttonsToRemove = parentParentParent.querySelectorAll('button[onclick=\"alice.rom.hideDraggable(this);\"]');\n                buttonsToRemove.forEach(button => {\n                    button.remove();\n                });\n            }\n            const flickerBlinker = () => {\n                if (console_count.length > 0) {\n                    isBlinkerRunning = true;\n                    const { color } = console_count.shift();\n                    blinker.style.color = color;\n                    blinker.innerHTML = '';\n                    setTimeout(() => {\n                        blinker.innerHTML = '●';\n                        if (console_count.length > 0) {\n                            setTimeout(flickerBlinker, 30);\n                        } else {\n                            isBlinkerRunning = false;\n                            blinker.style.color = 'grey';\n                        }\n                    }, 60);\n                }\n            };\n\n            document.addEventListener('consolelogged', (event) => {\n                if (console_count.length > 0 && !isBlinkerRunning) {\n                    flickerBlinker();\n                }\n            });\n\n            const originalLog = console.log;\n            console.log = function(...args) {\n                console_count.push({ color: 'lime' });\n                originalLog.apply(console, args);\n                document.dispatchEvent(new CustomEvent('consolelogged', { detail: { error: false } }));\n            };\n\n            const originalError = console.error;\n            console.error = function(...args) {\n                console_count.push({ color: 'red' });\n                originalError.apply(console, args);\n                document.dispatchEvent(new CustomEvent('consolelogged', { detail: { error: true } }));\n            };\n\n            console.log('Hello, world!');\n\n            const updateHiddenList = () => {\n                const hiddenListSpan = document.getElementById('testkit_hiddenlist');\n                hiddenListSpan.innerHTML = ''; // Clear existing content\n\n                const hiddenItems = lain.cache.filter(item => item.hidden);\n\n                if (hiddenItems.length > 0) {\n                    const select = document.createElement('select');\n                    select.id = 'hiddenItemsSelect';\n                    select.style.maxWidth = '64px';\n\n                    hiddenItems.forEach((item) => {\n                        const index = lain.cache.indexOf(item);\n                        const option = document.createElement('option');\n                        option.value = index;\n                        option.text = item.name;\n                        select.appendChild(option);\n                    });\n\n                    const hr = document.createElement('hr');\n                    hiddenListSpan.appendChild(hr);\n                    hiddenListSpan.appendChild(select);\n                    const br = document.createElement('br');\n                    hiddenListSpan.appendChild(br);\n                    const unhideButton = document.createElement('button');\n                    unhideButton.textContent = 'expand';\n                    unhideButton.addEventListener('click', () => {\n                        const selectedIndex = select.value;\n                        if (selectedIndex !== '') {\n                            const cacheItem = lain.cache[selectedIndex];\n                            delete cacheItem.hidden;\n        \n                            const element = document.querySelector('[data-set=\"' + cacheItem.domset + '\"]');\n                            if (element) {\n                                element.style.display = '';\n                                element.style.pointerEvents = '';\n                            }\n                            else {\n                                console.log('cant find element')\n                            }\n                            updateHiddenList(); // Refresh the hidden list\n                        }\n                    });\n\n                    hiddenListSpan.appendChild(unhideButton);\n\n                }\n            };\n                        setTimeout(() => {\n                updateHiddenList();\n            }, 500);\n            // channel surfing\n            currentChannel.innerText = alice.chan;\n            \n            document.getElementById('setchannel_form').addEventListener('submit', function(event) {\n                event.preventDefault();\n                let channelValue = setchannel.value.toLowerCase();\n                if (channelValue.startsWith('/')) {\n                    channelValue = channelValue.substring(1);\n                }\n                if (channelValue.endsWith('/')) {\n                    channelValue = channelValue.slice(0, -1);\n                }\n                alice.chan = \"/\" + channelValue + \"/\";\n                if (alice.chan == \"/\" + channelValue + \"/\"){\n                    window.location.href = window.location.origin;\n                }\n            });\n            // Testkit Apps\n            document.getElementById('testkit_menuStart').addEventListener('click', function() {\n                navi(alice, 'lain.rom.enclose_draggable(alice.dvr.' + testkit_menuSelect.value + ')', 'document.body');\n            });\n            document.getElementById('testkit_menuSave').addEventListener('click', function() {\n                alice.rom.memory();\n            });\n            document.getElementById('testkit_menuClear').addEventListener('click', function() {\n                if (confirm(\"clearing navi to default!!\")){\n                    if ('serviceWorker' in navigator) {\n                        // Get all service worker registrations\n                        navigator.serviceWorker.getRegistrations().then(function(registrations) {\n                            for (let registration of registrations) {\n                                // Unregister each service worker\n                                registration.unregister().then(function(success) {\n                                    if (success) {\n                                        console.log('Service worker unregistered successfully.');\n                                    } else {\n                                        console.log('Service worker unregistration failed.');\n                                    }\n                                });\n                            }\n                        }).catch(function(error) {\n                            console.error('Error getting service worker registrations:', error);\n                        });\n                    } else {\n                        console.log('Service workers are not supported in this browser.');\n                    }\n                    \n                    const request = indexedDB.open('realworld', 2);\n                    request.onsuccess = function(event) {\n                        const db = event.target.result;\n                        const transaction = db.transaction(['upperlayer'], 'readwrite');\n                        const upperlayer = transaction.objectStore('upperlayer');\n                        const deleteRequest = upperlayer.delete('1');\n                        deleteRequest.onsuccess = function() {\n                            for (let i = lain.cache.length - 1; i >= 0; i--) {\n                                const cacheItem = lain.cache[i];\n                                if (cacheItem && cacheItem.uri === \"xo.15901360516061\") {\n                                    continue; // Skip this iteration\n                                }\n                                lain.rom.removeCacheItem({index: i});\n                            }\n                            location.reload();\n                            navi(alice, 'alice.dvr.demo_proc')\n                        };\n                        deleteRequest.onerror = function() {\n                            console.error(\"Error deleting datastore\");\n                        };\n                    };\n                }\n            });\n            updateHiddenList();\n            return {\n                updateHiddenList\n            };\n        })();\n        "
  },
  "testkit_menu_html": {
    "uri": "xo.10357109570198666",
    "aux": "testkit",
    "kind": "html",
    "name": "testkit menu widget",
    "child": "testkit_menu_func",
    "count": 1,
    "media": "\n        <span>\n        <div id=\"testkit_menu\">\n        <i>testing remote</i><hr>\n        <span id=\"currentChannel\"></span><br>\n        <form id=\"setchannel_form\">\n            <input style=\"max-width: 66px\" id=\"setchannel\" type=\"text\" placeholder=\"channel\"><br>\n        </form>\n        <select id=\"testkit_menuSelect\" size=\"8\">\n        <option value = \"testkit_atc_html\">atc</option>\n        <option value = \"testkit_clerk_html\">clerk</option>\n        <option value = \"testkit_kiosk_html\">kiosk</option>\n        <option value = \"testkit_csspaint_html\">csspaint</option>\n        <option value = \"testkit_regen_html\">regen</option>\n        <option value = \"testkit_shop_html\">shop</option>\n        <option value = \"testkit_store_gate_html\">storegate</option>\n        <option value = \"testkit_keychain_html\">keychain</option>\n        </select><br>\n        <button id=\"testkit_menuStart\">start</button>\n        <span id= 'testkit_blinker'></span><hr>\n        <button id=\"testkit_menuClear\">clear navi</button><br>\n        <button id=\"testkit_menuSave\">save navi</button><br>\n        <span id= 'testkit_hiddenlist'></span>\n        </span>\n        "
  },
  "testkit_mount_func": {
    "uri": "xo.13213488956468776",
    "aux": "testkit",
    "kind": "js",
    "name": "satalite mounting applet",
    "media": "\n        "
  },
  "testkit_mount_html": {
    "uri": "xo.56498453388979456",
    "aux": "testkit",
    "kind": "html",
    "name": "satalite mounting widget",
    "child": "testkit_mount_func",
    "media": "\n        <div id=\"testkit_mounting_station\">\n        INPUT:<hr>\n        <input type = \"text\" id = \"testkt_mount_input_txid\" placeholder = \"satalite txid\"><br>\n        <textarea = \"text\" id = \"testkit_mount_input_script\" placeholder = \"lock assembly\"></textarea><br>\n        <button id=\"testkit_mount_button\">mount</button><hr>\n        OUTPUT<br>\n        <span id=\"testkit_mount_output\"></span>\n        </div>\n        "
  },
  "testkit_regen_func": {
    "uri": "xo.1321346875468776",
    "aux": "testkit",
    "kind": "js",
    "name": "testkit regen applet",
    "media": "\n        document.getElementById('testkit_exportButton').addEventListener('click', function() {lain.rom.testkit_grave().skellygen(testkit_exportName.value); \n            testkit_exportName.value = '';});\n        document.getElementById('testkit_regenButton').addEventListener('click', function() {console.log('LETS REGEN'); lain.rom.testkit_grave().deadgen(testkit_regenImport.value);});\n        "
  },
  "testkit_regen_html": {
    "uri": "xo.7685575453425453742122",
    "aux": "testkit",
    "kind": "html",
    "name": "testkit regen widget",
    "child": "testkit_regen_func",
    "media": "\n        <div id=\"testkit_regenerator\">\n        <input type = \"text\" id = \"testkit_exportName\" placeholder = \"new skeleton label\">\n        <button id=\"testkit_exportButton\">export skeleton</button>\n        <br>\n        <input type = \"text\" id = \"testkit_regenImport\" placeholder = \"skeleton label\">\n        <button id=\"testkit_regenButton\">regen navi</button>\n        </div>\n        "
  },
  "testkit_shop_func": {
    "uri": "xo.1051901904694690906",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "testkit shop applet",
    "media": "/quest/mod/testkit_dir/testkit_shop.js"
  },
  "testkit_shop_html": {
    "uri": "xo.1294189056906",
    "aux": "testkit",
    "kind": "html",
    "name": "testkit shop widget",
    "child": "testkit_shop_func",
    "count": 1,
    "media": "\n        <div>\n        <div id=\"testkit_shop\">\n        <b>department:</b>\n        <input type = \"text\" id=\"testkit_shop_depart\" placeholder=\"department\" value=\"Bob's Shop\">\n        <button id=\"testkit_shop_refresh\">refresh</button>\n        <br><i>receipts must have offer hash in memo</i>\n        <hr>\n        <div id=\"testkit_shop_list\"></div>\n        </div>\n        </div>\n        "
  },
  "testkit_store_gate_func": {
    "uri": "xo.6767690457739309523",
    "aux": "testkit",
    "kind": "jsmod",
    "name": "testkit move! applet",
    "media": "/quest/mod/testkit_dir/testkit_store_gate_func.js"
  },
  "testkit_store_gate_html": {
    "uri": "xo.346975705910570175",
    "aux": "testkit",
    "kind": "html",
    "name": "testkit move! widget",
    "child": "testkit_store_gate_func",
    "media": "\n        <div id=\"testkit_store_gate\">\n        <input type = \"text\" id = \"testkit_store_gate_Entry\" placeholder = \"index / key\">\n        <select id=\"testkit_store_gate_mode\">\n        <option value = \"cut\"> cut </option>\n        <option value = \"copy\"> copy </option>\n        </select>\n        <select id=\"testkit_store_gate_select\">\n        <option value = \"b2ls\">dvr -> ls</option>\n        <option value = \"ls2b\">ls -> dvr</option>\n        <option value = \"b2db\">dvr -> db</option>\n        <option value = \"db2b\">db -> dvr</option>\n        </select>\n        <button id=\"testkit_store_gate_Button\">move!</button>\n        </div>\n        "
  },
  "testkit_style_html": {
    "uri": "xo.764906239052624667",
    "aux": "testkit",
    "kind": "html",
    "name": "testkit styles :)",
    "media": "\n        <style>\n            .resizable {\n                overflow: auto;\n                resize: both; /* Allow both horizontal and vertical resizing */\n                box-sizing: border-box; /* Include padding and border in element's total width and height */\n            }\n            .draggable {\n            padding: 2px;\n            background-color: gold;\n            line-height: normal;\n            position: absolute;\n            cursor: move;\n            }\n            .dragged_content {\n            padding: 10px;\n            background-color: silver;\n            cursor: auto;\n            user-select: text;\n            }\n            .fineprint {\n                font-size: 13px;\n                font-weight: 300;\n                text-shadow: 0px 0px 2px SteelBlue;\n                letter-spacing: -1px;\n            }\n        </style>\n        "
  },
  "test_name_replace": {
    "uri": "xo.2346903701358935",
    "aux": "testkit",
    "kind": "js",
    "name": "testkit transform content!",
    "media": "\n            // DRY style -> list spitter interpreter future\n            console.log('transform?');\n            document.querySelectorAll('*').forEach((element) => {\n                if (element.childNodes.length === 1 && element.textContent.trim() === 'URLMUD') {\n                    const text = element.textContent;\n                    const index = text.indexOf('LM');\n                    if (index !== -1) {\n                        const link = document.createElement('a');\n                        link.href = 'https://wikipedia.org';\n                        link.textContent = 'LM'; // Text to be wrapped in the hyperlink\n                        const newText = text.substring(0, index) + '<a>' + link.outerHTML + '</a>' + text.substring(index + 2);\n                        element.innerHTML = newText; // Update the element with the new HTML\n                    }\n                }\n            });\n        "
  },
  "_testkit": {
    "uri": "xo.09024804588737648009809",
    "aux": "testkit",
    "kind": "meta",
    "name": "testkit meta registry",
    "registry": [
      "testkit_in",
      "navi_splash",
      "testkit_style_html",
      "drag_functions",
      "enclose_draggable",
      "fishtext",
      "testkit_maritime",
      "test_name_replace",
      "testkit_menu_html",
      "testkit_menu_func",
      "testkit_atc_html",
      "testkit_atc_func",
      "testkit_clerk_html",
      "testkit_clerk_func",
      "testkit_csspaint_html",
      "testkit_csspaint_func",
      "testkit_shop_html",
      "testkit_shop_func",
      "testkit_kiosk_html",
      "testkit_kiosk_func",
      "testkit_store_gate_html",
      "testkit_store_gate_func",
      "testkit_regen_html",
      "testkit_regen_func",
      "testkit_mount_html",
      "testkit_mount_func",
      "testkit_keychain_html",
      "testkit_keychain_func",
      "testkit_indexedDB",
      "bsv_script",
      "htmx_script",
      "htmx_observe",
      "testkit_destroy",
      "css_manager",
      "dom_reporter",
      "navi_exporter",
      "dom_reassignment",
      "testkit_grave",
      "testkit_memory",
      "skelly_proc"
    ]
  }
};