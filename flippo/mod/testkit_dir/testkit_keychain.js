export function activate_module(lain) {

    const target = document.getElementById('testkit_keychain');

    navigator.serviceWorker.controller.postMessage({
        type: 'KEYCHAIN_INIT',
        data: {
            element: target
        }
    });

    const introtext = document.createElement('div');
    introtext.innerHTML = "<b>custodial auto-sign</b><br><i>protected via shadow dom</i><br>";

    const loginbutton = document.createElement('button');
    loginbutton.innerText = 'secure private key';
    loginbutton.addEventListener('click', function() {
        // give service worker the current page href and channel sub
        navigator.serviceWorker.controller.postMessage({
            type: 'KEYCHAIN_START',
            data: {
                origin: window.location.href,
                httxid: alice.subs["chan:" + window.location.pathname] || undefined
            }
        });
    });
    target.secure(introtext);
    target.secure(loginbutton);
    target.secure(document.createElement('hr'));

}