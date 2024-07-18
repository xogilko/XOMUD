//flippo = fossos

/* QUEST */

/*  42164

current

    *****arch*****

    live notes:

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