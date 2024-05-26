


/* QUEST */

/*  
    https://unpkg.com/simpercell@1.0.1/navi.js
    static/navi.js

    ex:
    Private Key: cUWf3a2zgD3vfTcJiLKkv3MvCG7hRekCmXDMzE951gZkf7hkwqVF
    Public Key: 02843e3df01460e099dcf5cfb4f1cd190fae50fac53f28f5b24197aec325fff55d
    Public Address: mpyuybyu8suYfjDumBtp5KoXQo8QxqfrMK

    uri may be domain based
        i suppose uri can look at domains but to be in a domain is to stake

    positional append of html

    plug regen directly into db

    why cant i add fish offline

    servers being nice and offering simpage/0conf
    balancing server data with onchain power
        some sort of multisig ? uri

    fish get limited by window at top when page has box scroll

    point and click css id like inspect!

    cant delete multiple html clones (only one actually but the rest no)
    
    i can get regen to break idk how or why it does . fidget with it
  
    demoproc check if a skeleton is there? 
        uri testkit_blue = a proc that pulls out db skelly
*/


/*  LOW PRIORITY

    navigating pages, like ssr full html and then reproc onto it maintaining state

    window that takes html and saves it to dir
    would be nice to edit procs / modify directly exports
    
    track dependency funcs?

    padlock - protected content
*/

// Create the script element
const script = document.createElement('script');
script.src = "https://unpkg.com/simpercell@1.0.1/navi.js";

// Create the meta element
const meta = document.createElement('meta');
meta.setAttribute('portal', 'http://localhost:8080');
meta.setAttribute('uri', 'testkit');

// Append the meta element first
document.head.appendChild(meta);

// Append the script element and ensure it executes
document.head.appendChild(script);


chisa()
navi(alice, 'alice.rom.enclose_draggable(alice.dir.testkit_menu_html)', 'document.body')
