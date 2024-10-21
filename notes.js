/*  42164 */

/* october 20

Vstream aux resolve (arch/woc)
DBS-> host/chan/user context aux ?
AUX _meta:discriminate logic conditions
_dbs_meta: rename to handle duplicate
simpage

AUTH- AT protocol/hypercloud/key?
add to DBS context user profile

Shop + publishing to aux

vstream mutable state- edit/update ART - datapoints update via simpage
(flippo must defensively throttle AUX)


xxxx

    dbs() checks _aux.json for compose permission which bsv_testnet denies

*/


/* october 19

    i need to cache stuff at flippo and check /arch/ for that before whatsonchain

    >____
        L-- ARCH
        |    L-FLIPPO
        L-- WOC

    incase of tx data
        flippo: "I dont know the latest state but i cache tx"
        woc: "I know latest state of the chain"


    /httx
    temporarily store httxid as:
    {
        render: {ss_extract},
        origin: {WOC JSON}
    }
    returning html ignores pref (?) check attribute resilience
    return art - uri = httxid
    
>>    dbs does not provide host aux alongside rq aux

    */

/* BUGS

    publisher needs to filter out comments
    update ts to match js when u home
    clerk imports may be broken (?) works fine but at reproc:
        importing async: fish_skin.js navi.js line 42 > eval line 7 > eval:43:29
        fish_skin.js handled navi.js line 42 > eval line 7 > eval:43:29
        Loading failed for the module with source “blob:https://xomud.quest/fffe4659-11c6-4972-9fa8-c6f489eaff8e”. xo:5:53
        Error during mod import: TypeError: error loading dynamically imported module: blob:https://xomud.quest/fffe4659-11c6-4972-9fa8-c6f489eaff8e

    it is still possible to break reproc, probably when u confuse order of proc aka domset mismatch
        dom reassign needs to robustly reassess proc integrity
        i think this should be the responsibilty of initProc
        sometimes demoproc falls out of proc somehow too

    cssmanager should not overwrite bc then they dont get collected as cascade
        change bgcolor 20xx go to xo go back it doesnt reproc
        testkit_styles is compounding in cache when manually added via dir and reprocced (top of the cache list too)
        during reproc the css rules added that dont collide stay
    cant uncache hyperlink proc
    why cant i add fish offline
    fish get trapped in static window with scroll
*/
/* TASKS:

chunking art to reduce requests
splash absolute view posting not inline window
positional append of html
add z-dist attribute to preserve layers
robust proc reordering
url shortenr
reverse opns minting
*/
/*(concept) CSS PAINTER+
    csspaint - remove or toggle rules , bg-color for text cannot be set to nothing etc
    point and click css like inspect
    style reassign exemption in dvr,
        what if item turns blue after initialization process, reproc would do it too early
    */
/*(concept) SETTINGS HUB
        exposing settings for functions in modules to drop into a settings applet
        those settings can be accessed at cache / lain.profile
    */
/*(concept) LUA SERVER FUNCTIONS
    RESTFUL ART: art (js?) has callback api(node?php?) code for atomized rest(htmx?)
    server function execution store, command + receipt in request
    */
/*(concept) CLIENT AUX FILTERING
        navi options to set captcha degree for aux interaction
        arch api etc: ieau/@hypercloud/catproofed/x
    */
/*(concept) WEBRTC SIGNALLING SERVERS
     encryptsafe to create p2p interactions
    */
/*(concept) SIMPAGE:
    chain events and server 0conf (permissive multisig)
*/
/*(concept) HTTX KEYCHAIN (clientside)
        costly http requests (splash green) httx signer app
        utxo splitter for tx buffer during pending spend
        solicitude: (vendorside)
            sat-limit = the most u would want in one address
            automatically generate new addresses when nearing sat-limit and switch
            negotiate address index size
*/
/*(concept) PHP VIA ISTREAM
    php can render php -> working on format for istream php for chan
    `   // Mapping of routes to their corresponding PHP files
        //fix:
        //broadcast(opns_route)->fetch--->safe-eval(routes_list[opns_route]=`chan_php`)->write html
        //compliment:
        //xo.php -> op_return -> figure out relative filepaths
        afaik - html snippets can be interpreted by a universal interpreter php file for channel spas using nesting
            universally check index of opns find chaninit utxo and use that html full page, children for snippets
*/
/*(concept) AIRPLANE MODE
    it seems like the next big move is offline mode. this will begin to resolve other pieces like dvr/subs dialectic
    try to keep things as optional as possible to avoid scaling issues... dvr should remain super lightweight.
    ?            chisa needs to check realworld dvr against aux b4 add2 list
        figure out how to ask for dvr, wholesale aux (?) or fine grain
    automatic caching:
            only cache html files ? perhaps the user configures??        
    apparently the following is already in prod->
        x            lain.profile confirms chisa to complete the following:
        x            match portal with memory portal {IMPORTANT}
        x                match aux with memory aux
        x                    if present( check _aux.meta for discrepency )
        x                        enumerate missing into LIST(obj [name]:[prop]) -corrosponds-> (name.json:{prop})
        x                    if not present
        x                        enumerate into LIST (check subs for receipts)
        X                IF ONLINE
        X                    /arch/dbs LIST -> dvr
        x                  /dbs inserts receipt into item object, path = [aux/name]
        x                _aux.meta instructs init_proc navi() command (OR loop LIST for dependencies?)
        X                    init_proc (with activation) -> decides demo/skelly_proc

        cache all documents; dispatcher, channels, navi.js (for offline use)
        INITIAL LOAD
            if we cannot reach xomud.quest(dispatcher) then proceed OFFLINE MODE
        OFFLINE MODE
            extract db.dispatch
                does this behave extremely different? (routes obviously different..)
                perhaps this should not be a cache of dispatch but a seperate file
                    that dispatch will allow sw to download discretely <offline_mode>
*/
/*(concept) DBS FEE MANAGEMENT 

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
    server gets aux/aux/../ (will compile -> send)
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
    
            *server gets aux:art (will compile -> send)
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
/*(concept) HTTX PAYMENT CONFIRMATION
    SKELLYKEY METHOD HASH CONFIRMS
        below is temporarily resolved with current hour as string mmddyyyyhh
        vendor gets a new address every hour, and can derive using every hour since registry
        therefore log every new vendor registry
    replace randseed in generation of address with a counter for each vendor
    modules should include json vendor details so i can query it like art
        currently:
            a transaction adjacent to an http request
                example_cost.js?httxid=x
        incoming/outgoing: quest/httx/target/path.js?httxid=id (or headers)
        target:
            address - fast/public
            uri@cert - fast/pseudo
            offerhash - slow/anon
        dynamic target generation-
            requires httx module
            special element requests href generation recolors hyperlink

*/

/* KEYS
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
/////////////////////////////////////////////////