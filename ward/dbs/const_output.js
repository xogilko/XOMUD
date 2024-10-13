{
    "uri": "xo.874009938834",
    "aux": "testkit",
    "kind": "js",
    "name": "WALTAR hypercloud auth",
    "media": ""
}

lain.rom.waltar = () => {
    console.log('waaaalt');
            const pb = new PocketBase('https://hypercloud.pockethost.io/');
            document.getElementById('byForm').addEventListener('submit', async function(event) {
    console.log('submission?');
                const formData = new FormData(event.target);
                const data = {
                    email: formData.get('email'),
                    password: formData.get('password'),
                };
                try {
                    const record = await pb.collection('users').create(data);
                    console.log('Record created successfully:', record);
                    alert('Form submitted successfully!');
                } catch (error) {
                    console.error('Error creating record:', error);
                    alert('Failed to submit the form.');
                }
            }); 
            };
    lain.rom.waltar();

{
    "uri": "xo.8749920138834",
    "aux": "testkit",
    "kind": "html",
    "name": "WALTAR auth widget",
    "media": ""
}

    <testkit-shadow id="testkit_waltarauth">
<h1>Submit Data to Hypercloud</h1>
        <form id="byForm">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required><br><br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required><br><br>
        <button type="button">Submit</button>
        </form>
    </testkit-shadow>
