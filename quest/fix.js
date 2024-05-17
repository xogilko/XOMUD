


/* QUEST */

/*  

    navi.js code needs a disclaimer in comment and an explicit config for endpoint
    so i am distributing navi.js configured for xomud.quest

    the way menu calls navi ignores the context and therefore the launch array is empty on regen

    cant delete multiple html clones (only one actually but the rest no)

    demoproc check if a skeleton is there? default? if not then demo_proc?
    idk figure that shit out how does it know what skeleton to use at startup
    wallet preferences ? local storage masterkey?
*/


/*  LOW PRIORITY

    navigating pages, like ssr full html and then reproc onto it maintaining state

    window that takes html and saves it to dir
    would be nice to edit procs / modify directly exports
    
    track dependency funcs?

    padlock -
    protect localstorage via a process and closure from eval() manipulation:
    need to make sure the keystoWatch variable is protected, whether it be static or thru some other magic    

    add a service worker to reroute /command/ to 8081 etc
    a function that recieves responses that accepts objects to dir or docs to aux
*/