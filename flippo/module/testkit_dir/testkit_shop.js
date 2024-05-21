export function activate_module(lain) {
    console.log('testkit shop module active');
    lain.rom.testkit_shop= () => {
        console.log('testkit shop is open');
        const refresh = () => {
            let department = testkit_shop_depart.value;
            console.log('refreshing shop', department)
            targetElement.innerHTML = ''; // Clear previous items
            // http request flippo for a list of shop items
            // make list elements with purchase instructions
            // targetElement.innerHTML = list
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
                        itemElement.innerHTML = `<div><b>${item.keyName}</b> - ${item.price}⌀</div>`;
                        
                        const solicitButton = document.createElement('button');
                        solicitButton.textContent = 'solicit';
                        solicitButton.id = `solicit-${item.keyName}`;
                        solicitButton.addEventListener('click', function() {
                            // Replace button with a progress bar
                            const progressBar = document.createElement('progress');
                            progressBar.value = 0;
                            progressBar.max = 100;
                            itemElement.replaceChild(progressBar, solicitButton);

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
                                    // Replace progress bar with details
                                    itemElement.replaceChild(detailsElement, progressBar);
                                    const inputField = document.createElement('input');
                                    inputField.placeholder = "txid with hash in memo";
                                    inputField.id = `txFor-${item.keyName}`;
                                    const submitButton = document.createElement('button');
                                    submitButton.textContent = 'submit receipt';
                                    submitButton.addEventListener('click', () => {
                                        chisa({msg: `/flippo/dirmod/${item.keyName}`, tx: document.getElementById(`txFor-${item.keyName}`).value});
                                        detailsElement.removeChild(inputField);
                                        detailsElement.removeChild(submitButton);
                                        const serviceRequestedText = document.createElement('i');
                                        serviceRequestedText.textContent = 'service of listing requested';
                                        detailsElement.innerHTML = "";
                                        detailsElement.appendChild(serviceRequestedText);
                                    });

                                    detailsElement.appendChild(inputField);
                                    detailsElement.appendChild(submitButton);
                                })
                                .catch(error => {
                                    console.error('Error fetching details:', error);
                                    clearInterval(interval);
                                    itemElement.removeChild(progressBar);
                                });
                        });

                        itemElement.appendChild(solicitButton);
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