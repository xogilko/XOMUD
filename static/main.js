document.addEventListener('DOMContentLoaded', () => {
    dream(); cli_init(); drag_init(); 
});

//////* PENDING QUESTS *///////
/*XANIFICATION OF THE ARCHITECTURE
    god says:
        J spades, 6 diamonds, 2 clubs = 2
        4 spades, 2 spades, J clubs = 8
        8 clubs, 4 clubs, 6 diamonds = 9 aka roadmap dis shit
    triple layer interface:
    interactive
        scripting and beyond
    structure
        notation parsing
    content
        addressible octet anarchy

enfilade?

 */
/* PUBLISH
    combine main site with a demo
    upload program to hosting
*/
/* HYPERMEDIA EXAMPLE CASE
        put draggables in context
        create an example for dynamic scripting
        dropdown - based on inputs and events
            requires tom-select.js + plugins OR select2 based on user preference
            import a script and css
            generating unique IDs for element ids? vs classes?
*/
/* INTEGRATE RAMA
    design overlay demo
        clusters interop via BVM
*/
/* DYNAMIC SCRIPT INIT
        make userscript manager observer
        dynamic element init (copy dream)
        syntax for script indexing
*/
/* DRAGGABLE REPL
        htmx is dropping swoops if the server cant keep up. only reset stick on arrival
        find an alternative to timeout() for discoveing 1 ping of a request<?>
*/
///////////////////////////////
/*//////   BLUEPRINT   ///////

  << RESOURCE >>              (( POLICY ))                [[ TARGET ]]
  
    the default final target is the dom and the default namespace is xml
  
user --> <<userscript>> <--> [[navi(dom)]] <-- parser <-- hypermedia <-- query

the uniform interface is a system that emerges from constraints
these ensure that the state is navigated via representations of hypermedia
<server> <hypermedia> <client>
hypermedia = media that expresses its own context w/ explicit controls
a hypermedia client is a general interface that can interpret hypermedia,
without prior understanding of the intent of the media it is interpreting
the web browser is a hypermedia client that interprets HTML
XML = cross-compatible generic extensible markup language for arbitrary media

using the web browser as the core architecture,
for the generic rendering of arbitrary hypermedia;
to create an extension-oriented uniform interface~
out-of-context parsing strategy based on target and resource
    z   the web browser (target) may be extended (by proxy) to interpret anything (XML etc)
    y   XML may be transformed (XSLT etc) before injection into the dom (HTML)
    x   dependency libraries may be initiated dynamically in the dom (navi target-proxy)
in-context cascading priority of rendering policy/method:
    1    server (domain conditions)
    2    resource (digital rights)
    3    client (user-agent preferences)
    3b   browser (user-agent defaults)
hypermedia must identify its scripting dependencies(x)
dynamic scripting may be handled using an index that contains:
    import identifier (in-context)
    import src address / library contents
    element init function
for modules, fetch may be intercepted and interpreted based on cache and index
elements may be intercepted to inject relevant <script> prior to swap into dom

    client:
        <xo>
        policy cascade convergence
        parsing index
        daemon network
        </xo>
        ++++++++++++++++<navi>++++++++++++++++++
        <html>
        <head/> <script> userscript manager [observer]
        <body/> <hypermedia>
        </html>
        [uri]   
        [cache]
        [localstorage]

    hypermedia:
        map [key hierarchy][value octet set (plaintext)]
        [parallel markup as set of objects][pemdas pluralism(hyperlinksfirst)]
        editing must track precise changes between versions (number shift) otherwise markup will break

    market:
            parsing, communicate the resources to target (third eye)
        Y      NAMESPACE      <language> 
        Y      TYPE           <element> <select>
        Y      STYLE          <libraries> <tomSelect>
            userscript, contextualize recieved resources (first eye)
        Y      FUNCTION       <userscripts, css> 
        Y      PRESENTATION   <intent, usecase>
        Y      UX
            daemoncraft, architecture, utility, faculties (second eye)
        Y      STORAGE         <cloud services>
        Y      COMPUTE         <hardware, clusters>
    
    parser:
        input -> data primitive (octet set etc)
        (policy cascade identifies: target and delivery)
        data -> target notation -> target
    navi:
        extends target (dom) to load dependencies before swapping html
*/

///// COMMAND LINE INTERFACE HANDLING

const swoop = () => {
    const scrollCli = document.getElementById('cli');
    scrollCli.scrollTop = scrollCli.scrollHeight;
    document.getElementById('embediframe').src = document.getElementById('entry-message').value;
    setTimeout(() => { document.getElementById('entry-message').value = 'https://'; }, 0);
};

const cli_init = () => {
    var command = document.getElementById("command-feed");
    const stringArray = ["this is the default cli log", "overlay cache and all that", "i forgot the old log", "this uses http requests and responses"];
    stringArray.forEach(item => {
        command.insertAdjacentHTML('beforeend', `<li>${item}</li>`);
    });
}

///// DRAGGABLE FRAMES HANDLING

const draggin = (e) => {
    const element = e.target;
    if (element.closest('.dragged_content')) return;

    e.preventDefault();
    const offsetX = e.clientX - element.getBoundingClientRect().left;
    const offsetY = e.clientY - element.getBoundingClientRect().top;

    const dragMove = (moveEvent) => {
        element.style.left = moveEvent.clientX - offsetX + 'px';
        element.style.top = moveEvent.clientY - offsetY + 'px';
    };

    const dragEnd = () => {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
    };

    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
};

const drag_init = () => {
const draggableElements = Array.from(document.getElementsByClassName('draggable'));
draggableElements.forEach(element => {
    element.addEventListener('mousedown', draggin);
});
}
