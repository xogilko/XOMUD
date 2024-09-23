export function activate_module(lain) {
    
    lain.rom.store_gate = () => {
        const gate = () => {
            console.log('move!');
            const entryElement = document.getElementById("testkit_store_gate_Entry");
            let entry = entryElement.value;
            entryElement.value = '';
            let direction = document.getElementById("testkit_store_gate_select").value;
            if (direction === "b2ls" && lain.dvr.hasOwnProperty(entry)) {
                try {
                    localStorage.setItem(entry, JSON.stringify(lain.dvr[entry]));
                    if (testkit_store_gate_mode.value === 'cut'){
                        delete lain.dvr[entry];
                        lain.dvr[entry] = undefined;
                    }
                } catch (error) {
                    console.log("failed to send to local storage");
                }
            } else if (direction === "ls2b") {
                let storedItem = localStorage.getItem(entry);
                if (storedItem) {
                    try {
                        lain.dvr[entry] = JSON.parse(storedItem);
                        if (testkit_store_gate_mode.value === 'cut'){
                            localStorage.removeItem(entry);
                        }
                    } catch (error) {
                        console.log("failed to parse from local storage, maybe its not json");
                        console.log("putting a string in dvr ig :/");
                        try {
                            lain.dvr[entry] = storedItem;
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
            } else if (direction === "b2db") {
                if (lain.dvr.hasOwnProperty(entry)) {
                    lain.rom.dbModule.addData(lain.dvr[entry]).then(function(id) {
                        console.log('Data added to DB with ID:', id);
                        if (testkit_store_gate_mode.value === 'cut') {
                            delete lain.dvr[entry];
                            lain.dvr[entry] = undefined;
                        }
                    }).catch(function(error) {
                        console.log('Error adding data to DB:', error);
                    });
                } else {
                    console.log("entry not found in dvr");
                }
            } else if (direction === "db2b") {
                lain.rom.dbModule.getData(parseInt(entry, 10)).then(function(data) {
                    if (data) {
                        lain.dvr[entry] = data;
                        console.log('Data retrieved from DB and added to dvr:', entry);
                        if (testkit_store_gate_mode.value === 'cut') {
                            lain.rom.dbModule.deleteData(parseInt(entry, 10));
                        }
                    } else {
                        console.log("No data found in DB for ID:", entry);
                    }
                }).catch(function(error) {
                    console.log('Error retrieving data from DB:', error);
                });
            } else {
                console.log("Invalid direction or entry not found");
            }
        }
        console.log("movement armed");   
        document.getElementById('testkit_store_gate_Button').addEventListener('click', function() {gate();});
    }
    lain.rom.store_gate();
    
}