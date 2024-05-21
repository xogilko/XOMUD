const example_cost = {
    "testkit_register_sw":{
        "uri": "xo.389138909067605626",
        "urns": "xotestkit",
        "kind": "js",
        "name": "testkit transform content!",
        "media": `
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
              }, function(err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
              });
            });
          }
        `
    },
}
try{
    Object.keys(example_cost).forEach(key => {
        alice.dir[key] = example_cost[key];
    });
    console.log("example_cost deployed")
    } catch (error) {
        console.log("failed to deploy example_cost to alice:", error);
    }
