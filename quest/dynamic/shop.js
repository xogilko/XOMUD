//JS PORTION

export function activate_module(lain) {
    console.log('(shop) testkit shop module active');
    lain.rom.testkit_shop = () => {
        console.log('(shop) testkit shop is open');
        const refresh = () => {
            let department = testkit_shop_depart.value;
            console.log(`(shop) refreshing shop for department: ${department}`)
            targetElement.innerHTML = ''; // Clear previous items
            fetch(lain.portal + 'arch/vending/' + department)
                .then(response => {
                    console.log('(shop) fetch response received');
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('(shop) data fetched successfully');
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
                        if (lain.dvr[item.keyName] && lain.dvr[item.keyName].httxid) { //add subfee logic one dae
                            const subscriptionInfo = document.createElement('div');
                            subscriptionInfo.innerHTML = `receipt found:<br><span class="fineprint">${lain.dvr[item.keyName].httxid}</span>`;

                            const validateButton = document.createElement('button');
                            validateButton.textContent = 'submit receipt';
                            validateButton.addEventListener('click', () => {
                                console.log('(shop) validate receipt clicked');
                                console.log('(shop) future dogs', `(${JSON.stringify({aux: `testkit`, kind: `jsmod`, name: item.keyName, media: `arch${item.path}`, httxid: lain.dvr[item.keyName].httxid})})`)
                                navi(lain, `(${JSON.stringify({aux: `testkit`, kind: `jsmod`, name: item.keyName, media: `arch${item.path}`, httxid: lain.dvr[item.keyName].httxid})})`);
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
                                console.log('(shop) submit receipt clicked');
                                if (inputField.value.trim() !== "") { //btw this only works for jsmod bc of media

                                    const httxid_receipt = inputField.value;
                                    lain.dvr[item.keyName] = {aux: `testkit`, kind: `jsmod`, name: item.desc, media: `arch${item.path}`, httxid: httxid_receipt};
                                    console.log('(shop) about to hit navi', lain.dvr[item.keyName]);
                                    navi(lain, `(${JSON.stringify(lain.dvr[item.keyName])})`);
                                    itemElement.innerHTML = itemContext + '<div><i>service of listing requested</i></div>';
                                    const subscribeButton = document.createElement('button');
                                    subscribeButton.textContent = 'subscribe receipt';
                                    subscribeButton.addEventListener('click', () => {
                                        console.log('(shop) subscribe receipt clicked');
                                        lain.dvr[item.keyName].httxid = httxid_receipt;
                                        itemElement.innerHTML = itemContext + '<div><i>subscribed via receipt!</i></div>';
                                    });
                                    itemElement.appendChild(subscribeButton);
                                }
                            });
                            
                            itemElement.appendChild(solicitor);
                            itemElement.appendChild(inputField);
                            itemElement.appendChild(submitButton);
                        }

                        solicitButton.addEventListener('click', function() {
                            console.log('(shop) solicit offer clicked');
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
                            fetch(lain.portal + 'arch/solicit/' + item.keyName)
                                        .then(response => response.json())
                                        .then(details => {
                                            console.log('(shop) solicit details fetched');
                                            const detailsElement = document.createElement('div');
                                            detailsElement.innerHTML = `<div><i>vendor address:</i><br><span class="fineprint">${details.address}</span></div>
                                                                        <div><i>offer hash:</i><br><span class="fineprint">${details.hash}</span></div>`;
                                            itemElement.replaceChild(detailsElement, progressor);
                                        })
                                        .catch(error => {
                                            console.error('(shop) Error fetching details:', error);
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
                    console.error('(shop) There was a problem with the fetch operation:', error);
                });
        }
        testkit_shop_refresh.addEventListener('click', function() {
            console.log('(shop) refresh clicked');
            refresh();
        });
    }
    let targetElement = document.getElementById("testkit_shop_list");
    if (!targetElement) {
        console.error('(shop) shop listing element not found');
    }
    else {
        console.log('(shop) shop listing element found');
        lain.rom.testkit_shop();
    }
}


//HTML PORTION

<div>
    <div id="testkit_shop">
        <b>department:</b>
        <input type="text" id="testkit_shop_depart" placeholder="department" value="Bob's Shop">
        <button id="testkit_shop_refresh">refresh</button>
        <br>
        <i>receipts must have offer hash in memo</i>
        <hr>
        <div id="testkit_shop_list"></div>
    </div>
</div>