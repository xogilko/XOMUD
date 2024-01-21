document.addEventListener('DOMContentLoaded', () => {
    dream(); cli_init(); drag_init(); 
});

//////* PENDING QUESTS *///////

/* PUBLISH

    combine main site with a demo
    upload program to hosting
*/

/* DEEP REWRITE

    put draggables in context
        figure out the semantics
        create an example for dynamic scripting
            dropdown - based on inputs and events
            requires tom-select.js + plugins OR select2 based on user preference
                import a script and css
        generating unique IDs for element ids? vs classes?
            xslt templating for indexed constructor?
    need to map out step by step of possible scenario
        static typing ? --> default namespace (markup method)

    custom markup / annotations / overlapping connections upon the same media
        how to embed markup indirectly and stack ?
            flowchart of cascading markup

    integrate rama
    design overlay demo

    write userscript manager
        dynamic element init (copy dream)
        syntax for script indexing
*/

/* DRAGGABLE REPL
        htmx is dropping swoops if the server cant keep up. only reset stick on arrival
        find an alternative to timeout() for discoveing 1 ping of a request<?>
*/

///////////////////////////////

/*  BLUEPRINT

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
to create an extension-oriented (XML) uniform interface:
    z   the web browser may be extended (by proxy) to interpret anything (XML)
    y   XML may be transformed (XSLT etc) before injection into the dom (HTML)
    x   dependency libraries may be initiated dynamically in the dom
in-context cascading priority of rendering policy/method:
    1    server (domain conditions)
    2    resource (digital rights)
    3    client (user-agent preferences)
    4    browser (user-agent defaults)
hypermedia must identify its scripting dependencies(x)
dynamic scripting may be handled using an index that contains:
    import identifier (in-context)
    import src address / library contents
    element init function
for modules, fetch may be intercepted and interpreted based on cache and index
elements may be intercepted to inject relevant <script> prior to swap into dom

basic client anatomy:
    <xo template>
        conditional preferences, corpus
        xslt, css, userscripts
    </xo>
    <html>
    <head/> <script> userscript manager [observer]
    <body/> <hypermedia>
    </html>
    [uri]   
    [cache]
    [localstorage]
*/

////////////////// COMMAND LINE INTERFACE HANDLING

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

////////////////// DRAGGABLE FRAMES HANDLING

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
