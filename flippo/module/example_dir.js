const example_dir = {
    "padlock":{
        "uri": "xo:hash",
        "urns": "xotestkit",
        "kind": "js",
        "name": "masterkey protection",
        "media": `
            
        var setupLocalStorage = (function() {

            // conditions met provides: ability to toggle lock, ability to bypass lock with prompting
            var keysToWatch = ["specificKey1", "specificKey2", "specificKey3"];
            // LOCKED
            var processCompleted = false;
            console.log("locked!");

            // ORIGINAL LOCAL STORAGE METHODS 
            var originalSetItem = localStorage.setItem;
            var originalRemoveItem = localStorage.removeItem;

            // BYPASS LOCK
            function confirmModification(key, value) {
                // PROMPT TO BYPASS
                var confirmation = confirm("Are you sure you want to modify?", key);
                return confirmation; // Return true if confirmed, false otherwise
            }

            // UNLOCKING CONDITIONS
            function conditionsMet() {
                
                var aliceLoggedIn = true; // Placeholder value for demonstration

                return aliceLoggedIn; // TRUE = CONDITIONS MET
            }

            // WRAPPER OF SET ITEM TO LOCAL STORAGE
            localStorage.setItem = function(key, value) {
                // IF IN-SCOPE LOCK IS LOCKED
                if (keysToWatch.includes(key) && !processCompleted) {
                    // IF CONDITIONS ARE NOT MET GTFO
                    if (!conditionsMet()) {
                        console.log("Conditions not met to unlock localStorage.");
                        return; // Exit without modifying localStorage
                    }

                    // GIVEN CONDITIONS ARE MET, CONFIRM A BYPASS OF LOCK
                    var confirmed = confirmModification(key, value);
                    if (!confirmed) {
                        console.log("Modification canceled."); // Log cancellation
                        return; // Exit without modifying localStorage
                    }
                }
                
                // OUTSIDE OF SCOPE OR UNLOCKED, DEFAULT LOCAL STORAGE METHOD
                originalSetItem.call(localStorage, key, value);
            }

            // WRAPPER OF REMOVE ITEM TO LOCAL STORAGE
            localStorage.removeItem = function(key) {
                // IF IN-SCOPE LOCK IS LOCKED
                if (keysToWatch.includes(key) && !processCompleted) {
                    // IF CONDITIONS ARE NOT MET GTFO
                    if (!conditionsMet()) {
                        console.log("Conditions not met to unlock localStorage.");
                        return; // Exit without modifying localStorage
                    }

                    // GIVEN CONDITIONS ARE MET, CONFIRM A BYPASS OF LOCK
                    var confirmed = confirmModification(key, "undefined");
                    if (!confirmed) {
                        console.log("Removal canceled."); // Log cancellation
                        return; // Exit without modifying localStorage
                    }
                }
                
                // OUTSIDE OF SCOPE OR UNLOCKED, DEFAULT LOCAL STORAGE METHOD
                originalRemoveItem.call(localStorage, key);
            }

            // EXPOSE THE TOGGLE LOCK
            return function() {
                // CONDITIONS AINT MET THO? GTFO
                if (!conditionsMet()) {
                    console.log("Conditions not met to unlock localStorage.");
                    return; // Exit without toggling completion state
                }

                // GIVEN CONDITIONS ARE MET, TOGGLE LOCK
                processCompleted = !processCompleted;
                console.log("Process completed:", processCompleted);
            };
        })();
        `
    },
}
try{
    Object.keys(example_dir).forEach(key => {
        alice.dir[key] = example_dir[key];
    });
    console.log("example_dir deployed")
    } catch (error) {
        console.log("failed to deploy example_dir to alice:", error);
    }