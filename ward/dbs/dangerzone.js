///HTML PORTION
<testkit-shadow id="bluesky_ground"></testkit-shadow>

///JS PORTION

const target = document.getElementById('bluesky_ground');
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

function showRegisterForm() {
    clearElements();
    
    const usernameInput = setupClearableElement(document.createElement('input'));
    usernameInput.placeholder = 'Public Key';
    const emailInput = setupClearableElement(document.createElement('input'));
    emailInput.placeholder = 'Email';
    const passwordInput = setupClearableElement(document.createElement('input'));
    passwordInput.placeholder = 'Password';
    passwordInput.type = 'password';

    const submitButton = setupClearableElement(document.createElement('button'));
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', async () => {
        const data = {
            "username": usernameInput.value,
            "email": emailInput.value,
            "emailVisibility": true,
            "password": passwordInput.value,
            "passwordConfirm": passwordInput.value,
            "name": usernameInput.value
        };

        try {
            const response = await fetch(lain.portal + '/arch/hypercloud_register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log('User registered successfully');
                returnToMainOptions();
            } else {
                const errorText = await response.text();
                console.error('Error registering user:', errorText);
            }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    });

    const backButton = setupClearableElement(document.createElement('button'));
    backButton.textContent = 'Back';
    backButton.addEventListener('click', returnToMainOptions);

    target.secure(usernameInput);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(emailInput);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(passwordInput);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(submitButton);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(backButton);
}

function showLoginForm() {
    clearElements();
    
    const usernameInput = setupClearableElement(document.createElement('input'));
    usernameInput.placeholder = 'Username';
    const passwordInput = setupClearableElement(document.createElement('input'));
    passwordInput.placeholder = 'Password';
    passwordInput.type = 'password';

    const submitButton = setupClearableElement(document.createElement('button'));
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', () => {
        loginWithCredentials(usernameInput.value, passwordInput.value);
    });

    const backButton = setupClearableElement(document.createElement('button'));
    backButton.textContent = 'Back';
    backButton.addEventListener('click', returnToMainOptions);

    target.secure(usernameInput);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(passwordInput);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(submitButton);
    target.secure(setupClearableElement(document.createElement('br')));
    target.secure(backButton);
}

function returnToMainOptions() {
    clearElements();
    
    const loginButton = setupClearableElement(document.createElement('button'));
    loginButton.textContent = 'Login';
    loginButton.addEventListener('click', showLoginForm);

    const registerButton = setupClearableElement(document.createElement('button'));
    registerButton.textContent = 'Register';
    registerButton.addEventListener('click', showRegisterForm);

    target.secure(loginButton);
    target.secure(registerButton);
}

const boldText = document.createElement('b');
boldText.textContent = 'Login';
target.secure(boldText);
target.secure(document.createElement('br'));

const statusSpan = document.createElement('span');
statusSpan.id = 'status_span';
target.secure(statusSpan);
target.secure(document.createElement('hr'));

returnToMainOptions();
