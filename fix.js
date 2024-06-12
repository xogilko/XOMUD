


/* QUEST */

/*  

current: 


bugs:

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
            quest/httx/...
            <a href="" data-htxo="" data-addr=""></a>
    
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

    simpage:
        chain events and server 0conf (permissive multisig)

    exposing settings for functions in modules to drop into a settings applet
        those settings can be accessed at cache

    positional append of html

    point and click css like inspect

status:

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
