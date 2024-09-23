export function activate_module(lain) {
    console.log('testkit shop module active');
    lain.rom.testkit_shop = () => {
        console.log('testkit shop is open');
        const refresh = () => {
            let department = testkit_shop_depart.value;
            console.log('refreshing shop', department)
            targetElement.innerHTML = ''; // Clear previous items
            fetch(alice.portal + '/flippo/vending/' + department)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    for (const key in data) {
                        const item = data[key];
                        const itemElement = document.createElement('div');
                        const itemContext = `<div><b>${item.keyName}</b> - ${item.price}⌀<br>${item.desc}</div>`;
                        itemElement.innerHTML = itemContext;
                        
                        const solicitor = document.createElement('div');
                        const solicitButton = document.createElement('button');
                        solicitButton.textContent = 'solicit offer';
                        solicitButton.id = `solicit-${item.keyName}`;
                        solicitor.appendChild(solicitButton);
                        if (lain.dvr[item.keyName].receipt.fee) { //add subfee logic one dae
                            const subscriptionInfo = document.createElement('div');
                            subscriptionInfo.innerHTML = `receipt found:<br><span class="fineprint">${lain.subs[item.path]}</span>`;

                            const validateButton = document.createElement('button');
                            validateButton.textContent = 'submit receipt';
                            validateButton.addEventListener('click', () => {
                                navi(lain, `JSON.parse('` + JSON.stringify({urns: `testkit`, kind: `jsmod`, name: item.keyName, media: `/flippo${item.path}`, httxid: lain.subs[item.path]})+ `')`);
                                itemElement.innerHTML = itemContext + '<div><i>service of listing requested</i></div>';
                            });
                            
                            itemElement.appendChild(solicitor);
                            itemElement.appendChild(subscriptionInfo);
                            itemElement.appendChild(validateButton);
                        } else {
                            const inputField = document.createElement('input');
                            inputField.placeholder = "txid";
                            inputField.id = `txFor-${item.keyName}`;

                            const submitButton = document.createElement('button');
                            submitButton.textContent = 'submit receipt';
                            submitButton.addEventListener('click', () => {
                                if (inputField.value.trim() !== "") { //btw this only works for jsmod bc of media
                                    const httxid_receipt = inputField.value;
                                    lain.dvr[item.keyName] = {urns: `testkit`, kind: `jsmod`, name: item.desc, media: `/flippo${item.path}`, receipt: {fee: httxid_receipt}};
                                    navi(lain, `'` + lain.dvr[item.keyName] + `'`);
                                    itemElement.innerHTML = itemContext + '<div><i>service of listing requested</i></div>';
                                    const subscribeButton = document.createElement('button');
                                    subscribeButton.textContent = 'subscribe receipt';
                                    subscribeButton.addEventListener('click', () => {
                                        lain.dvr[item.keyName].receipt.fee = httxid_receipt;
                                        itemElement.innerHTML = itemContext + '<div><i>subscribed via receipt!</i></div>';
                                    });
                                    itemElement.appendChild(subscribeButton);
                                }
                            });
                            
                            itemElement.appendChild(solicitor);
                            itemElement.appendChild(document.createElement('br'));
                            itemElement.appendChild(inputField);
                            itemElement.appendChild(submitButton);
                        }

                        solicitButton.addEventListener('click', function() {
                            // Replace button with a progress bar
                            const progressor = document.createElement('div');
                            const progressBar = document.createElement('progress');
                            progressBar.value = 0;
                            progressBar.max = 100;
                            progressor.appendChild(progressBar);
                            itemElement.replaceChild(progressor, solicitor);

                            // Simulate progress
                            let progress = 6;
                            const interval = setInterval(() => {
                                progress += 3;
                                progressBar.value = progress;
                                if (progress >= 100) {
                                    clearInterval(interval);
                                }
                            }, 100);
                            fetch(alice.portal + '/flippo/solicit/' + item.keyName)
                                        .then(response => response.json())
                                        .then(details => {
                                            const detailsElement = document.createElement('div');
                                            detailsElement.innerHTML = `<div><i>vendor address:</i><br><span class="fineprint">${details.address}</span></div>
                                                                        <div><i>offer hash:</i><br><span class="fineprint">${details.hash}</span></div>`;
                                            itemElement.replaceChild(detailsElement, progressor);
                                        })
                                        .catch(error => {
                                            console.error('Error fetching details:', error);
                                            const detailsElement = document.createElement('div');
                                            detailsElement.innerHTML = `<div><i>failed to fetch offer</i></div>`;
                                            itemElement.replaceChild(detailsElement, progressBar);
                                        });
                        });
                        targetElement.appendChild(itemElement);
                        targetElement.appendChild(document.createElement('hr'));
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }
        testkit_shop_refresh.addEventListener('click', function() {
            refresh();
        });
    }
    let targetElement = document.getElementById("testkit_shop_list");
    if (!targetElement) {
        console.error('shop listing element not found');
    }
    else {
        lain.rom.testkit_shop();
    }
}