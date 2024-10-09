//flippo = fossos

/* QUEST */

/*  42164

// oct 8

i have some cool chess ideas

it seems initproc is reassigning before we get the skelly from sw
    i think whats really happening is initproc is becoming async, so skellyproc reassigns since the sync part is passed
    then initproc async op of getting sw response arrives, which triggers demoproc and by then its too late

1) if possible remove initproc from recording to proc.
    taking out this //if (!(evaluatedArgs.length > 0 && typeof evaluatedArgs[0] === 'string' && evaluatedArgs[0] === "specialCondition")) {
    attempting...
        now that ive written this, i need to make sure i update initproc and remove the % logic
    wait why doesnt alice.proc contain the rest of demoproc?
        its because demoproc is not called via the navi
        FIX
        if i dont trigger navi with initproc, then how could i reproc?

    navi
        pulls mem alice
        mem_dvr index -> dbs
        dbs -> dbs_dvr index
        dvr_init -> chisa
        init_proc(ghost)
            zero{navi(x)}
            !zero{skelly()}
    //in this case, there must be a navi() subtask to verify a previous testkit procrun
        this could be demo_proc which must navi instead of manual trigger
            create a demo_proc.json
            if demo_proc is in alice().proc, then skelly_regen else navi(demo_proc)

    so far i took out the toggle flipper
    replaced direct with navi(demo_proc)
        review skelly math
        reviewed. should i test? or figure out if i want to remove dependencies?
        instead of proc length check for specific proc - done
    testing...
        it seems to work! but... infinite loop. after reassign
            its because init_proc is in proc for some reason... i didnt update navi.js
                old navi
                //const oldnavi = {const alice = (() => {
                    const lain = {
                        profile: { 'sign': 'xo' },
                        portal: '',
                        chan: '',
                        domset: 0,
                        proc: [],
                        cache: [],
                        rom: {},
                        dvr: {}
                    };
                    lain.profile['miho'] = ['protocol', 'navi'];
                    const yasuo = () => {
                        //normally, yasuo checks the stack to carefully guard lain, but not todae
                        return true;
                    };
                    return (inputLain, email) => {
                        if (yasuo()) {
                            if (typeof inputLain === 'object') {
                                // If inputLain is an object, assign it to lain
                                Object.assign(lain, inputLain);
                            }
                            else if (typeof inputLain === 'string') {
                                // If inputLain is a string, treat it as an email
                                email = inputLain;
                            }
                            if (email)
                                lain.profile['miho'].push(email);
                            return email ? { success: true } : lain;
                        }
                        else {
                            console.error('Access denied');
                            return email ? { success: false } : null;
                        }
                    };
                })();
                const navi = function (lain, ...rest) {
                    console.log("✩ navi called ✩", arguments);
                    const eiri = (lain, input, ...rest) => {
                        const initInterpreter = (interpreter) => {
                            try {
                                eval(interpreter.media.replace(/\\n/g, '\n'));
                                lain.cache.push(interpreter);
                                console.log(`${interpreter.aux} onboard`);
                            }
                            catch (error) {
                                console.log(`Failed to onboard: ${interpreter.aux}`, error);
                            }
                        };
                        const interprate = (input) => {
                            console.log("Interpreeting", input.name);
                            let handler_origin = lain.cache.find(obj => obj.kind === "interpreter" && obj.aux === input.aux).media;
                            let handler_match = handler_origin.match(/(\S+?)\s*=\s*{/);
                            if (!handler_match) {
                                console.log(`Can't find handler obj name`);
                                return;
                            }
                            const handler = eval(handler_match[1]);
                            if (handler && typeof [handler] === "object" && handler != null) {
                                const functionHandler = handler[input.kind];
                                if (typeof functionHandler === "function") {
                                    try {
                                        functionHandler(input, ...rest);
                                        console.log(`${input.name} handled`);
                                    }
                                    catch (error) {
                                        console.log(`Failed to interpret ${input.name}`, error);
                                    }
                                }
                                else {
                                    console.log(`Can't find fooonction: ${input.kind} in handler: ${handler}`, JSON.stringify(handler));
                                }
                            }
                            else {
                                console.log(`Can't find handler: ${handler}`);
                            }
                        };
                        const canInterpret = lain.cache.some(obj => obj.kind === "interpreter" && obj.aux === input.aux);
                        console.log('can interpret:', input.name, canInterpret, lain.cache);
                        if (input.kind === "interpreter") {
                            if (canInterpret) {
                                console.log("Already mounted");
                            }
                            else {
                                try {
                                    initInterpreter(input);
                                    console.log(`${input.aux} interpreter mounted`);
                                }
                                catch (error) {
                                    console.log(`Failed to mount ${input.aux} interpreter`, error);
                                }
                            }
                        }
                        else {
                            if (!canInterpret) {
                                console.log(`Interpreter for ${input.aux} not found. Attempting to mount...`);
                                try {
                                    let interpreter = Object.values(lain.dvr).find(d => d.aux === input.aux && d.kind === 'interpreter');
                                    if (!interpreter) {
                                        throw new Error(`Interpreter for ${input.aux} not found`);
                                    }
                                    initInterpreter(interpreter);
                                    console.log(`Interpreter for aux ${input.aux} mounted`);
                                }
                                catch (error) {
                                    console.log(`Failed to mount interpreter for aux ${input.aux}`, error);
                                    return;
                                }
                            }
                            try {
                                console.log('u caught the snake');
                                interprate(input);
                            }
                            catch (error) {
                                console.log(`Failed to interpret ${input.name}`, error);
                            }
                        }
                    };
                    try {
                        const evaluatedArgs = rest.map(arg => eval(arg));
                        if (!(evaluatedArgs.length > 0 && typeof evaluatedArgs[0] === 'string' && evaluatedArgs[0] === "specialCondition")) {
                            eiri(lain, ...evaluatedArgs);
                        }
                        lain.proc.push(rest);
                    }
                    catch (error) {
                        console.log('navi error: ', error);
                    }
                    return { lain };
                };
                const protocol = async function () {
                    console.log('"da wings of application state"');
                    let lain = alice();
                    const meta = Array.from(document.getElementsByTagName('meta')).reduce((acc, tag) => {
                        Array.from(tag.attributes).forEach(attr => {
                            acc[attr.name] = attr.value;
                        });
                        return acc;
                    }, {});
                    if (!meta['portal']) {
                        console.error('navi has no portal key');
                        return;
                    }
                    async function onboard() {
                        console.log(lain, "client requests init ✩");
                        lain.portal = meta['portal'];
                        lain.profile['starboard'] = [];
                        const hahahahaha = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ date: new Date().toISOString() })
                        };
                        const response = await fetch(lain.portal + 'arch/port/', hahahahaha);
                        if (response.ok) {
                            const token = await response.text();
                            try {
                                lain.profile['entry-plug'] = JSON.parse(token);
                                console.log('navi pilot locked! dae/time hash:', lain.profile['entry-plug']);
                            }
                            catch (error) {
                                console.error('failed to parse token:', error);
                                return;
                            }
                            await navigator.serviceWorker.ready;
                            navigator.serviceWorker.controller?.postMessage({ type: 'TXENEHT', data: lain.profile['entry-plug'] });
                        }
                        else {
                            console.error('error:', response.statusText);
                        }
                    }
                    async function bootstrap() {
                        return new Promise((resolve) => {
                            const messageChannel = new MessageChannel();
                            messageChannel.port1.onmessage = function (event) {
                                if (event.data.data) {
                                    console.log('navi bootstrap parsing:', lain, event.data);
                                    lain = JSON.parse(event.data.data);
                                    alice(lain);
                                }
                                else {
                                    console.log('navi bootstrap failed, requesting init');
                                    onboard();
                                }
                                resolve();
                            };
                            console.log('navi bootstrap requesting memory');
                            navigator.serviceWorker.controller.postMessage({ type: 'MEM_GET', data: { key: "lain", id: 1 } }, [messageChannel.port2]);
                        });
                    }
                    async function preflight() {
                        if ('serviceWorker' in navigator) {
                            const registration = await navigator.serviceWorker.ready;
                            if (registration.active && navigator.serviceWorker.controller) {
                                await bootstrap();
                            }
                            else {
                                await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
                                if (!navigator.serviceWorker.controller) {
                                    console.log('service worker is not controlling the page. reloading...');
                                    window.location.reload();
                                }
                                else {
                                    await bootstrap();
                                }
                            }
                        }
                        else {
                            onboard();
                        }
                    }
                    try {
                        await preflight();
                        lain.chan = meta['chan'];
                        lain.profile['arch-config'] = { 'user-friendly': true, 'chan': lain.chan };
                        lain.profile['airplane-mode'] = !navigator.onLine;
                        if (lain.portal === meta['portal']) {
                            lain.profile['starboard'];
                            meta['aux'].split(',').forEach((aux) => {
                                if (!lain.profile['starboard'].includes(aux.trim())) {
                                    lain.profile['starboard'].push(aux.trim());
                                }
                            });
                            chisa(lain);
                        }
                        else {
                            console.error('portal mismatch');
                        }
                    }
                    catch (error) {
                        console.error('Error in preflight:', error);
                    }
                };
                const chisa = (lain) => {
                    function series() {
                        Object.values(lain.dvr).forEach(value => {
                            if (value.init) {
                                navi(lain, `lain.dvr.${value.init}`);
                            }
                        });
                    }
                    const route = window.location.pathname.split('/')[1];
                    if (route) {
                        document.body.classList.add(`chan-${route}`);
                    }
                    if (!lain.profile['airplane-mode']) {
                        let cc = [];
                        function collect(aux) {
                            let receipts = [];
                            let hasDirectFee = false;
                            let receipt = lain.dvr[aux]?.receipt?.fee;
                            if (receipt) {
                                receipts.push(`${aux};fee;${receipt}`);
                                hasDirectFee = true;
                            }
                            else {
                                receipt = lain.dvr[aux]?.receipt?.subfee;
                                if (receipt) {
                                    receipts.push(`${aux};sub;${receipt}`);
                                    let parentAux = aux;
                                    while (parentAux) {
                                        parentAux = parentAux.split('/').slice(0, -1).join('/');
                                        let parentReceipt = lain.dvr[parentAux]?.receipt?.fee;
                                        if (parentReceipt) {
                                            receipts.push(`${parentAux};fee;${parentReceipt}`);
                                            hasDirectFee = true;
                                            break;
                                        }
                                        else {
                                            parentReceipt = lain.dvr[parentAux]?.receipt?.subfee;
                                            if (parentReceipt) {
                                                receipts.push(`${parentAux};sub;${parentReceipt}`);
                                            }
                                            else {
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            const aux_meta = Object.values(lain.dvr).find(item => item.aux === aux && item.kind === "meta");
                            if (aux_meta) {
                                aux_meta.registry.forEach(art => {
                                    let artReceipt = lain.dvr[`${aux}/${art}`]?.receipt?.subfee;
                                    if (artReceipt) {
                                        receipts.push(`${aux}:&:${art};sub;${artReceipt}`);
                                    }
                                });
                            }
                            if (!hasDirectFee) {
                                receipts.push(`${aux}`);
                            }
                            return receipts.join(';;');
                        }
                        lain.profile['starboard'].forEach((aux) => {
                            let receipts = collect(aux);
                            if (receipts) {
                                cc.push(receipts);
                            }
                            else {
                                cc.push(aux);
                            }
                        });
                        const msg = {
                            from: window.location.href,
                            to: cc,
                            config: lain.profile['arch-config'],
                        };
                        const email = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(msg)
                        };
                        console.log(msg, "navi requests art ✩");
                        fetch(lain.portal + 'arch/dbs/', email)
                            .then(response => {
                            if (!response.ok) {
                                throw new Error('no response');
                            }
                            return response.json();
                        })
                            .then(response => {
                            Object.entries(response).forEach(([key, value]) => {
                                if (typeof value === 'object') {
                                    lain.dvr[key] = value;
                                }
                            });
                            console.log("➜✉: art is cast into dvr!", lain);
                        })
                            .catch(error => {
                            console.error('dvr download error:', error);
                        })
                            .finally(series);
                    }
                    else {
                        series();
                    }
                };
                document.addEventListener('DOMContentLoaded', protocol);
                //}
        i updated navi and its not executing navi(). prob new logic issue
        solved.
        
    ok i got the ignore to work,
    i did take out && typeof evaluatedArgs[0] === 'string' and i forgot why that was in there on evalarg check
    PROBLEM:
    some reason if i add to the proc, verify true, and then turn a corner, refresh, the sw serves a navi that only has demo_proc recorded

// oct 7

i dont think i want the bitcoin address to be the chan itself. "xo" should map to an address elsewhere
perhaps flippo should keep an index of address/chan pairs.

now that dbs feeds chan i need ward to return the address

i think art is cast into dvr via dbs should first check and see if we have the latest version already instead of reassigning
right now it just reassigns because it can. eventually we must optimize this.
    maybe navi should be given a hash of what is got, and give that to dbs via chisa along with chan, then dbs responds accordingly
        only handle hashes when we get to the precache stage

    lain.dvr['_dbs_meta']['chanAddress'] should contain the addy


// oct 6

404 star solved :)

// oct 3

init proc is redundant setting up service worker and memgetting

the extra logic is there because demo_proc is part of the proc in skelly

memset lain -> cant memget it

regen is working now. need to study how grave is getting proc? because im still not reprocing

im getting mind fucked by the init_proc logic but im pretty sure thats the only problem. 404 still there tho

// sept 30

dbs working - but star.xomud has 404 and /port is 404

i got /port working but star.xomud still 404 (nbd...)
no persistence.

// sep 22

i got ward to recieve the march requests but it doesnt seem to return something useful to the client
no more cors error doe

// august 24th

today we are working on the navi floating across reloads
init proc is not launching after sw check
    this means after checking for madelaine, its not running initproc in navi.js

everything below this line is out-of-bounds process
---------------------------------------------------

its not regenning thats why atc aint workin
its refreshing the proc and reassigning good but its building new entry plug and lain dont last

i see- 
    yahou needs protocol() to tell it that madelaine lain is alice().
    SERVICE WORKER - sending poor reprocs returning successfully with data undefined
--------

get my cord back

istream
hypercloud
market/register

currently:

update dispatcher
    php can render php -> working on format for istream php for chan
    `   // Mapping of routes to their corresponding PHP files
        //fix:
        //broadcast(opns_route)->fetch--->safe-eval(routes_list[opns_route]=`chan_php`)->write html
        //compliment:
        //xo.php -> op_return -> figure out relative filepaths

make addr
   1         query woc for init tx,
   2         then get utxo of addr
   3             then list of tx of utxo sum, then by order of time, then via (client filter)
   4             then append to locale ()

        client filter-  
            navi options to set captcha degree for aux interaction
            arch api etc:
                    ieau
                    ieau/@hypercloud/catproofed/x
    afaik - html snippets can be interpreted by a universal interpreter php file for channel spas using nesting
            universally check index of opns find chaninit utxo and use that html full page, children for snippets
    we can have blinkenlight trigger splash with some context
    so we can look at whats happening on mobile

   1    init tx shape:
        type - html ->> html
        it has to be html to initialize a channel
                how can it even?
                    php vs token
                    token php organizes and sends it :) 
        use 1sat type field and place raw data after a meta field(?) in script for art
        sign tx with pubkey that also owns the address etc.

            parent tx: context tree
            refid: istream.addr.path.type.sum
            aux:   interpreter
            perms*: hashtags / user-friendly etc.
            kind: type/../
            media: html(<head>< navi v?><meta details><css src="/rootrefid/childrefid"></h><body>)

    tx parent-> cd

    each html page should have txid in meta chan
shop needs subs taken out

sub -

update - aux dbs update (), navi update, sw update, dispatch
write init_proc
it seems corner() is not called, when it is, skeleton not found
refresh and skelly is forgotten

on edge:
it appears skelly persists and not found

&(*^&(^ PASTE!))

update - aux dbs update (), navi update, sw update, dispatch

    *****arch*****

    live notes:

    i-stream
        address - webfeed interpreter
        send feed to address window
            connect enabling autosign

    it seems like the next big move is offline mode. this will begin to resolve other pieces like dvr/subs dialectic
    try to keep things as optional as possible to avoid scaling issues... dvr should remain super lightweight.
    
    dynamic dvr recall & alice() secure passage

    update list attempt
        x   /quest -> /arch
        x   navi.js urns -> aux

		x	turned all art into json grouped by aux, containing vendor info
        uniform art state
        x    demo in atc(lazily attached to domset)
        x    grave skellygen -> return alice
            in the interest of speed:
            memory.js -> eject alice into sw before skellygen
            this is better than processing alice in skellygen
             x   MEM_SET pass id
             x       now we do mem_set for alice then genskelly
             x   MEM_GET should specify id
             x   correct navi since memory.return wont exist
                write init_proc -> uses mem_get to id if demo or skellyproc
        x    aux ex dependency: art has reference prop with path
        x    art has receipt and subs is replaced with dvr.receipt
             x   navi updated does not chisa() art unless no aux fee (art fees)
             x   testkit_shop updated, also adds to dvr before navi()
             x    verify aux is user-friendly on server level (implicitly true unless defined)


    x    make sure navi passes any subkeys for arts in any aux
    x    seems like we are going to put vending info in dvr items ?
            what exactly are we redownloading if we preserve dvr
            we dont preserve dvr
            we only preserve proc, dom, css
            every reset loses dvr.
    >>          it appears we will need to begin work on ^offline mode
                preserve dvr in realworld
                chisa needs to check realworld dvr against aux b4 add2 list
        lua server functions
        navi starboard does not account for individual art properly,
        it only does to the extent that some art is missing from an aux when its needed
        somehow i need to record individual art requirements and also should i ?
        revisit after making offline mode work

    OFFLINE MODE-
        automatic caching:
            only cache html files ? perhaps the user configures?

    [navi
    x    protocol calls alice(), gets memory, inserts memory into lain.profile
    x    protocol calls chisa()
    ?        lain.profile confirms chisa to complete the following:
    x            match portal with memory portal {IMPORTANT}
    x                match aux with memory aux
    x                    if present( check _aux.meta for discrepency )
    x                        enumerate missing into LIST(obj [name]:[prop]) -corrosponds-> (name.json:{prop})
    x                    if not present
    x                        enumerate into LIST (check subs for receipts)
    X                IF ONLINE
    X                    /arch/dbs LIST -> dvr
                            /dbs inserts receipt into item object, path = [aux/name]
    x                _aux.meta instructs init_proc navi() command (OR loop LIST for dependencies?)
    X                    init_proc (with activation) -> decides demo/skelly_proc
    ]
    [testkit
    X    skellygen -> pass alice.dvr into memory
        clerk -> json -> mod
    ]
    [flippo
        [aux/name]	each dvr entry should contain its path httxid and vendor info
        /dbs
            recieve LIST -> compile json w fee check (if prop in json) -> respond compilation
    ]
    [dispatch

    ]
    [service worker

    x    protecting indexeddb read/writes so i can feed lain into memory
    x    give lain a JWT JSON web token to verify that it is authentic and pass to sw
    x        include session specific information into JWT
    x            lain fetches 
    x            flippo /user handler
    x            give sw token for auth
    x            instead of dvr, pass all of lain via memory
    x            no more manual db access
    x               x navi.js, x service, x dispatch, x grave, x memory
    x    // therefore remove db_memory manual
    x        // CHAIN DB_MEMORY TO SW_MEMORY INSIDE SW
    x            x navi, x service, x dispatch, x grave, x memory

        host aux should work on the same level of aux
        cache all documents; dispatcher, channels, navi.js (for offline use)

        INITIAL LOAD
            if we cannot reach xomud.quest(dispatcher) then proceed OFFLINE MODE
        OFFLINE MODE
            extract db.dispatch
                does this behave extremely different? (routes obviously different..)
                perhaps this should not be a cache of dispatch but a seperate file
                    that dispatch will allow sw to download discretely <offline_mode>
    ]

    //work on dbs
    fee check:
        fee property ensures individual fee
        subfee ensures parent fee
        no prop ensures parent fee / no fee
    i want art1 to be free regardless of aux1?
    art fee = null;
    'if u buy the 20 dollar package each item is 10 dollars, or if u dont, each item is 20 dollars'
        4 items: 60 dollars, or 80 dollars
    this is a slightly complex logic , need two types of fees.
    fee, subfee,
        art can bypass aux fee via 'fee' , does not with 'subfee'
    how do u handle aux/aux/art fees with 1 tx
        fee is always 1 tx, subfees should be append
            subs key should mention fee/subfee
    RECEIPTS NEED TO MENTION THEIR TARGET OTHERWISE SERVER IS CONFUSED

    page has aux 
    */
    /*    server gets aux/aux/../ (will compile -> send)
            aux dir has _aux.json
                $$ fee check _aux.json
                YES
                    PASS
                        if end of path
                            *compile registry art, next
                        else iterate
                    FAIL
                        compile error, next
                NO
                    if end of path
                        *compile registry art, next
                    else iterate
            else: compile error, next
    */
    /*    *server gets aux:art (will compile -> send)
            aux dir has _aux.json
                $$ fee check _aux.json
                YES
                    PASS
                        compile art, next
                    FAIL
                        compile error, next
                NO
                    $$ fee check aux/art.json
                    YES
                        PASS
                            compile art, next
                        FAIL
                            compile error, next
                    NO
                        compile art, next
            else: compile error, next
    */
    /*

    //simple profile preferences
        required tags for aux
        therefore page aux gets ignored at server level
        because of tag mismatch with profile :)
            lain.profile['select']= {"user-friendly" : true}

    HTTX PAYMENT CONFIRMATION

    SKELLYKEY METHOD HASH CONFIRMS
        below is temporarily resolved with current hour as string mmddyyyyhh
        vendor gets a new address every hour, and can derive using every hour since registry
        therefore log every new vendor registry
    replace randseed in generation of address with a counter for each vendor
        redis
            redis server
                vendor key = pubkey, iteration
            concurrently += iteration every generate address

    modules should include json vendor details so i can query it like art


    *//*

    *****HYPERCLOUD*****

    optional if u have satoshis
    faucet makes satoshis optional
    base registry requires sms conf
        assigns/accepts pubkey


    httx
        currently:
            a transaction adjacent to an http request
                example_cost.js?httxid=x
        [
            php: <>
            html: <>
            js: <> 
            static resources (?)
        ]
        incoming/outgoing: quest/httx/target/path.js?httxid=id (or headers)
        target:
            address - fast/public
            uri@cert - fast/pseudo
            offerhash - slow/anon
        dynamic target generation-
            requires httx module
            special element requests href generation recolors hyperlink

        btw atc upgraded to handle data
    
bugs:

    if dispatch cant find the route it loops

    cssmanager should not overwrite bc then they dont get collected as cascade
    change bgcolor 20xx go to xo go back it doesnt reproc
    testkit_styles is compounding in cache when manually added via dir and reprocced (top of the cache list too)
    during reproc the css rules added that dont collide stay
    cant uncache hyperlink proc
    atc scrolls to top when dragged
    why cant i add fish offline
    fish get trapped in static window with scroll

tasks:
    
    RESTFUL ART: art (js?) has callback api(node?php?) code for atomized rest(htmx?)
    style reassign exemption in dvr,
        what if item turns blue after initialization process, reproc would do it too early
    add z-dist attribute to preserve layers
    reorder proc to datastep
    webRTC signalling server encryptsafe to create p2p interactions
    draft political architecture /polarch/
    url shortenr
    splash absolute view posting not inline window
    offline mode page (world?)
    reverse engineer opns minting
    utxo splitter for tx buffer during pending spend
    costly http requests (splash green) http signer app
    solicitude:
        sat-limit = the most u would want in one address
        automatically generate new addresses when nearing sat-limit and switch
        negotiate address index size
    csspaint - remove or toggle rules , bg-color for text cannot be set to nothing etc
    simpage: chain events and server 0conf (permissive multisig)
    exposing settings for functions in modules to drop into a settings applet
        those settings can be accessed at cache
    positional append of html
    point and click css like inspect
    flippo php handling
        still broken. debug at star/flippo/chan/xo
        in the meantime permit channels with html / javascript plain
    server function execution store, command + receipt in request

status:

    does the server need to be trusted with vendor balances (zk?)
        design server to refer to vendors by pubkey (ppl can create hyper-solicitude)
    dir generation:
        dir machines are generated and assigned uri outside of the direct application
    logging tx:
        logging solicit generation and valid receipts for use limit,
        keeping hash memo for fallback point of failure.
            long - nft holder signing etc.
*/


