lain.rom.waltar = async function() {
    console.log('waaaalt');
    const pb = new PocketBase('https://hypercloud.pockethost.io/');
    const testkitShadow = document.getElementById('testkit_waltarauth');
    
    if (testkitShadow) {
        const content = document.createElement('div');
        const heading = document.createElement('h1');
        heading.textContent = 'Submit Data to Hypercloud';
        content.appendChild(heading);

        const form = document.createElement('form');
        form.id = 'byForm';

        let usernameInput;

        const createInputField = (type, id, name, labelText) => {
            const label = document.createElement('label');
            label.setAttribute('for', id);
            label.textContent = labelText;
            form.appendChild(label);

            const input = document.createElement('input');
            input.type = type;
            input.id = id;
            input.name = name;
            input.required = true;
            form.appendChild(input);

            form.appendChild(document.createElement('br'));
            form.appendChild(document.createElement('br'));

            if (id === 'username') {
                usernameInput = input;
            }
        };

        createInputField('email', 'email', 'email', 'Email:');
        createInputField('password', 'password', 'password', 'Password:');
        createInputField('password', 'passwordConfirm', 'passwordConfirm', 'Confirm Password:');
        createInputField('text', 'username', 'username', 'Username:');
        createInputField('text', 'name', 'name', 'Name:');

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Submit';
        form.appendChild(submitButton);

        content.appendChild(form);

        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            const username = usernameInput.value;
            const data = { "field": username };

            const record = await pb.collection('test').create(data);
            console.log(record);
        });

        testkitShadow.secure(content);
        console.log('secure testkit shadow');
    }
};

lain.rom.waltar();



//// html from the page:
<h1>Submit Data to Hypercloud</h1>
<testkit-shadow id="testkit_waltarauth">
</testkit-shadow>