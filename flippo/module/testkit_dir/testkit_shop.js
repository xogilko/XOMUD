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

                        const inputField = document.createElement('input');
                        inputField.placeholder = "txid";
                        inputField.id = `txFor-${item.keyName}`;

                        const submitButton = document.createElement('button');
                        submitButton.textContent = 'submit receipt';
                        submitButton.addEventListener('click', () => {
                            if (inputField.value.trim() !== "") {
                                chisa({msg: `/flippo/dirmod/${item.keyName}`, tx: inputField.value});
                                itemElement.innerHTML = itemContext + '<div><i>service of listing requested</i></div>';
                            }
                        });

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
                                            detailsElement.innerHTML = `<div><i>vendor address:</i><br>${details.address}</div>
                                                                        <div><i>offer hash:</i><br>${details.hash}</div>`;
                                            itemElement.replaceChild(detailsElement, progressor);
                                        })
                                        .catch(error => {
                                            console.error('Error fetching details:', error);
                                            const detailsElement = document.createElement('div');
                                            detailsElement.innerHTML = `<div><i>failed to fetch offer</i></div>`;
                                            itemElement.replaceChild(detailsElement, progressBar);
                                        });
                        });
                        itemElement.appendChild(solicitor);
                        itemElement.appendChild(inputField);
                        itemElement.appendChild(submitButton);
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