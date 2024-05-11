export function activate_module(lain) {
    
    lain.rom.store_gate = () => {
        const gate = () => {
            console.log('move!');
            entryElement = document.getElementById("testkit_store_gate_Entry");
            let entry = entryElement.value;
            entryElement.value = '';
            let direction = document.getElementById("testkit_store_gate_select").value;
            if (direction === "b2ls" && lain.dir.hasOwnProperty(entry)) {
                try {
                    localStorage.setItem(entry, JSON.stringify(lain.dir[entry]));
                    if (testkit_store_gate_mode.value === 'cut'){
                        delete lain.dir[entry];
                        lain.dir[entry] = undefined;
                    }
                } catch (error) {
                    console.log("failed to send to local storage");
                }
            } else if (direction === "ls2b") {
                let storedItem = localStorage.getItem(entry);
                if (storedItem) {
                    try {
                        lain.dir[entry] = JSON.parse(storedItem);
                        if (testkit_store_gate_mode.value === 'cut'){
                            localStorage.removeItem(entry);
                        }
                    } catch (error) {
                        console.log("failed to parse from local storage, maybe its not json");
                        console.log("putting a string in dir ig :/");
                        try {
                            lain.dir[entry] = storedItem;
                            if (testkit_store_gate_mode.value === 'cut'){
                                localStorage.removeItem(entry);
                            }
                        } catch (error) {
                            console.log("that didn't work either so giving up");
                        }
                    }
                } else {
                    console.log("item not found in local storage");
                }
            } else {
                console.log("something went wrong idk maybe its not in dir");
            }
        }
        console.log("movement armed");   
        document.getElementById('testkit_store_gate_Button').addEventListener('click', function() {gate();});
    }
    lain.rom.store_gate();
    
}