/*
    https://unpkg.com/simpercell@1.0.1/navi.js
    static/navi.js

    ex:
    Private Key: cUWf3a2zgD3vfTcJiLKkv3MvCG7hRekCmXDMzE951gZkf7hkwqVF
    Public Key: 02843e3df01460e099dcf5cfb4f1cd190fae50fac53f28f5b24197aec325fff55d
    Public Address: mpyuybyu8suYfjDumBtp5KoXQo8QxqfrMK

    costly_module 942bbdcb05d578301775c6a129f926dd44a8a06fe9e5118e907ab7056ae0045e

    fb923ef3bae5d823e747506472c4aaba06caa681a6a7920af09c1526f8da8791

    testing sat address:
    xo:
    Private Key: cSDmCKaoz6mtcHnNkTccWzjQ9Pk4WsDbPJw4pf9bTAStnb2vaeSJ
    Public Key: 020a43f20da9c2f9df5c74ace9f23ccc24b8a2c95934884e3b89c41bbd8944220b
    Public Address: mydyvA3y4TXeVz75ay9ZKxerXxTeGXukzr
    20xx:
    Private Key: cSNUcbBTozSuYAMPsBqgGrBLsaUcgoBL6cNN969yv6XbjkJWTP1H
    Public Key: 0237185d5d9c5209cd42a63f1bf1eebb5fe43cbc0175686558aa6ce867d4fa3057
    Public Address: mpYEeYn4omiX151bh8m7s8kQD9y2z9aGgG
*/


// userscript

const script = document.createElement('script');
script.src = "https://unpkg.com/simpercell@1.0.1/navi.js";
const meta = document.createElement('meta');
meta.setAttribute('portal', 'http://localhost:8080');
meta.setAttribute('uri', 'testkit');
document.head.appendChild(meta);
document.head.appendChild(script);

chisa()
navi(alice, 'alice.rom.enclose_draggable(alice.dir.testkit_menu_html)', 'document.body')

/////////////////////////////////////////////////