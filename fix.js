


/* QUEST */

/*  42164

CURRENT REPO PREPPED FOR 1.5
    
    renaming channel
        fix meta tag last
            requires latest navi
 x       rename uri to aux
 x           atc
 x           flippo dvrbox
 x   make sure regen doesnt strip static css
 x  fixed navi.js
 x       rename module mod
 x           routed jsmods to /mod/
 x   remove complex vending
 x       logs new address per vendor
 x           i think i will keep the hash strategy
 x               try out example_cost via request (?)
 x                   place receipt in subscription
 x   shop calls interpreter directly instead of chisa
 x       shop checks and adds subscriptions
    finish php server proxy -> update dispatcher with links
 x   finish httx header handling
 x       httx checks queryparam after header
 x       serve works
 x   give the damn fish proper caching
 x       discovered and solved caching of pointers
 x   dirbox serves /
 x   interpreter sends subscription txids
 x   changed dir -> dvr all files
 x   removed hardcoded interpreter from navi
 x   fineprint class added
 x   added subscription in navi
 x       rewrite dispatcher html to place subscription httxid into request for php file
 x           handle a failure with defaulting etc.
 x   modify clerk request bc chisa is one use 
 x   repair atc with channel
 x   splash chan
 x   clerk has no proc call
 x   split splash modes vertically
 x   shop calls navi instead of interpreter so we keep addons
 x   example_cost needs updating (alice.dir)
 x   check out 'problems' tab
    cssmanager should not overwrite bc then they dont get collected as cascade
    splash absolute view posting not inline window
 x   built keychain autologin page
 x   solve navi proc pruning now navi proc is perfected ! :)))
 x       higher domset c-z each subtract distance a-b in destroy, trace children updates
    reproc could include ordering of elements to preserve whos in front
 x   can only test live : sw.js + php(origin root) + mod complete
 x   pass dispatcher chan directly instead of via suddendeath
 x   draft webcentury /20XX/
    explain portal and user rights in xo page

bugs:

    change bgcolor 20xx go to xo go back it doesnt reproc

    only reassign styles that are custom so we dont spread site styles

    testkit_styles is compounding in cache when manually added via dir and reprocced (top of the cache list too)

    seems reproc is still broken leaving draggable specks sometimes (IS IT TRUE IDK)
    something about data-step one is preserving a draggable speck

    during reproc the css rules added that dont collide stay

    cant uncache hyperlink proc

    atc scrolls to top when dragged

    fish dont have any cache accountability
    why cant i add fish offline
    fish get trapped in static window with scroll

tasks: 

    webRTC signalling server encryptsafe to create p2p interactions

    draft political architecture /polarch/

    indexer WALTAR xo@waltar

    url shortenr

    offline mode page (world?)
        static off air -> logo on air

    reverse engineer opns minting

    mongodb

    assess permissions for every new program (alice variable)

    keychain:
        ask browser to treat like username pass for autofill
            create a seperate php page for logging in the browser needs a static entry point

    Utilize service workers to intercept and control requests to IndexedDB, enforcing any access control or encryption logic before allowing access to the data.

    chisa anticipates modules but what about html (php) from the url ?

    proc is going to grow fast we need trimming
        EXPORTER -> check if document.body calls are persisting

    utxo splitter for tx buffer during pending spend

    costly http requests (splash green) http signer app
        fetch alt for paidfetch() -> header tx -> check on server -> func call
        server checker for ANY url via header and path/query
            quest/httx/... UNNECESSARY - HEADERSZ
            <a href="" data-htxo="" data-addr=""></a>
            feed receipts if <duration
                <div hx-get="/path/to/resource" hx-headers='{"httx": "your_custom_string"}' hx-trigger="click">
                    const headers = new Headers();
                    headers.append("httx", "your_custom_string");
                    fetch('/path/to/resource', {
                        method: 'GET', // or 'POST'
                        headers: headers,
                    })

                    SET UP PHP-FPM TO RUN A DEDICATED PHP SERVER FOR FLIPPO
    
    open atc to sse

    identity address [secured] - ZKKSP + custodial 2fa
            vanity address [gen]
            opns [sign?]
            email [confirm]
            etc
        <meta> specify method <custodial signs on behalf of email conf etc>
        need a base identity handler that plugs into methods

    solicitude:
        vendor privacy care:
        sat-limit = the most u would want in one address
            automatically generate new addresses when nearing sat-limit and switch
                negotiate address index size

    csspaint - remove or toggle rules , bg-color for text cannot be set to nothing etc

    simpage:
        chain events and server 0conf (permissive multisig)

    exposing settings for functions in modules to drop into a settings applet
        those settings can be accessed at cache

    positional append of html

    point and click css like inspect

status:

    validation metric-
            if u cant validate layer 1 u use a trusted indexer

    does the server need to be trusted with vendor balances (zk?)
        design server to refer to vendors by pubkey (ppl can create hyper-solicitude)

    dir generation:
        dir machines are generated and assigned uri outside of the direct application

    logging tx:
        logging solicit generation and valid receipts for use limit,
        keeping hash memo for fallback point of failure.
            long - nft holder signing etc.

    uri may be domain based
        i suppose uri can look at domains but to be in a domain is to stake

    server function execution store, command + receipt in request

    streamline dependencies reporting and collection for modules
  
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

