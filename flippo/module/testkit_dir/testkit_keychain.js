export function activate_module(lain) {

    const target = document.getElementById('testkit_keychain');

    const newDiv = document.createElement('div');
    newDiv.innerHTML = "<b>custodial auto-sign</b><br><i>protected via shadow dom</i><br>";
    const pmDiv = document.createElement('div');
    pmDiv.innerHTML = 
    `
    <form id="login-form" action="#" method="post">
    <table><tr>
        <td><label for="username">public label: </label></td>
        <td><input type="text" id="username" name="username" autocomplete="username" required></td>
        </tr><tr>
        <td><label for="password">private key:</label></td>
        <td><input type="password" id="password" name="password" autocomplete="current-password" required></td>
        </tr>
    </table>
        <button type="submit">sign-in</button>
    </form>
    `;



    // Function to handle login
    function handleLogin(event) {
      event.preventDefault(); // Prevent the form from submitting

      const username = pmDiv.querySelector('#username').value;
      const password = pmDiv.querySelector('#password').value;
      pmDiv.querySelector('#username').value = '';
      pmDiv.querySelector('#password').value = '';
      // Handle login logic here
      console.log('Username:', username);
      console.log('Password:', password);

      // Simulate a successful login for the browser's password manager
      if (typeof PasswordCredential === 'function') {
          const credentials = new PasswordCredential({
              id: username,
              password: password,
              name: 'User'
          });
          navigator.credentials.store(credentials).then(() => {
              console.log('Credentials stored');
          }).catch(err => {
              console.error('Error storing credentials:', err);
          });
      }
    }

    // Attach the login handler to the form before adding it to the DOM
    const form = pmDiv.querySelector('#login-form');
    form.addEventListener('submit', handleLogin);

    // Append input field and button to the wrapper
    target.secure(newDiv);
    target.secure(document.createElement('hr'));
    target.secure(pmDiv);
    target.secure(document.createElement('br'));

}