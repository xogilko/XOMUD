///HTML PORTION
<testkit-shadow id="waltar_ground"></testkit-shadow>

///JS PORTION

const target = document.getElementById('waltar_ground');
target.style.maxWidth = '500px';
if (target.parentElement.parentElement.classList.contains('draggable')) {
    target.parentElement.parentElement.style.backgroundColor = 'black';
}

let clearableElements = [];

function setupClearableElement(element) {
    clearableElements.push(element);
    return element;
}

function clearElements() {
    clearableElements.forEach(element => element.remove());
    clearableElements = [];
}

function returnToMainOptions(successMessage = null) {
    clearElements();
    
    if (lain.profile['waltar_token']) {
        const connectedText = setupClearableElement(document.createElement('div'));
        connectedText.textContent = 'connected!';
        connectedText.style.color = 'green';
        connectedText.style.fontWeight = 'bold';
        target.secure(connectedText);
    } else {
        const connectButton = setupClearableElement(document.createElement('button'));
        connectButton.textContent = 'Connect';
        connectButton.addEventListener('click', () => showLoginForm());

        const registerButton = setupClearableElement(document.createElement('button'));
        registerButton.textContent = 'Register';
        registerButton.addEventListener('click', () => showRegisterForm());

        target.secure(connectButton);
        target.secure(registerButton);
    }
}

function showRegisterForm() {
    clearElements();
    
    const hasKeychain = typeof lain.rom.keychain_sig_request === 'function';
    
    const formContainer = setupClearableElement(document.createElement('div'));
    
    const errorMessage = setupClearableElement(document.createElement('div'));
    errorMessage.style.color = 'red';
    errorMessage.style.marginBottom = '10px';
    errorMessage.style.display = 'none';
    
    const emailInput = setupClearableElement(document.createElement('input'));
    emailInput.placeholder = 'Email';
    
    const passwordInput = setupClearableElement(document.createElement('input'));
    passwordInput.placeholder = 'Password';
    passwordInput.type = 'password';
    
    const usernameInput = setupClearableElement(document.createElement('input'));
    usernameInput.placeholder = 'Public Key';

    const submitButton = setupClearableElement(document.createElement('button'));
    submitButton.textContent = 'Sign';
    
    let warningText;
    if (!hasKeychain) {
        submitButton.disabled = true;
        warningText = setupClearableElement(document.createElement('span'));
        warningText.textContent = 'keychain inactive';
        warningText.style.color = 'red';
        warningText.style.marginLeft = '10px';
    }

    const clearForm = () => {
        emailInput.value = '';
        passwordInput.value = '';
        usernameInput.value = '';
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    };

    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };

    submitButton.addEventListener('click', async () => {
        errorMessage.style.display = 'none';
        
        const messageObj = {
            publicKey: usernameInput.value,
            timestamp: new Date().toISOString()
        };
        
        try {
            const signature = await lain.rom.keychain_sig_request(JSON.stringify(messageObj));
            console.log('Signature generated:', signature);
            
            const data = {
                "username": usernameInput.value,
                "email": emailInput.value,
                "emailVisibility": true,
                "password": passwordInput.value,
                "passwordConfirm": passwordInput.value,
                "name": usernameInput.value,
                "signature": signature
            };
            console.log('Sending registration data:', data);

            const response = await fetch(lain.portal + 'arch/waltar_register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Server response status:', response.status);
            
            if (response.ok) {
                const responseText = await response.text();
                console.log('Registration successful:', responseText);
                clearForm();
                returnToMainOptions();
            } else {
                const responseData = await response.json();
                console.log('Registration failed:', responseData);
                if (responseData.error) {
                    try {
                        const pbError = JSON.parse(responseData.error.replace('PocketBase error: ', ''));
                        if (pbError.data) {
                            const errors = [];
                            for (const field in pbError.data) {
                                const message = pbError.data[field].message.replace('username', 'public key');
                                errors.push(message);
                            }
                            showError(errors.join('\n'));
                        } else {
                            showError(pbError.message.replace('username', 'public key'));
                        }
                    } catch (e) {
                        console.log('Error parsing response:', e);
                        showError(responseData.error.replace('username', 'public key'));
                    }
                } else {
                    showError('Registration failed');
                }
            }
        } catch (error) {
            console.log('Registration error:', error);
            showError('Error during registration process');
        }
    });

    const backButton = setupClearableElement(document.createElement('button'));
    backButton.textContent = 'Back';
    backButton.addEventListener('click', returnToMainOptions);

    target.secure(formContainer);
    formContainer.appendChild(errorMessage);
    target.secure(emailInput);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(passwordInput);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(usernameInput);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(submitButton);
    if (!hasKeychain) {
        target.secure(warningText);
    }
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(backButton);
}

function showLoginForm() {
    clearElements();
    
    const formContainer = setupClearableElement(document.createElement('div'));
    
    const errorMessage = setupClearableElement(document.createElement('div'));
    errorMessage.style.color = 'red';
    errorMessage.style.marginBottom = '10px';
    errorMessage.style.display = 'none';
    
    const emailInput = setupClearableElement(document.createElement('input'));
    emailInput.placeholder = 'Email';
    
    const passwordInput = setupClearableElement(document.createElement('input'));
    passwordInput.placeholder = 'Password';
    passwordInput.type = 'password';

    const connectButton = setupClearableElement(document.createElement('button'));
    connectButton.textContent = 'Connect';
    
    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };

    connectButton.addEventListener('click', async () => {
        errorMessage.style.display = 'none';
        
        const data = {
            "email": emailInput.value,
            "password": passwordInput.value
        };

        try {
            const response = await fetch(lain.portal + 'arch/waltar_login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Server response status:', response.status);
            const responseData = await response.json();
            console.log('Server response:', responseData);
            
            if (response.ok) {
                console.log('Connection successful');
                if (responseData.token && responseData.id) {
                    lain.profile['waltar_token'] = responseData.token;
                    lain.profile['waltar_id'] = responseData.id;
                    returnToMainOptions();
                } else {
                    showError('Invalid server response');
                }
            } else {
                console.log('Connection failed:', responseData);
                if (responseData.message) {
                    if (responseData.data && responseData.data.identity) {
                        showError('Invalid email or password');
                    } else {
                        showError(responseData.message);
                    }
                } else {
                    showError('Connection failed');
                }
            }
        } catch (error) {
            console.log('Connection error:', error);
            showError('Error during connection process');
        }
    });

    const backButton = setupClearableElement(document.createElement('button'));
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => returnToMainOptions());

    target.secure(formContainer);
    formContainer.appendChild(errorMessage);
    target.secure(emailInput);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(passwordInput);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(connectButton);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(backButton);
}

const boldText = document.createElement('b');
boldText.textContent = 'Waltar Phonebook';
boldText.style.color = "yellow";
boldText.style.textShadow = '2px 2px 3px black';
target.secure(boldText);
target.secure(document.createElement('br'));

const statusSpan = document.createElement('span');
statusSpan.id = 'status_span';
target.secure(statusSpan);
target.secure(document.createElement('hr'));

returnToMainOptions();
